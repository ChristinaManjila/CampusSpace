export type UserRole = 'student' | 'organizer' | 'admin';

export type VenueStatus = 'available' | 'booked' | 'pending' | 'maintenance';

export type EventType =
  | 'Seminar'
  | 'Workshop'
  | 'Hackathon'
  | 'Conference'
  | 'Cultural Event'
  | 'Club Meeting'
  | 'Sports Event'
  | 'Examination'
  | 'Exhibition';

export type FacilityItem =
  | 'Projector'
  | 'Wi-Fi'
  | 'Air Conditioning'
  | 'Stage'
  | 'Microphones'
  | 'Lab Equipment'
  | 'Power Outlets'
  | 'Whiteboard'
  | 'Recording Equipment'
  | 'Wheelchair Accessibility'
  | 'Parking';

export interface Coordinates {
  lat: number;
  lng: number;
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
  cancellationRate: number; // 0 to 100%
  historicalAverageOccupancy: number; // %
  description: string;
  image: string;
  contactPerson: string;
  noiseLevel: 'Quiet' | 'Moderate' | 'High-Energy Allowed';
  wheelchairAccessible: boolean;
}

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
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  qrCodeToken: string;
  checkedIn: boolean;
  checkedInAt?: string;
  requestedFacilities: FacilityItem[];
  notes?: string;
  matchScore?: number;
  createdAt: string;
}

export interface AIRecommendationRequest {
  eventType: EventType;
  attendance: number;
  date: string;
  startTime: string;
  endTime: string;
  requiredFacilities: FacilityItem[];
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
  reliabilityScore: number;
  demandScore: number;
  distanceMeters: number;
  walkingMinutes: number;
  whyRecommended: string[];
  highlights: string[];
  warnings: string[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  timestamp: string;
  read: boolean;
  actionId?: string;
}

export interface RouteStep {
  instruction: string;
  distanceMeters: number;
  durationMinutes: number;
  icon: string;
}

export interface NavigationRoute {
  destination: Venue;
  totalDistanceMeters: number;
  totalWalkingMinutes: number;
  waypoints: [number, number][];
  steps: RouteStep[];
}
