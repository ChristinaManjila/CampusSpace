import { Venue, FacilityItem, VenueTimeSlot } from '../types';

export const CAMPUS_CENTER = {
  lat: 19.1334,
  lng: 72.9133,
  name: 'Central Campus Plaza'
};

export const STANDARD_TIME_SLOTS = [
  { id: 'slot-1', startTime: '08:00', endTime: '10:00' },
  { id: 'slot-2', startTime: '10:00', endTime: '12:00' },
  { id: 'slot-3', startTime: '12:00', endTime: '14:00' },
  { id: 'slot-4', startTime: '14:00', endTime: '16:00' },
  { id: 'slot-5', startTime: '16:00', endTime: '18:00' },
  { id: 'slot-6', startTime: '18:00', endTime: '20:00' }
];

export const generateVenueSlots = (seed: number): VenueTimeSlot[] => {
  return STANDARD_TIME_SLOTS.map((slot, index) => {
    // Deterministic demo availability
    const isAvailable = (seed + index) % 3 !== 0;
    return {
      id: `${slot.id}-${seed}`,
      startTime: slot.startTime,
      endTime: slot.endTime,
      isAvailable,
      bookedBy: isAvailable ? undefined : index % 2 === 0 ? 'Robotics Club' : 'Department Meeting',
      eventName: isAvailable ? undefined : index % 2 === 0 ? 'Weekly Workshop' : 'Faculty Briefing'
    };
  });
};

