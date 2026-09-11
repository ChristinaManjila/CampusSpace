// MACE Campus Locations & Room Database
import { CampusLocation, Room } from '../types';

export const MACE_CAMPUS_CENTER = {
  lat: 10.0538,
  lng: 76.6192,
  name: 'MACE Main Campus'
};

export const MACE_CAMPUS_BOUNDS = {
  north: 10.0560,
  south: 10.0510,
  east: 76.6220,
  west: 76.6170
};

export const MACE_CAMPUS_LOCATIONS: CampusLocation[] = [
  {
    id: 'main-entrance',
    name: 'Main Entrance',
    type: 'entrance',
    coordinates: { lat: 10.055167, lng: 76.619167 },
    description: 'Main campus gate, security checkpoint, and vehicle entrance on NH-85.'
  },
  {
    id: 'main-block',
    name: 'Main Block',
    shortName: "Admin & Principal's Office",
    type: 'building',
    coordinates: { lat: 10.0538, lng: 76.6192 },
    description: "Principal's Office, Academic Administration, Main Auditorium, Seminar Hall 2, and PTA Seminar Hall."
  },
  {
    id: 'ece-block',
    name: 'ECE Block',
    shortName: 'ECE Dept',
    type: 'building',
    coordinates: { lat: 10.0540, lng: 76.6190 },
    description: 'Electronics & Communication Engineering Department, Seminar Hall 4, Advanced Labs.'
  },
  {
    id: 'cs-block',
    name: 'CS Block',
    shortName: 'Computer Science Dept',
    type: 'building',
    coordinates: { lat: 10.052444, lng: 76.618639 },
    description: 'Computer Science & Engineering Department with multi-level hardware, networks, and AI research labs.',
    floors: [
      { id: 'cs-floor-2', level: 2, name: 'Second Floor', rooms: [] },
      { id: 'cs-floor-3', level: 3, name: 'Third Floor', rooms: [] }
    ]
  },
  {
    id: 'mech-block',
    name: 'Mechanical Engineering Block',
    shortName: 'MECH Dept',
    type: 'building',
    coordinates: { lat: 10.0540, lng: 76.6200 },
    description: 'Mechanical Engineering Department, CAD/CAM labs, and faculty rooms.'
  },
  {
    id: 'civil-block',
    name: 'Civil Engineering Block',
    shortName: 'CIVIL Dept',
    type: 'building',
    coordinates: { lat: 10.0532, lng: 76.6185 },
    description: 'Civil Engineering Department, Structural Analysis and Survey labs.'
  },
  {
    id: 'mca-block',
    name: 'MCA Block',
    shortName: 'MCA Dept',
    type: 'building',
    coordinates: { lat: 10.0550, lng: 76.6198 },
    description: 'Master of Computer Applications department, dedicated computer center, and lecture halls.'
  },
  {
    id: 'pg-block',
    name: 'PG Block',
    shortName: 'Postgraduate Block',
    type: 'building',
    coordinates: { lat: 10.052111, lng: 76.6195 },
    description: 'Postgraduate studies, advanced seminar wings, and specialized research centers.'
  },
  {
    id: 'placement-cell',
    name: 'Placement Cell',
    shortName: 'Placement Wing',
    type: 'building',
    coordinates: { lat: 10.0542, lng: 76.6196 },
    description: 'Training and Placement Cell, Interview Rooms, Placement Halls 1 & 2.'
  },
  {
    id: 'oat-stage',
    name: 'OAT Stage',
    shortName: 'OAT Stage',
    type: 'landmark',
    coordinates: { lat: 10.0541, lng: 76.6183 },
    description: 'Main performance stage for cultural events, Sanskriti, and college fests.'
  },
  {
    id: 'oat',
    name: 'Open Air Theatre (OAT)',
    shortName: 'OAT Amphitheatre',
    type: 'landmark',
    coordinates: { lat: 10.0544, lng: 76.6181 },
    description: 'Large stepped amphitheatre seating 2,500+ spectators for national symposiums, cultural fests, and musical concerts.'
  },
  {
    id: 'canteen',
    name: 'Campus Canteen',
    shortName: 'Canteen',
    type: 'facility',
    coordinates: { lat: 10.0528, lng: 76.6198 },
    description: 'Multi-cuisine campus dining facility, student cafeteria, and Canteen Conference Hall.'
  },
  {
    id: 'central-library',
    name: 'Central Library',
    shortName: 'Library',
    type: 'facility',
    coordinates: { lat: 10.053667, lng: 76.619694 },
    description: 'Central campus library holding 80,000+ volumes, digital journal portals, and quiet study cubicles.'
  },
  {
    id: 'foundry-smithy',
    name: 'Foundry & Smithy Workshop',
    shortName: 'Foundry Shop',
    type: 'facility',
    coordinates: { lat: 10.053361, lng: 76.619806 },
    description: 'Practical foundry, casting, and metallurgical fabrication shop.'
  },
  {
    id: 'machine-shops',
    name: 'Machine Shops',
    shortName: 'Machine Shop',
    type: 'facility',
    coordinates: { lat: 10.053000, lng: 76.619806 },
    description: 'Precision lathes, milling, shaping, and industrial CNC machinery.'
  },
  {
    id: 'hydraulics-lab',
    name: 'Hydraulics Lab',
    shortName: 'Hydraulics',
    type: 'facility',
    coordinates: { lat: 10.052667, lng: 76.619639 },
    description: 'Fluid mechanics, flumes, turbines, and hydraulic test benches.'
  },
  {
    id: 'heat-engines-lab',
    name: 'Heat Engines Lab',
    shortName: 'Heat Engines',
    type: 'facility',
    coordinates: { lat: 10.052583, lng: 76.619361 },
    description: 'Internal combustion engines, dynamometers, and thermodynamic test setups.'
  },
  {
    id: 'eee-workshop',
    name: 'EEE Workshop',
    shortName: 'EEE Workshop',
    type: 'facility',
    coordinates: { lat: 10.052528, lng: 76.618889 },
    description: 'Electrical wiring, machinery testing, and transformer test floor.'
  },
  {
    id: 'nss-park',
    name: 'NSS Park',
    shortName: 'NSS Green Zone',
    type: 'landmark',
    coordinates: { lat: 10.053500, lng: 76.618917 },
    description: 'Lush landscaped green commons maintained by the National Service Scheme unit.'
  }
];

