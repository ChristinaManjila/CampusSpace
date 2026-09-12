const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data/postgres_db');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let dbMode = 'embedded'; // 'pg', 'pglite', or 'embedded'
let pgClient = null;
let pgliteInstance = null;

// Embedded relational storage engine in case pg / @electric-sql/pglite are not available
class EmbeddedPostgresEngine {
  constructor(dataDir) {
    this.dataDir = dataDir;
    this.tables = {
      users: [],
      venues: [],
      bookings: [],
      events: [],
      liked_events: []
    };
    this.autoIncrement = {
      liked_events: 1
    };
    this.loadFromDisk();
  }

  getFilePath(table) {
    return path.join(this.dataDir, `${table}.json`);
  }

  loadFromDisk() {
    for (const table of Object.keys(this.tables)) {
      const file = this.getFilePath(table);
      if (fs.existsSync(file)) {
        try {
          const content = fs.readFileSync(file, 'utf8');
          this.tables[table] = JSON.parse(content);
        } catch (e) {
          console.error(`Error loading table ${table} from disk:`, e.message);
          this.tables[table] = [];
        }
      }
    }
    // calculate auto-increment
    if (this.tables.liked_events.length > 0) {
      const maxId = Math.max(...this.tables.liked_events.map(r => Number(r.id) || 0));
      this.autoIncrement.liked_events = maxId + 1;
    }
  }

  saveToDisk(table) {
    const file = this.getFilePath(table);
    fs.writeFileSync(file, JSON.stringify(this.tables[table], null, 2), 'utf8');
  }

