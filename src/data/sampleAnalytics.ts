export const HOURLY_UTILIZATION = [
  { hour: '08:00', occupancyRate: 28, capacityUsed: 420, idealCapacity: 1500 },
  { hour: '09:00', occupancyRate: 64, capacityUsed: 960, idealCapacity: 1500 },
  { hour: '10:00', occupancyRate: 88, capacityUsed: 1320, idealCapacity: 1500 },
  { hour: '11:00', occupancyRate: 94, capacityUsed: 1410, idealCapacity: 1500 },
  { hour: '12:00', occupancyRate: 72, capacityUsed: 1080, idealCapacity: 1500 },
  { hour: '13:00', occupancyRate: 48, capacityUsed: 720, idealCapacity: 1500 },
  { hour: '14:00', occupancyRate: 82, capacityUsed: 1230, idealCapacity: 1500 },
  { hour: '15:00', occupancyRate: 91, capacityUsed: 1365, idealCapacity: 1500 },
  { hour: '16:00', occupancyRate: 89, capacityUsed: 1335, idealCapacity: 1500 },
  { hour: '17:00', occupancyRate: 76, capacityUsed: 1140, idealCapacity: 1500 },
  { hour: '18:00', occupancyRate: 68, capacityUsed: 1020, idealCapacity: 1500 },
  { hour: '19:00', occupancyRate: 54, capacityUsed: 810, idealCapacity: 1500 },
  { hour: '20:00', occupancyRate: 35, capacityUsed: 525, idealCapacity: 1500 },
  { hour: '21:00', occupancyRate: 18, capacityUsed: 270, idealCapacity: 1500 }
];

export const VENUE_CATEGORY_UTILIZATION = [
  { category: 'Seminar Halls', utilization: 87, bookedHours: 340, ghostBookingsPrevented: 42 },
  { category: 'Auditoriums', utilization: 79, bookedHours: 198, ghostBookingsPrevented: 18 },
  { category: 'Tech & Maker Labs', utilization: 92, bookedHours: 412, ghostBookingsPrevented: 64 },
  { category: 'Smart Classrooms', utilization: 84, bookedHours: 510, ghostBookingsPrevented: 88 },
  { category: 'Outdoor / Amphitheatre', utilization: 61, bookedHours: 145, ghostBookingsPrevented: 12 },
  { category: 'Sports Complex', utilization: 73, bookedHours: 230, ghostBookingsPrevented: 15 }
];

export const NO_SHOW_REDUCTION_DATA = [
  { month: 'Apr', beforeCampusSpace: 34.2, withCampusSpaceAI: 18.5 },
  { month: 'May', beforeCampusSpace: 31.8, withCampusSpaceAI: 14.2 },
  { month: 'Jun', beforeCampusSpace: 29.5, withCampusSpaceAI: 11.0 },
  { month: 'Jul', beforeCampusSpace: 36.0, withCampusSpaceAI: 8.4 },
  { month: 'Aug', beforeCampusSpace: 33.1, withCampusSpaceAI: 5.6 },
  { month: 'Sep (Now)', beforeCampusSpace: 35.4, withCampusSpaceAI: 4.1 }
];

export const DEMAND_FORECAST = [
  {
    week: 'Week 1 (Sep 14 - 20)',
    period: 'Regular Academic & Club Auditions',
    demandScore: 78,
    peakDays: ['Wednesday', 'Friday'],
    riskLevel: 'Moderate',
    predictedPeakVenues: ['Seminar Hall A', 'Student Hub', 'Ramanujan Lab'],
    aiRecommendationTip: 'Book Wednesday evening slots before Monday 5 PM to guarantee availability.'
  },
  {
    week: 'Week 2 (Sep 21 - 27)',
    period: 'Mid-Semester Examinations',
    demandScore: 96,
    peakDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    riskLevel: 'Critical Rush',
    predictedPeakVenues: ['Smart Classrooms', 'Auditorium B', 'Central Library Hall'],
    aiRecommendationTip: 'High exam demand. Non-academic bookings restricted between 8 AM - 4 PM.'
  },
  {
    week: 'Week 3 (Sep 28 - Oct 4)',
    period: 'Post-Exam Hackathon & Tech Fest Week',
    demandScore: 92,
    peakDays: ['Friday', 'Saturday', 'Sunday'],
    riskLevel: 'High Rush',
    predictedPeakVenues: ['Turing Computing Lab', 'Auditorium Complex', 'Innovation Stage'],
    aiRecommendationTip: 'Mega hackathon scheduled. Reserve secondary seminar halls early.'
  },
  {
    week: 'Week 4 (Oct 5 - 11)',
    period: 'Post-Fest Maintenance & Study Transition',
    demandScore: 48,
    peakDays: ['Tuesday'],
    riskLevel: 'Low (Ideal for Large Bookings)',
    predictedPeakVenues: ['Conference Hall C', 'Central Library'],
    aiRecommendationTip: 'Optimal window for heavy departmental workshops and multi-day conferences.'
  }
];
