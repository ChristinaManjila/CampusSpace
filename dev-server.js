const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const db = require('./src/server/db');

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5173;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'text/javascript; charset=UTF-8',
  '.mjs': 'text/javascript; charset=UTF-8',
  '.ts': 'text/javascript; charset=UTF-8',
  '.tsx': 'text/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Session storage
const activeSessions = new Map();

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=UTF-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-auth-token',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS'
  });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

function getAuthenticatedUser(req) {
  const authHeader = req.headers['authorization'] || req.headers['x-auth-token'];
  if (!authHeader) return null;
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
  return activeSessions.get(token) || null;
}

// Initialize database
db.initDb().catch(err => console.error('Database initialization error:', err));

const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-auth-token',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS'
    });
    res.end();
    return;
  }

  const [rawPath, queryString] = req.url.split('?');
  const reqUrl = rawPath;

  // ==========================================
  // API ROUTING (/api/...)
  // ==========================================
  if (reqUrl.startsWith('/api/')) {
    try {
      // 1. POST /api/auth/login
      if (reqUrl === '/api/auth/login' && req.method === 'POST') {
        const body = await parseBody(req);
        const identifier = (body.username || body.email || '').trim().toLowerCase();
        const password = body.password || '';

        if (!identifier || !password) {
          return sendJson(res, 400, { error: 'Username/email and password are required.' });
        }

        const result = await db.query(
          'SELECT * FROM users WHERE LOWER(email) = $1 OR LOWER(username) = $1',
          [identifier]
        );

        const user = result.rows[0];
        if (!user || user.password !== password) {
          return sendJson(res, 401, { error: 'Invalid username/email or password.' });
        }

        const token = `token-${user.role}-${user.id}-${Date.now()}`;
        const userProfile = {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          name: user.name,
          department: user.department
        };
        activeSessions.set(token, userProfile);

        return sendJson(res, 200, {
          success: true,
          token,
          user: userProfile
        });
      }

      // 2. GET /api/auth/me
      if (reqUrl === '/api/auth/me' && req.method === 'GET') {
        const user = getAuthenticatedUser(req);
        if (!user) {
          return sendJson(res, 401, { error: 'Unauthorized: Session invalid or expired.' });
        }
        return sendJson(res, 200, { user });
      }

      // 3. /api/liked-events (Strictly gated to STUDENT role)
      if (reqUrl.startsWith('/api/liked-events')) {
        const user = getAuthenticatedUser(req);
        if (!user) {
          return sendJson(res, 401, { error: 'Unauthorized: Please log in.' });
        }
        if (user.role !== 'student') {
          return sendJson(res, 403, { error: 'Forbidden: Liked Events is strictly available to students.' });
        }

        const segments = reqUrl.split('/');
        const bookingId = segments[3]; // /api/liked-events/:bookingId

        // GET /api/liked-events
        if (req.method === 'GET' && !bookingId) {
          const likesRes = await db.query('SELECT * FROM liked_events WHERE user_id = $1', [user.id]);
          const likedEvents = likesRes.rows;

          // Attach event/booking details
          const eventsRes = await db.query('SELECT * FROM events');
          const bookingsRes = await db.query('SELECT * FROM bookings');

          const enriched = likedEvents.map(item => {
            const ev = eventsRes.rows.find(e => String(e.id) === String(item.booking_id));
            const bk = bookingsRes.rows.find(b => String(b.id) === String(item.booking_id));
            return {
              id: item.id,
              userId: item.user_id,
              bookingId: item.booking_id,
              createdAt: item.created_at,
              event: ev || (bk ? {
                id: bk.id,
                title: bk.event_name,
                venue: bk.venue_name,
                date: bk.date,
                startTime: bk.start_time,
                endTime: bk.end_time,
                description: bk.purpose || bk.notes || 'Campus booking'
              } : null)
            };
          });

          return sendJson(res, 200, { likedEvents: enriched });
        }

        // POST /api/liked-events/:bookingId
        if (req.method === 'POST' && bookingId) {
          try {
            await db.query(
              'INSERT INTO liked_events (user_id, booking_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
              [user.id, bookingId]
            );
            return sendJson(res, 201, { success: true, bookingId, message: 'Event successfully liked.' });
          } catch (e) {
            return sendJson(res, 500, { error: e.message });
          }
        }

        // DELETE /api/liked-events/:bookingId
        if (req.method === 'DELETE' && bookingId) {
          await db.query(
            'DELETE FROM liked_events WHERE user_id = $1 AND booking_id = $2',
            [user.id, bookingId]
          );
          return sendJson(res, 200, { success: true, bookingId, message: 'Event unliked successfully.' });
        }
      }

      // 4. /api/bookings
      if (reqUrl.startsWith('/api/bookings')) {
        const segments = reqUrl.split('/');
        const bookingId = segments[3];

        // GET /api/bookings (Role-gated filtering)
        if (req.method === 'GET' && !bookingId) {
          const user = getAuthenticatedUser(req);
          const allRes = await db.query('SELECT * FROM bookings');
          let bookings = allRes.rows;

          if (user) {
            if (user.role === 'admin') {
              // Admin sees all
            } else if (user.role === 'student') {
              // Student sees own bookings
              bookings = bookings.filter(b => b.user_id === user.id || b.organizer_role === 'student');
            } else if (user.role === 'team_lead') {
              // Team lead sees team bookings
              bookings = bookings.filter(b => b.organizer_role === 'team_lead' || b.user_id === user.id);
            } else if (user.role === 'maintenance') {
              // Maintenance sees approved bookings
              bookings = bookings.filter(b => b.status === 'Approved');
            }
          }

          return sendJson(res, 200, { bookings });
        }

        // POST /api/bookings (Gated to admin, student, team_lead)
        if (req.method === 'POST' && !bookingId) {
          const user = getAuthenticatedUser(req);
          if (!user) {
            return sendJson(res, 401, { error: 'Unauthorized.' });
          }
          if (user.role === 'maintenance') {
            return sendJson(res, 403, { error: 'Forbidden: Maintenance officers cannot create bookings.' });
          }

          const body = await parseBody(req);
          const id = body.id || `BK-${Date.now().toString().slice(-4)}`;
          const venueId = String(body.venueId || body.venue_id || '1');
          const venueName = body.venueName || body.venue_name || 'Campus Venue';
          const eventName = body.eventName || body.event_name || 'Campus Event';
          const date = body.date || new Date().toISOString().split('T')[0];
          const startTime = body.startTime || body.start_time || '10:00';
          const endTime = body.endTime || body.end_time || '12:00';
          const people = Number(body.people || body.attendance || 25);
          const purpose = body.purpose || '';
          const organizerName = body.organizerName || body.organizer_name || user.name;
          const organizerEmail = body.organizerEmail || body.organizer_email || user.email;
          const organizerRole = user.role;
          const status = user.role === 'admin' ? 'Approved' : (body.status || 'Pending');
          const requestedFacilities = JSON.stringify(body.requestedFacilities || body.requested_facilities || []);
          const notes = body.notes || '';

          await db.query(
            `INSERT INTO bookings (id, venue_id, venue_name, event_name, date, start_time, end_time, people, purpose, organizer_name, organizer_email, organizer_role, user_id, status, requested_facilities, notes)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
            [id, venueId, venueName, eventName, date, startTime, endTime, people, purpose, organizerName, organizerEmail, organizerRole, user.id, status, requestedFacilities, notes]
          );

          return sendJson(res, 201, {
            success: true,
            booking: { id, venueId, venueName, eventName, date, startTime, endTime, people, purpose, organizerName, organizerEmail, organizerRole, userId: user.id, status, notes }
          });
        }

        // PATCH /api/bookings/:id (Status modification rules)
        if (req.method === 'PATCH' && bookingId) {
          const user = getAuthenticatedUser(req);
          if (!user) {
            return sendJson(res, 401, { error: 'Unauthorized.' });
          }

          const body = await parseBody(req);
          const newStatus = body.status;

          // Maintenance cannot approve/reject/cancel
          if (user.role === 'maintenance') {
            return sendJson(res, 403, { error: 'Forbidden: Maintenance officers cannot alter booking approvals.' });
          }

          // Students and Team Leads can ONLY cancel their own bookings
          if (user.role === 'student' || user.role === 'team_lead') {
            if (newStatus !== 'Cancelled') {
              return sendJson(res, 403, { error: `Forbidden: Only administrators can set status to ${newStatus}.` });
            }
            const bkRes = await db.query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
            const bk = bkRes.rows[0];
            if (bk && bk.user_id !== user.id && bk.organizer_role !== user.role) {
              return sendJson(res, 403, { error: 'Forbidden: You cannot cancel another user\'s booking.' });
            }
          }

          await db.query('UPDATE bookings SET status = $1 WHERE id = $2', [newStatus, bookingId]);
          return sendJson(res, 200, { success: true, bookingId, status: newStatus });
        }
      }

      // 5. /api/venues
      if (reqUrl.startsWith('/api/venues')) {
        const segments = reqUrl.split('/');
        const venueId = segments[3];

        if (req.method === 'GET') {
          const venues = await db.query('SELECT * FROM venues');
          return sendJson(res, 200, { venues: venues.rows });
        }

        // Write operations are ADMIN ONLY
        const user = getAuthenticatedUser(req);
        if (!user || user.role !== 'admin') {
          return sendJson(res, 403, { error: 'Forbidden: Venue modifications require Administrator access.' });
        }

        if (req.method === 'POST') {
          const body = await parseBody(req);
          const id = body.id || String(Date.now());
          await db.query(
            `INSERT INTO venues (id, name, block, capacity, time, facilities, tags, x, y)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [id, body.name, body.block, body.capacity, body.time, JSON.stringify(body.facilities || []), JSON.stringify(body.tags || []), body.x || 50, body.y || 50]
          );
          return sendJson(res, 201, { success: true, id });
        }

        if (req.method === 'DELETE' && venueId) {
          await db.query('DELETE FROM venues WHERE id = $1', [venueId]);
          return sendJson(res, 200, { success: true, venueId });
        }
      }

      // 6. /api/events
      if (reqUrl === '/api/events' && req.method === 'GET') {
        const events = await db.query('SELECT * FROM events');
        return sendJson(res, 200, { events: events.rows });
      }

      // 7. /api/maintenance
      if (reqUrl.startsWith('/api/maintenance')) {
        const user = getAuthenticatedUser(req);
        if (req.method === 'GET') {
          // Maintenance & Admin have access
          const approved = await db.query("SELECT * FROM bookings WHERE status = 'Approved'");
          return sendJson(res, 200, { tasks: approved.rows });
        }
        if (req.method === 'PATCH') {
          if (!user || (user.role !== 'maintenance' && user.role !== 'admin')) {
            return sendJson(res, 403, { error: 'Forbidden: Maintenance updates require Maintenance or Admin role.' });
          }
          return sendJson(res, 200, { success: true, message: 'Maintenance task updated.' });
        }
      }

      // Unknown API endpoint
      return sendJson(res, 404, { error: 'API endpoint not found.' });
    } catch (apiErr) {
      console.error('API Error:', apiErr);
      return sendJson(res, 500, { error: apiErr.message });
    }
  }

  // ==========================================
  // STATIC FILE SERVING
  // ==========================================
  let filePath = path.join(ROOT, reqUrl === '/' || reqUrl === '' ? 'index.html' : reqUrl);

  // Security check
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      filePath = path.join(ROOT, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500);
        res.end('Error loading ' + reqUrl);
        return;
      }
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(content);
    });
  });
});

if (require.main === module) {
  server.listen(PORT, () => {
    const url = `http://localhost:${PORT}`;
    console.log(`\n======================================================`);
    console.log(`🚀 CampusSpace AI Dev Server running at:`);
    console.log(`👉 ${url}`);
    console.log(`======================================================\n`);

    if (process.platform === 'win32' && !process.env.CI) {
      exec(`start ${url}`, () => {});
    }
  });
}

module.exports = { server, activeSessions, PORT };
