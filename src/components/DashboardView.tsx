import React, { useState } from 'react';
import { EventType, FacilityItem, AIRecommendationRequest, Venue, Booking } from '../types';

interface DashboardViewProps {
  onFindBestVenue: (req: AIRecommendationRequest) => void;
  venues: Venue[];
  bookings: Booking[];
  onSelectVenueForMap: (venue: Venue) => void;
  onQuickBookVenue: (venue: Venue) => void;
}

const EVENT_TYPES: EventType[] = [
  'Hackathon',
  'Seminar',
  'Workshop',
  'Conference',
  'Cultural Event',
  'Club Meeting',
  'Sports Event',
  'Examination',
  'Exhibition'
];

const ALL_FACILITIES: FacilityItem[] = [
  'Projector',
  'Wi-Fi',
  'Air Conditioning',
  'Stage',
  'Microphones',
  'Lab Equipment',
  'Power Outlets',
  'Whiteboard',
  'Recording Equipment',
  'Wheelchair Accessibility',
  'Parking'
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  onFindBestVenue,
  venues,
  bookings,
  onSelectVenueForMap,
  onQuickBookVenue
}) => {
  // Default values for quick demo evaluation
  const [eventType, setEventType] = useState<EventType>('Hackathon');
  const [attendance, setAttendance] = useState<number>(180);
  const [date, setDate] = useState<string>('2026-09-15');
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('18:00');
  const [selectedFacilities, setSelectedFacilities] = useState<FacilityItem[]>([
    'Projector',
    'Wi-Fi',
    'Air Conditioning',
    'Power Outlets'
  ]);

  const toggleFacility = (facility: FacilityItem) => {
    if (selectedFacilities.includes(facility)) {
      setSelectedFacilities(selectedFacilities.filter((f) => f !== facility));
    } else {
      setSelectedFacilities([...selectedFacilities, facility]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFindBestVenue({
      eventType,
      attendance,
      date,
      startTime,
      endTime,
      requiredFacilities: selectedFacilities
    });
  };

  // Quick Stats
  const availableCount = venues.filter((v) => v.status === 'available').length;
  const activeBookingsCount = bookings.filter((b) => b.status === 'confirmed').length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900/90 via-[#0d1c3a] to-slate-900/90 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Good evening 👋
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-semibold">
              Live Campus
            </span>
          </div>
          <p className="text-slate-400 text-sm">
            What are you planning today? Enter your event details below to let CampusSpace AI find the perfect venue.
          </p>
        </div>

        {/* Quick KPI pills */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-800/80 px-4 py-2.5 rounded-2xl border border-slate-700/80 text-center">
            <span className="block text-xl font-bold text-emerald-400">{availableCount}</span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Venues Open</span>
          </div>
          <div className="bg-slate-800/80 px-4 py-2.5 rounded-2xl border border-slate-700/80 text-center">
            <span className="block text-xl font-bold text-cyan-400">96%</span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">AI Match Rate</span>
          </div>
          <div className="bg-slate-800/80 px-4 py-2.5 rounded-2xl border border-slate-700/80 text-center">
            <span className="block text-xl font-bold text-indigo-400">4.1%</span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">No-Show Rate</span>
          </div>
        </div>
      </div>

      {/* Large Event Search / AI Recommendation Card */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/40 relative overflow-hidden">
        {/* Glow accent decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black text-lg">
              ✨
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                AI Venue Matchmaker & Capacity Optimizer
              </h2>
              <p className="text-xs text-slate-400">
                Calculates capacity fit, facility match, walkability, energy score, and historical suitability
              </p>
            </div>
          </div>
          <span className="text-xs text-cyan-400 font-medium bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-800">
            Multi-factor Scoring Engine
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Event Type & Expected Attendance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Event Type
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as EventType)}
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-slate-100 font-medium focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
              >
                {EVENT_TYPES.map((type) => (
                  <option key={type} value={type} className="bg-slate-900 text-white">
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Expected Attendance
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="5"
                  max="2000"
                  value={attendance}
                  onChange={(e) => setAttendance(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-slate-100 font-medium focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                  placeholder="e.g. 180"
                  required
                />
                <span className="absolute right-4 top-3.5 text-xs text-slate-400 font-medium">
                  Attendees
                </span>
              </div>
            </div>
          </div>

          {/* Row 2: Date, Start Time, End Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-slate-100 font-medium focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-slate-100 font-medium focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-slate-100 font-medium focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                required
              />
            </div>
          </div>

          {/* Row 3: Required Facilities Multi-select */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Required Facilities
              </label>
              <span className="text-[11px] text-cyan-400">
                {selectedFacilities.length} selected
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {ALL_FACILITIES.map((facility) => {
                const isSelected = selectedFacilities.includes(facility);
                return (
                  <button
                    type="button"
                    key={facility}
                    onClick={() => toggleFacility(facility)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-gradient-to-r from-cyan-500/25 to-blue-600/25 text-cyan-300 border border-cyan-500 shadow-sm shadow-cyan-500/20'
                        : 'bg-slate-950/70 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <span>{isSelected ? '✓' : '+'}</span>
                    <span>{facility}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-base tracking-wide shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/35 transition-all flex items-center justify-center gap-2"
            >
              <span>FIND BEST VENUE</span>
              <span className="text-lg">→</span>
            </button>
          </div>
        </form>
      </div>

      {/* Featured Venues Quick Peek */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white tracking-tight">Popular Campus Venues</h2>
          <span className="text-xs text-slate-400">12 total spaces mapped</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.slice(0, 3).map((v) => (
            <div
              key={v.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition group flex flex-col justify-between"
            >
              <div>
                <div className="h-40 relative overflow-hidden bg-slate-800">
                  <img
                    src={v.image}
                    alt={v.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                        v.status === 'available'
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                          : v.status === 'booked'
                          ? 'bg-rose-950/80 text-rose-300 border-rose-700'
                          : 'bg-amber-950/80 text-amber-300 border-amber-700'
                      }`}
                    >
                      {v.status === 'available' ? '● Available' : v.status === 'booked' ? '● In Use' : '● Pending'}
                    </span>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded text-[11px] font-semibold text-white">
                    Cap: {v.capacity}
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <div className="text-xs text-cyan-400 font-medium">{v.building}</div>
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition">
                    {v.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{v.description}</p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {v.facilities.slice(0, 3).map((f) => (
                      <span
                        key={f}
                        className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md"
                      >
                        {f}
                      </span>
                    ))}
                    {v.facilities.length > 3 && (
                      <span className="text-[10px] text-slate-500">
                        +{v.facilities.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0 flex items-center gap-2 border-t border-slate-800/80 mt-3">
                <button
                  onClick={() => onSelectVenueForMap(v)}
                  className="flex-1 text-xs font-semibold py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                >
                  View on Map
                </button>
                <button
                  onClick={() => onQuickBookVenue(v)}
                  className="flex-1 text-xs font-bold py-2 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black transition"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