export const MACE_CS_BLOCK_ROOMS: Room[] = [
  // Second Floor (L2XX)
  { id: 'l201', number: 'L201', name: 'Classroom', type: 'classroom', floor: 2, buildingId: 'cs-block' },
  { id: 'l202', number: 'L202', name: 'Electronics Workshop', type: 'lab', floor: 2, buildingId: 'cs-block' },
  { id: 'l203', number: 'L203', name: 'Network Systems Lab', type: 'lab', floor: 2, buildingId: 'cs-block' },
  { id: 'l204', number: 'L204', name: 'Classroom', type: 'classroom', floor: 2, buildingId: 'cs-block' },
  { id: 'l205', number: 'L205', name: 'Faculty Room', type: 'faculty', floor: 2, buildingId: 'cs-block' },
  { id: 'l206', number: 'L206', name: 'Computer Hardware & Intelligence Lab', type: 'lab', floor: 2, buildingId: 'cs-block' },
  { id: 'l207', number: 'L207', name: 'Faculty Room', type: 'faculty', floor: 2, buildingId: 'cs-block' },
  { id: 'l208', number: 'L208', name: 'HOD Room', type: 'hod', floor: 2, buildingId: 'cs-block' },
  { id: 'l209', number: 'L209', name: 'Seminar Room', type: 'other', floor: 2, buildingId: 'cs-block' },
  { id: 'l210', number: 'L210', name: 'Restroom (M)', type: 'toilet', floor: 2, buildingId: 'cs-block' },
  { id: 'l211', number: 'L211', name: 'Tutorial Room', type: 'other', floor: 2, buildingId: 'cs-block' },
  { id: 'l212', number: 'L212', name: 'Research Scholar Room', type: 'other', floor: 2, buildingId: 'cs-block' },
  { id: 'l213', number: 'L213', name: 'Restroom (F)', type: 'toilet', floor: 2, buildingId: 'cs-block' },
  { id: 'l214', number: 'L214', name: 'Research Lab / V-Lab', type: 'lab', floor: 2, buildingId: 'cs-block' },
  { id: 'l215', number: 'L215', name: 'Conference Room', type: 'other', floor: 2, buildingId: 'cs-block' },
  { id: 'l216', number: 'L216', name: 'CS Department Library', type: 'library', floor: 2, buildingId: 'cs-block' },
  { id: 'l217', number: 'L217', name: 'Project Development Lab', type: 'other', floor: 2, buildingId: 'cs-block' },
  { id: 'l218', number: 'L218', name: 'PG Computing Centre', type: 'other', floor: 2, buildingId: 'cs-block' },
  { id: 'l219', number: 'L219', name: 'Staff Common Room', type: 'other', floor: 2, buildingId: 'cs-block' },

  // Third Floor (L3XX)
  { id: 'l301', number: 'L301', name: 'Smart Classroom', type: 'classroom', floor: 3, buildingId: 'cs-block' },
  { id: 'l302', number: 'L302', name: 'Advanced Lab for ECE', type: 'lab', floor: 3, buildingId: 'cs-block' },
  { id: 'l303', number: 'L303', name: 'Faculty Room', type: 'faculty', floor: 3, buildingId: 'cs-block' },
  { id: 'l304', number: 'L304', name: 'ECE Project Lab', type: 'lab', floor: 3, buildingId: 'cs-block' },
  { id: 'l305', number: 'L305', name: 'Embedded Systems Lab', type: 'lab', floor: 3, buildingId: 'cs-block' },
  { id: 'l306', number: 'L306', name: 'Robotics Workshop', type: 'other', floor: 3, buildingId: 'cs-block' },
  { id: 'l307', number: 'L307', name: 'Faculty Room', type: 'faculty', floor: 3, buildingId: 'cs-block' },
  { id: 'l308', number: 'L308', name: 'Restroom (F)', type: 'toilet', floor: 3, buildingId: 'cs-block' },
  { id: 'l309', number: 'L309', name: 'Faculty Room', type: 'faculty', floor: 3, buildingId: 'cs-block' },
  { id: 'l310', number: 'L310', name: 'Faculty Room', type: 'faculty', floor: 3, buildingId: 'cs-block' },
  { id: 'l311', number: 'L311', name: 'Restroom (M)', type: 'toilet', floor: 3, buildingId: 'cs-block' },
  { id: 'l312', number: 'L312', name: 'Data Analytics & Cloud Lab', type: 'lab', floor: 3, buildingId: 'cs-block' },
  { id: 'l313', number: 'L313', name: 'High-Performance Programming Lab', type: 'lab', floor: 3, buildingId: 'cs-block' },
  { id: 'l314', number: 'L314', name: 'Systems Seminar Room', type: 'other', floor: 3, buildingId: 'cs-block' },
  { id: 'l315', number: 'L315', name: 'Student Innovation Cell', type: 'other', floor: 3, buildingId: 'cs-block' },
  { id: 'l316', number: 'L316', name: 'Faculty Meeting Room', type: 'faculty', floor: 3, buildingId: 'cs-block' }
];

