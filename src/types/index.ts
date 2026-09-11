export type UserRole = 'admin' | 'maintenance' | 'teamlead' | 'student' | 'organizer';

export interface MaintenanceReport {
  id: string;
  title: string;
  category: string;
  location: string;
  dateTime: string;
  reporter: string;
  status: 'Reported' | 'In Progress' | 'Resolved';
  description: string;
  photoUrl?: string;
}

export interface CampusEvent {
  id: string;
  title: string;
  college: string;
  category: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  posterUrl?: string;
  registrationLink?: string;
  googleFormLink?: string;
  description: string;
  organizer: string;
  createdAt: string;
}

export type EventType =
  | 'Seminar'
  | 'Workshop'
  | 'Club Meeting'
  | 'Cultural Event'
  | 'Hackathon'
  | 'Presentation'
  | 'Sports Activity'
  | 'Conference'
  | 'Examination'
  | 'Exhibition';

export type FacilityItem =
  | 'Projector'
  | 'Air conditioning'
  | 'Sound system'
  | 'Microphone'
  | 'Wi-Fi'
  | 'Stage'
  | 'Whiteboard'
  | 'Computer systems';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface VenueTimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  bookedBy?: string;
  eventName?: string;
}

export interface Venue {
  id: string;
  name: string;
  building: string;
  category: 'hall' | 'lab' | 'auditorium' | 'classroom' | 'sports' | 'outdoor' | 'commons';
  capacity: number;
  floor: string;
  coordinates: Coordinates;
  facilities: FacilityItem[];
  status: VenueStatus;
  currentEvent?: string;
  energyRating: 'A+' | 'A' | 'B' | 'C';
  historicalSuitability: Record<string, number>; // eventType -> score %
  cancellationRate: number; // %
  historicalAverageOccupancy: number; // %
  description: string;
  image: string;
  contactPerson: string;
  noiseLevel: 'Quiet' | 'Moderate' | 'High-Energy Allowed';
  wheelchairAccessible: boolean;
  availableTimeSlots?: VenueTimeSlot[];
}

export type BookingStatus = 'Pending' | 'Auto-approved' | 'Approved' | 'Rejected' | 'Cancelled';

export interface Booking {
  id: string;
  venueId: string;
  venueName: string;
  building: string;
  eventName: string;
  eventType: EventType;
  organizerName: string;
  organizerEmail: string;
  organizerRole: UserRole;
  attendance: number;
  date: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  requestedFacilities: FacilityItem[];
  notes?: string;
  matchScore?: number;
  createdAt: string;
  isAutoApproved?: boolean;
}

export interface AIRecommendationRequest {
  eventType: EventType;
  attendance: number;
  date: string;
  startTime: string;
  endTime: string;
  requiredFacilities: FacilityItem[];
  flexibleTiming?: boolean;
  userLocation?: Coordinates;
}

export interface AIRecommendationResult {
  venue: Venue;
  matchScore: number; // 0 - 100
  rank: number;
  capacityScore: number;
  facilityScore: number;
  availabilityScore: number;
  proximityScore: number;
  historicalScore: number;
  whyRecommended: string;
  detailedReasons: string[];
  matchedFacilities: FacilityItem[];
  missingFacilities: FacilityItem[];
  distanceMeters: number;
  walkingMinutes: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  timestamp: string;
  read: boolean;
}

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  department: string;
  avatar: string;
  badge: string;
}

export const PRESET_CREDENTIALS = {
  admin: {
    username: 'admin',
    password: 'admin123',
    role: 'admin' as UserRole,
    name: 'Campus Facilities Administrator',
    department: 'Office of Campus Administration',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    badge: 'Senior Admin'
  },
  organizer: {
    username: 'organizer',
    password: '12345',
    role: 'organizer' as UserRole,
    name: 'Event Organizer',
    department: 'University Event & Club Council',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    badge: 'Faculty / Club Convener'
  }
};

export const DEFAULT_USERS = {
  admin: PRESET_CREDENTIALS.admin,
  organizer: PRESET_CREDENTIALS.organizer
};