  async query(sql, params = []) {
    const trimmed = sql.trim();
    const upper = trimmed.toUpperCase();

    // DDL Statements
    if (upper.startsWith('CREATE TABLE') || upper.startsWith('CREATE INDEX') || upper.startsWith('ALTER TABLE')) {
      return { rows: [], rowCount: 0 };
    }

    // SELECT
    if (upper.startsWith('SELECT')) {
      // 1. SELECT * FROM users WHERE email = $1 OR username = $1
      if (trimmed.includes('FROM users')) {
        let results = [...this.tables.users];
        if (trimmed.includes('WHERE id = $1')) {
          results = results.filter(u => u.id === params[0]);
        } else if (trimmed.includes('email') || trimmed.includes('username')) {
          const val = (params[0] || '').toLowerCase();
          results = results.filter(u =>
            (u.email && u.email.toLowerCase() === val) ||
            (u.username && u.username.toLowerCase() === val)
          );
        }
        return { rows: results, rowCount: results.length };
      }

      // 2. SELECT * FROM liked_events WHERE user_id = $1 ...
      if (trimmed.includes('FROM liked_events')) {
        let results = [...this.tables.liked_events];
        if (trimmed.includes('WHERE user_id = $1 AND booking_id = $2')) {
          results = results.filter(l => l.user_id === params[0] && String(l.booking_id) === String(params[1]));
        } else if (trimmed.includes('WHERE user_id = $1')) {
          results = results.filter(l => l.user_id === params[0]);
        }
        return { rows: results, rowCount: results.length };
      }

      // 3. SELECT * FROM bookings
      if (trimmed.includes('FROM bookings')) {
        let results = [...this.tables.bookings];
        if (trimmed.includes('WHERE user_id = $1')) {
          results = results.filter(b => b.user_id === params[0]);
        } else if (trimmed.includes('WHERE status = $1')) {
          results = results.filter(b => b.status === params[0]);
        } else if (trimmed.includes("WHERE organizer_role = 'team_lead'") || trimmed.includes('organizer_role')) {
          results = results.filter(b => b.organizer_role === 'team_lead' || b.user_id === params[0]);
        } else if (trimmed.includes('WHERE id = $1')) {
          results = results.filter(b => String(b.id) === String(params[0]));
        }
        return { rows: results, rowCount: results.length };
      }

      // 4. SELECT * FROM venues
      if (trimmed.includes('FROM venues')) {
        let results = [...this.tables.venues];
        if (trimmed.includes('WHERE id = $1')) {
          results = results.filter(v => String(v.id) === String(params[0]));
        }
        return { rows: results, rowCount: results.length };
      }

      // 5. SELECT * FROM events
      if (trimmed.includes('FROM events')) {
        let results = [...this.tables.events];
        if (trimmed.includes('WHERE id = $1')) {
          results = results.filter(e => String(e.id) === String(params[0]));
        }
        return { rows: results, rowCount: results.length };
      }

      return { rows: [], rowCount: 0 };
    }

    // INSERT INTO liked_events (user_id, booking_id) VALUES ($1, $2) ON CONFLICT DO NOTHING
    if (upper.startsWith('INSERT INTO LIKED_EVENTS')) {
      const userId = params[0];
      const bookingId = String(params[1]);

      // Foreign key check: user_id must exist in users
      const userExists = this.tables.users.some(u => u.id === userId);
      if (!userExists) {
        throw new Error(`Foreign key violation: user_id ${userId} does not exist in users.`);
      }

      // Unique constraint check: (user_id, booking_id)
      const existing = this.tables.liked_events.find(l => l.user_id === userId && String(l.booking_id) === bookingId);
      if (existing) {
        if (upper.includes('ON CONFLICT')) {
          return { rows: [existing], rowCount: 0 };
        } else {
          throw new Error(`duplicate key value violates unique constraint "unique_user_booking"`);
        }
      }

      const id = this.autoIncrement.liked_events++;
      const record = {
        id,
        user_id: userId,
        booking_id: bookingId,
        created_at: new Date().toISOString()
      };
      this.tables.liked_events.push(record);
      this.saveToDisk('liked_events');
      return { rows: [record], rowCount: 1 };
    }

    // DELETE FROM liked_events WHERE user_id = $1 AND booking_id = $2
    if (upper.startsWith('DELETE FROM LIKED_EVENTS')) {
      const userId = params[0];
      const bookingId = String(params[1]);
      const initialLen = this.tables.liked_events.length;
      this.tables.liked_events = this.tables.liked_events.filter(
        l => !(l.user_id === userId && String(l.booking_id) === bookingId)
      );
      const deletedCount = initialLen - this.tables.liked_events.length;
      if (deletedCount > 0) {
        this.saveToDisk('liked_events');
      }
      return { rows: [], rowCount: deletedCount };
    }

    // INSERT INTO users
    if (upper.startsWith('INSERT INTO USERS')) {
      const user = {
        id: params[0],
        email: params[1],
        username: params[2],
        password: params[3],
        role: params[4],
        name: params[5],
        department: params[6],
        created_at: new Date().toISOString()
      };
      const idx = this.tables.users.findIndex(u => u.id === user.id || u.email === user.email || u.username === user.username);
      if (idx >= 0) {
        this.tables.users[idx] = { ...this.tables.users[idx], ...user };
      } else {
        this.tables.users.push(user);
      }
      this.saveToDisk('users');
      return { rows: [user], rowCount: 1 };
    }

    // INSERT INTO venues
    if (upper.startsWith('INSERT INTO VENUES')) {
      const venue = {
        id: String(params[0]),
        name: params[1],
        block: params[2],
        capacity: Number(params[3]),
        time: params[4],
        facilities: params[5],
        tags: params[6],
        x: Number(params[7]),
        y: Number(params[8])
      };
      const idx = this.tables.venues.findIndex(v => String(v.id) === String(venue.id));
      if (idx >= 0) {
        this.tables.venues[idx] = venue;
      } else {
        this.tables.venues.push(venue);
      }
      this.saveToDisk('venues');
      return { rows: [venue], rowCount: 1 };
    }

    // DELETE FROM venues WHERE id = $1
    if (upper.startsWith('DELETE FROM VENUES')) {
      const id = String(params[0]);
      const initial = this.tables.venues.length;
      this.tables.venues = this.tables.venues.filter(v => String(v.id) !== id);
      this.saveToDisk('venues');
      return { rows: [], rowCount: initial - this.tables.venues.length };
    }

    // INSERT INTO bookings
    if (upper.startsWith('INSERT INTO BOOKINGS')) {
      const booking = {
        id: String(params[0]),
        venue_id: String(params[1]),
        venue_name: params[2],
        event_name: params[3],
        date: params[4],
        start_time: params[5],
        end_time: params[6],
        people: Number(params[7]),
        purpose: params[8],
        organizer_name: params[9],
        organizer_email: params[10],
        organizer_role: params[11],
        user_id: params[12],
        status: params[13],
        requested_facilities: params[14],
        notes: params[15],
        created_at: new Date().toISOString()
      };
      const idx = this.tables.bookings.findIndex(b => String(b.id) === String(booking.id));
      if (idx >= 0) {
        this.tables.bookings[idx] = booking;
      } else {
        this.tables.bookings.push(booking);
      }
      this.saveToDisk('bookings');
      return { rows: [booking], rowCount: 1 };
    }

    // UPDATE bookings SET status = $1 WHERE id = $2
    if (upper.startsWith('UPDATE BOOKINGS SET STATUS = $1 WHERE ID = $2')) {
      const status = params[0];
      const id = String(params[1]);
      const booking = this.tables.bookings.find(b => String(b.id) === id);
      if (booking) {
        booking.status = status;
        this.saveToDisk('bookings');
        return { rows: [booking], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    }

    // INSERT INTO events
    if (upper.startsWith('INSERT INTO EVENTS')) {
      const event = {
        id: String(params[0]),
        title: params[1],
        description: params[2],
        date: params[3],
        start_time: params[4],
        end_time: params[5],
        venue: params[6],
        college: params[7],
        category: params[8],
        poster_url: params[9],
        registration_link: params[10],
        google_form_link: params[11],
        organizer: params[12],
        created_at: new Date().toISOString()
      };
      const idx = this.tables.events.findIndex(e => String(e.id) === String(event.id));
      if (idx >= 0) {
        this.tables.events[idx] = event;
      } else {
        this.tables.events.push(event);
      }
      this.saveToDisk('events');
      return { rows: [event], rowCount: 1 };
    }

    return { rows: [], rowCount: 0 };
  }
}

let embeddedEngine = null;

async function query(sql, params = []) {
  if (dbMode === 'pg' && pgClient) {
    return await pgClient.query(sql, params);
  } else if (dbMode === 'pglite' && pgliteInstance) {
    return await pgliteInstance.query(sql, params);
  } else {
    return await embeddedEngine.query(sql, params);
  }
}

async function initDb() {
  // Check if DATABASE_URL or pg is available
  if (process.env.DATABASE_URL) {
    try {
      const { Pool } = require('pg');
      pgClient = new Pool({ connectionString: process.env.DATABASE_URL });
      await pgClient.query('SELECT 1');
      dbMode = 'pg';
      console.log('✅ Connected to external PostgreSQL via DATABASE_URL');
    } catch (e) {
      console.warn('⚠️ Could not connect to DATABASE_URL, trying PGlite...', e.message);
    }
  }

  // Check if @electric-sql/pglite is available
  if (dbMode !== 'pg') {
    try {
      const { PGlite } = require('@electric-sql/pglite');
      pgliteInstance = new PGlite(DATA_DIR);
      dbMode = 'pglite';
      console.log('✅ Initialized native PGlite WASM PostgreSQL engine at', DATA_DIR);
    } catch (e) {
      dbMode = 'embedded';
      embeddedEngine = new EmbeddedPostgresEngine(DATA_DIR);
      console.log('✅ Initialized PostgreSQL relational disk persistence engine at', DATA_DIR);
    }
  }

  // 1. DDL Migrations
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR PRIMARY KEY,
      email VARCHAR UNIQUE NOT NULL,
      username VARCHAR UNIQUE NOT NULL,
      password VARCHAR NOT NULL,
      role VARCHAR NOT NULL,
      name VARCHAR NOT NULL,
      department VARCHAR,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS venues (
      id VARCHAR PRIMARY KEY,
      name VARCHAR NOT NULL,
      block VARCHAR NOT NULL,
      capacity INT NOT NULL,
      time VARCHAR,
      facilities TEXT,
      tags TEXT,
      x NUMERIC,
      y NUMERIC
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id VARCHAR PRIMARY KEY,
      venue_id VARCHAR NOT NULL,
      venue_name VARCHAR NOT NULL,
      event_name VARCHAR NOT NULL,
      date VARCHAR NOT NULL,
      start_time VARCHAR NOT NULL,
      end_time VARCHAR NOT NULL,
      people INT,
      purpose TEXT,
      organizer_name VARCHAR,
      organizer_email VARCHAR,
      organizer_role VARCHAR,
      user_id VARCHAR,
      status VARCHAR NOT NULL,
      requested_facilities TEXT,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS events (
      id VARCHAR PRIMARY KEY,
      title VARCHAR NOT NULL,
      description TEXT,
      date VARCHAR NOT NULL,
      start_time VARCHAR NOT NULL,
      end_time VARCHAR NOT NULL,
      venue VARCHAR NOT NULL,
      college VARCHAR,
      category VARCHAR,
      poster_url TEXT,
      registration_link TEXT,
      google_form_link TEXT,
      organizer VARCHAR,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS liked_events (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE,
      booking_id VARCHAR NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT unique_user_booking UNIQUE (user_id, booking_id)
    )
  `);

  // 2. Seed Demo Accounts for 4 exact roles
  const demoUsers = [
    {
      id: 'usr-admin',
      email: 'admin@campus.edu',
      username: 'admin',
      password: 'Admin@123',
      role: 'admin',
      name: 'Campus Facilities Administrator',
      department: 'Office of Campus Administration'
    },
    {
      id: 'usr-student',
      email: 'student@campus.edu',
      username: 'student',
      password: 'Student@123',
      role: 'student',
      name: 'Student Explorer',
      department: 'Computer Science & Engineering'
    },
    {
      id: 'usr-teamlead',
      email: 'teamlead@campus.edu',
      username: 'teamlead',
      password: 'TeamLead@123',
      role: 'team_lead',
      name: 'Team Lead',
      department: 'Robotics & FOSS Council'
    },
    {
      id: 'usr-maintenance',
      email: 'maintenance@campus.edu',
      username: 'maintenance',
      password: 'Maintenance@123',
      role: 'maintenance',
      name: 'Maintenance Officer',
      department: 'Campus Facilities & Estate Office'
    }
  ];

  for (const u of demoUsers) {
    await query(
      `INSERT INTO users (id, email, username, password, role, name, department)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [u.id, u.email, u.username, u.password, u.role, u.name, u.department]
    );
  }

  // 3. Seed Venues
  const initialVenues = [
    { id: '1', name: 'Main Auditorium', block: 'Convention Complex', capacity: 1200, time: '8:00 AM – 8:00 PM', facilities: JSON.stringify(['Stage','Sound System','AC','Balcony Seating','Green Rooms','Wi-Fi']), tags: JSON.stringify(['auditorium','large','stage','ac']), x: 50, y: 55 },
    { id: '2', name: 'Seminar Hall 1', block: 'CS Block', capacity: 180, time: '8:30 AM – 6:00 PM', facilities: JSON.stringify(['Projector','Sound System','Podium Mic','AC','Wi-Fi']), tags: JSON.stringify(['seminar','ac','projector','audio']), x: 38, y: 35 },
    { id: '3', name: 'Seminar Hall 2', block: 'CS Block', capacity: 150, time: '8:30 AM – 6:00 PM', facilities: JSON.stringify(['Smart Board','Projector','AC','Wi-Fi','Stepped Seating']), tags: JSON.stringify(['seminar','ac','projector','smartboard']), x: 42, y: 33 },
    { id: '4', name: 'Seminar Hall 4', block: 'Mechanical Block', capacity: 120, time: '9:00 AM – 5:00 PM', facilities: JSON.stringify(['Projector','Audio System','Wi-Fi']), tags: JSON.stringify(['seminar','projector','audio']), x: 62, y: 65 },
    { id: '5', name: 'Placement Hall 1', block: 'Placement Cell', capacity: 120, time: '9:00 AM – 5:00 PM', facilities: JSON.stringify(['Attached Table Chairs','AC','Wi-Fi','Projector']), tags: JSON.stringify(['wifi','ac','projector','tables']), x: 69, y: 48 },
    { id: '6', name: 'Placement Hall 2', block: 'Placement Cell', capacity: 100, time: '9:00 AM – 4:00 PM', facilities: JSON.stringify(['Attached Table Chairs','AC','Wi-Fi','Projector']), tags: JSON.stringify(['wifi','ac','projector','tables']), x: 76, y: 44 },
    { id: '7', name: 'Open Air Theatre (OAT)', block: 'Open Air Theatre', capacity: 3000, time: '6:00 AM – 9:00 PM', facilities: JSON.stringify(['Concert Venue','Tiered Open Theatre','Sound System','Practice Area']), tags: JSON.stringify(['concert','cultural','audio','practice']), x: 56, y: 71 },
    { id: '8', name: 'Founders Block', block: 'Founders Block', capacity: 250, time: '9:00 AM – 7:00 PM', facilities: JSON.stringify(['Top Floor Practice Area','Exam Centre','Tables','Chairs']), tags: JSON.stringify(['practice','tables','exam']), x: 32, y: 72 },
    { id: '9', name: 'Canteen', block: 'Canteen', capacity: 250, time: '9:00 AM – 6:30 PM', facilities: JSON.stringify(['Small Music Band Events','Informal Event Space']), tags: JSON.stringify(['music','cultural']), x: 80, y: 70 }
  ];

  for (const v of initialVenues) {
    await query(
      `INSERT INTO venues (id, name, block, capacity, time, facilities, tags, x, y)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [v.id, v.name, v.block, v.capacity, v.time, v.facilities, v.tags, v.x, v.y]
    );
  }

  // 4. Seed Events
  const initialEvents = [
    {
      id: 'evt-1',
      title: 'National Robotics Symposium 2026',
      description: 'Annual inter-college robotics competition showcasing autonomous drones, combat bots, and AI rover designs.',
      date: '2026-09-15',
      start_time: '10:00',
      end_time: '13:00',
      venue: 'Main Auditorium',
      college: 'Mar Athanasius College of Engineering (MACE)',
      category: 'Technical',
      poster_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=700&q=80',
      registration_link: 'https://macerobotics.org/symposium',
      google_form_link: 'https://forms.gle/robotics2026',
      organizer: 'Robotics & Automation Society'
    },
    {
      id: 'evt-2',
      title: 'AI & Deep Learning Hands-on Workshop',
      description: 'Comprehensive PyTorch masterclass covering vision transformers, LLM prompt engineering, and edge AI deployment.',
      date: '2026-09-15',
      start_time: '14:00',
      end_time: '17:00',
      venue: 'Seminar Hall 2',
      college: 'Mar Athanasius College of Engineering (MACE)',
      category: 'Workshop',
      poster_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=700&q=80',
      registration_link: 'https://macefoss.org/ai-workshop',
      google_form_link: 'https://forms.gle/aiworkshop2026',
      organizer: 'FOSS Cell MACE'
    },
    {
      id: 'evt-3',
      title: 'Sanskriti Inter-College Cultural Gala',
      description: 'State-level arts festival featuring classical dance, eastern music battle, street play, and fine arts exhibits.',
      date: '2026-09-17',
      start_time: '17:00',
      end_time: '21:00',
      venue: 'Open Air Theatre (OAT)',
      college: 'Mar Athanasius College of Engineering (MACE)',
      category: 'Cultural',
      poster_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=700&q=80',
      registration_link: 'https://sanskriti.mace.ac.in',
      google_form_link: 'https://forms.gle/sanskriti2026',
      organizer: 'College Arts Club'
    },
    {
      id: 'evt-4',
      title: 'HackMACE 24-Hour Hackathon',
      description: 'Overnight hackathon building cutting-edge web, mobile, and AI solutions with guidance from top engineering alumni.',
      date: '2026-09-18',
      start_time: '09:00',
      end_time: '18:00',
      venue: 'Open Air Theatre (OAT)',
      college: 'Mar Athanasius College of Engineering (MACE)',
      category: 'Hackathon',
      poster_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=700&q=80',
      registration_link: 'https://hackmace.io',
      google_form_link: 'https://forms.gle/hackmace2026',
      organizer: 'CampusSpace Developer Guild'
    }
  ];

  for (const e of initialEvents) {
    await query(
      `INSERT INTO events (id, title, description, date, start_time, end_time, venue, college, category, poster_url, registration_link, google_form_link, organizer)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [e.id, e.title, e.description, e.date, e.start_time, e.end_time, e.venue, e.college, e.category, e.poster_url, e.registration_link, e.google_form_link, e.organizer]
    );
  }

  // 5. Seed Bookings
  const initialBookings = [
    {
      id: '101',
      venue_id: '1',
      venue_name: 'Main Auditorium',
      event_name: 'National Robotics Symposium',
      date: '2026-09-15',
      start_time: '10:00',
      end_time: '13:00',
      people: 350,
      purpose: 'Keynote addresses and live robotics demonstrations.',
      organizer_name: 'Team Lead (Robotics Club)',
      organizer_email: 'teamlead@campus.edu',
      organizer_role: 'team_lead',
      user_id: 'usr-teamlead',
      status: 'Approved',
      requested_facilities: JSON.stringify(['Sound System', 'AC', 'Stage']),
      notes: 'Requires sound check at 9 AM'
    },
    {
      id: '102',
      venue_id: '2',
      venue_name: 'Seminar Hall 2',
      event_name: 'AI & ML Hands-on Workshop',
      date: '2026-09-15',
      start_time: '14:00',
      end_time: '17:00',
      people: 45,
      purpose: 'PyTorch deep dive with student coders.',
      organizer_name: 'Team Lead (FOSS Cell)',
      organizer_email: 'teamlead@campus.edu',
      organizer_role: 'team_lead',
      user_id: 'usr-teamlead',
      status: 'Approved',
      requested_facilities: JSON.stringify(['Projector', 'AC', 'Wi-Fi']),
      notes: 'Laptops required'
    },
    {
      id: '103',
      venue_id: '5',
      venue_name: 'Placement Hall 1',
      event_name: 'Placement Technical Assessments',
      date: '2026-09-16',
      start_time: '09:30',
      end_time: '12:30',
      people: 50,
      purpose: 'On-campus recruitment coding round.',
      organizer_name: 'Team Lead (Placement Rep)',
      organizer_email: 'teamlead@campus.edu',
      organizer_role: 'team_lead',
      user_id: 'usr-teamlead',
      status: 'Approved',
      requested_facilities: JSON.stringify(['Attached Table Chairs', 'AC', 'Wi-Fi']),
      notes: 'Network team notified'
    },
    {
      id: '104',
      venue_id: '4',
      venue_name: 'Seminar Hall 4',
      event_name: 'IoT Micro-Drone Demonstration',
      date: '2026-09-18',
      start_time: '11:00',
      end_time: '13:00',
      people: 60,
      purpose: 'Hardware demonstration for ECE students.',
      organizer_name: 'Team Lead (IEEE SB)',
      organizer_email: 'teamlead@campus.edu',
      organizer_role: 'team_lead',
      user_id: 'usr-teamlead',
      status: 'Pending',
      requested_facilities: JSON.stringify(['Projector', 'Audio System']),
      notes: 'Indoor safety clearance'
    },
    {
      id: '105',
      venue_id: '7',
      venue_name: 'Open Air Theatre (OAT)',
      event_name: 'College Band Auditions',
      date: '2026-09-20',
      start_time: '15:00',
      end_time: '18:00',
      people: 200,
      purpose: 'Acoustic and electric band practice sessions.',
      organizer_name: 'Student Explorer',
      organizer_email: 'student@campus.edu',
      organizer_role: 'student',
      user_id: 'usr-student',
      status: 'Pending',
      requested_facilities: JSON.stringify(['Sound System']),
      notes: 'Acoustic and electric setup'
    }
  ];

  for (const b of initialBookings) {
    await query(
      `INSERT INTO bookings (id, venue_id, venue_name, event_name, date, start_time, end_time, people, purpose, organizer_name, organizer_email, organizer_role, user_id, status, requested_facilities, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
      [b.id, b.venue_id, b.venue_name, b.event_name, b.date, b.start_time, b.end_time, b.people, b.purpose, b.organizer_name, b.organizer_email, b.organizer_role, b.user_id, b.status, b.requested_facilities, b.notes]
    );
  }

  console.log('✅ PostgreSQL DDL migrations and seed data initialized successfully.');
}

module.exports = {
  initDb,
  query,
  getDbMode: () => dbMode,
  DATA_DIR
};