export function getMaceLocationById(id: string): CampusLocation | undefined {
  return MACE_CAMPUS_LOCATIONS.find(loc => loc.id === id);
}

export function getMaceRoomById(id: string): Room | undefined {
  return MACE_CS_BLOCK_ROOMS.find(room => room.id === id);
}

export function searchMaceCampus(query: string): { type: 'location' | 'room'; item: CampusLocation | Room; matchScore: number }[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  const results: { type: 'location' | 'room'; item: CampusLocation | Room; matchScore: number }[] = [];

  MACE_CAMPUS_LOCATIONS.forEach(loc => {
    const nameMatch = loc.name.toLowerCase().includes(q);
    const shortMatch = loc.shortName?.toLowerCase().includes(q);
    if (nameMatch || shortMatch) {
      const score = loc.name.toLowerCase().startsWith(q) ? 100 : nameMatch ? 85 : 70;
      results.push({ type: 'location', item: loc, matchScore: score });
    }
  });

  MACE_CS_BLOCK_ROOMS.forEach(room => {
    const numMatch = room.number.toLowerCase().includes(q);
    const nameMatch = room.name.toLowerCase().includes(q);
    if (numMatch || nameMatch) {
      const score = room.number.toLowerCase() === q ? 100 : numMatch ? 90 : 75;
      results.push({ type: 'room', item: room, matchScore: score });
    }
  });

  return results.sort((a, b) => b.matchScore - a.matchScore).slice(0, 10);
}