export const INITIAL_VENUES: Venue[] = [
  {
    id: 'venue-1',
    name: 'Seminar Hall A',
    building: 'Academic Block 1',
    category: 'hall',
    capacity: 150,
    floor: '1st Floor',
    coordinates: { lat: 19.1338, lng: 72.9125 },
    facilities: [
      'Projector',
      'Air conditioning',
      'Sound system',
      'Microphone',
      'Wi-Fi',
      'Whiteboard',
      'Stage'
    ],
    status: 'available',
    energyRating: 'A',
    historicalSuitability: {
      Seminar: 98,
      Workshop: 94,
      Presentation: 96,
      'Club Meeting': 88,
      Hackathon: 90,
      'Cultural Event': 65,
      'Sports Activity': 10,
      Conference: 95,
      Examination: 90,
      Exhibition: 75
    },
    cancellationRate: 2.1,
    historicalAverageOccupancy: 86,
    description: 'Tiered auditorium-style seating with dual 4K laser projectors, balanced acoustic wall panels, and high-density Wi-Fi access.',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    contactPerson: 'Prof. S. Kulkarni (Ext: 4401)',
    noiseLevel: 'Moderate',
    wheelchairAccessible: true,
    availableTimeSlots: generateVenueSlots(1)
  },
  {
    id: 'venue-2',
    name: 'Main Auditorium',
    building: 'Convention Complex',
    category: 'auditorium',
    capacity: 850,
    floor: 'Ground Floor',
    coordinates: { lat: 19.1347, lng: 72.9142 },
    facilities: [
      'Projector',
      'Air conditioning',
      'Sound system',
      'Microphone',
      'Wi-Fi',
      'Stage'
    ],
    status: 'available',
    energyRating: 'A+',
    historicalSuitability: {
      'Cultural Event': 99,
      Conference: 98,
      Seminar: 92,
      Hackathon: 88,
      Presentation: 90,
      'Club Meeting': 40,
      Workshop: 65,
      'Sports Activity': 15,
      Examination: 92,
      Exhibition: 85
    },
    cancellationRate: 1.2,
    historicalAverageOccupancy: 91,
    description: 'Grand campus auditorium featuring a full proscenium theatrical stage, dual multi-channel line array sound systems, and VIP holding rooms.',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
    contactPerson: 'Estate Manager R. Shinde (Ext: 2100)',
    noiseLevel: 'High-Energy Allowed',
    wheelchairAccessible: true,
    availableTimeSlots: generateVenueSlots(2)
  },
  {
    id: 'venue-3',
    name: 'Innovation Lab',
    building: 'Technology Center',
    category: 'lab',
    capacity: 60,
    floor: '2nd Floor',
    coordinates: { lat: 19.1352, lng: 72.9112 },
    facilities: [
      'Computer systems',
      'Wi-Fi',
      'Air conditioning',
      'Projector',
      'Whiteboard',
      'Sound system'
    ],
    status: 'available',
    energyRating: 'A',
    historicalSuitability: {
      Hackathon: 99,
      Workshop: 96,
      'Club Meeting': 88,
      Seminar: 82,
      Presentation: 89,
      'Cultural Event': 15,
      'Sports Activity': 0,
      Conference: 70,
      Examination: 90,
      Exhibition: 80
    },
    cancellationRate: 3.5,
    historicalAverageOccupancy: 94,
    description: 'High-performance computing workstations with gigabit fiber backbone, localized air conditioning, and modular dry-erase team tables.',
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
    contactPerson: 'Lab Supervisor Anita Roy (Ext: 5210)',
    noiseLevel: 'Quiet',
    wheelchairAccessible: true,
    availableTimeSlots: generateVenueSlots(3)
  },
  {
    id: 'venue-4',
    name: 'Conference Room B',
    building: 'Management Block',
    category: 'hall',
    capacity: 45,
    floor: '2nd Floor',
    coordinates: { lat: 19.1322, lng: 72.9118 },
    facilities: [
      'Projector',
      'Air conditioning',
      'Sound system',
      'Microphone',
      'Wi-Fi',
      'Whiteboard'
    ],
    status: 'available',
    energyRating: 'A',
    historicalSuitability: {
      Presentation: 98,
      'Club Meeting': 95,
      Seminar: 90,
      Workshop: 88,
      Conference: 92,
      Hackathon: 70,
      'Cultural Event': 20,
      'Sports Activity': 0,
      Examination: 80,
      Exhibition: 60
    },
    cancellationRate: 2.8,
    historicalAverageOccupancy: 78,
    description: 'Executive board-room setup with conference microphone consoles, smart motorized projector screen, and magnetic whiteboards.',
    image: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=800&q=80',
    contactPerson: 'Dept Secretary V. Rao (Ext: 3302)',
    noiseLevel: 'Quiet',
    wheelchairAccessible: true,
    availableTimeSlots: generateVenueSlots(4)
  },
  {
    id: 'venue-5',
    name: 'Open Amphitheatre',
    building: 'Campus Center Green',
    category: 'outdoor',
    capacity: 400,
    floor: 'Ground / Open Air',
    coordinates: { lat: 19.1325, lng: 72.9155 },
    facilities: [
      'Stage',
      'Sound system',
      'Microphone',
      'Wi-Fi'
    ],
    status: 'available',
    energyRating: 'A+',
    historicalSuitability: {
      'Cultural Event': 98,
      'Sports Activity': 85,
      'Club Meeting': 80,
      Presentation: 70,
      Festival: 95,
      Seminar: 50,
      Hackathon: 40,
      Workshop: 45,
      Conference: 40,
      Examination: 0,
      Exhibition: 88
    },
    cancellationRate: 4.2,
    historicalAverageOccupancy: 68,
    description: 'Open-air stepped amphitheatre surrounded by green lawns. Equipped with an elevated stage and outdoor concert sound amplification.',
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80',
    contactPerson: 'Student Activities Officer P. Sharma',
    noiseLevel: 'High-Energy Allowed',
    wheelchairAccessible: true,
    availableTimeSlots: generateVenueSlots(5)
  },
  {
    id: 'venue-6',
    name: 'Computer Systems Lab 3',
    building: 'IT Wing',
    category: 'lab',
    capacity: 80,
    floor: '3rd Floor',
    coordinates: { lat: 19.1343, lng: 72.9165 },
    facilities: [
      'Computer systems',
      'Air conditioning',
      'Wi-Fi',
      'Projector',
      'Whiteboard'
    ],
    status: 'available',
    energyRating: 'B',
    historicalSuitability: {
      Hackathon: 98,
      Examination: 96,
      Workshop: 92,
      'Club Meeting': 85,
      Seminar: 75,
      Presentation: 80,
      'Cultural Event': 10,
      'Sports Activity': 0,
      Conference: 60,
      Exhibition: 70
    },
    cancellationRate: 1.8,
    historicalAverageOccupancy: 92,
    description: '80 network-connected dual-boot workstations, centralized uninterrupted power supply (UPS), and overhead projection display.',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80',
    contactPerson: 'System Admin K. Mehra (Ext: 5540)',
    noiseLevel: 'Quiet',
    wheelchairAccessible: true,
    availableTimeSlots: generateVenueSlots(6)
  },
  {
    id: 'venue-7',
    name: 'Indoor Sports Arena',
    building: 'Athletics Complex',
    category: 'sports',
    capacity: 300,
    floor: 'Ground Floor',
    coordinates: { lat: 19.136, lng: 72.914 },
    facilities: [
      'Sound system',
      'Microphone',
      'Wi-Fi',
      'Air conditioning'
    ],
    status: 'available',
    energyRating: 'B',
    historicalSuitability: {
      'Sports Activity': 99,
      'Cultural Event': 85,
      Exhibition: 80,
      'Club Meeting': 50,
      Seminar: 20,
      Workshop: 30,
      Hackathon: 35,
      Presentation: 25,
      Conference: 30,
      Examination: 75
    },
    cancellationRate: 2.5,
    historicalAverageOccupancy: 81,
    description: 'Multi-purpose indoor wooden gymnasium court with electronic scoring boards, stadium sound system, and spectator seating.',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    contactPerson: 'Athletic Director Coach Verma (Ext: 1120)',
    noiseLevel: 'High-Energy Allowed',
    wheelchairAccessible: true,
    availableTimeSlots: generateVenueSlots(7)
  }
];
