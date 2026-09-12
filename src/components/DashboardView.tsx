import React, { useState, useMemo } from 'react';
import {
  EventType,
  FacilityItem,
  AIRecommendationRequest,
  AIRecommendationResult,
  Venue,
  Booking
} from '../types';
import { rankVenues } from '../utils/aiRecommender';

interface DashboardViewProps {
  onFindBestVenue: (req: AIRecommendationRequest) => void;
  venues: Venue[];
  bookings: Booking[];
  onSelectVenueForMap: (venue: Venue) => void;
  onQuickBookVenue: (venue: Venue, prefillTime?: { startTime: string; endTime: string }) => void;
}

const EVENT_TYPES: EventType[] = [
  'Seminar',
  'Workshop',
  'Club Meeting',
  'Cultural Event',
  'Hackathon',
  'Presentation',
  'Sports Activity',
  'Conference',
  'Examination',
  'Exhibition'
];

const ALL_FACILITIES: FacilityItem[] = [
  'Projector',
  'Air conditioning',
  'Sound system',
  'Microphone',
  'Wi-Fi',
  'Stage',
  'Whiteboard',
  'Computer systems'
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  onFindBestVenue,
  venues,
  bookings,
  onSelectVenueForMap,
  onQuickBookVenue
}) => {
  // Organizer Search & Timing Controls
  const [date, setDate] = useState<string>('2026-09-15');
  const [startTime, setStartTime] = useState<string>('10:00');
  const [endTime, setEndTime] = useState<string>('12:00');
  const [flexibleTiming, setFlexibleTiming] = useState<boolean>(false);

  // View Mode: Cards or Table
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [capacityFilter, setCapacityFilter] = useState<'all' | 'small' | 'medium' | 'large'>('all');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');
  const [selectedFacilityFilters, setSelectedFacilityFilters] = useState<FacilityItem[]>([]);
  const [availabilityOnly, setAvailabilityOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'name' | 'capacityAsc' | 'capacityDesc' | 'rating'>('rating');

  // AI Recommendation Section State
  const [aiEventType, setAiEventType] = useState<EventType>('Seminar');
  const [aiAttendance, setAiAttendance] = useState<number>(120);
  const [aiFacilities, setAiFacilities] = useState<FacilityItem[]>([
    'Projector',
    'Air conditioning',
    'Wi-Fi'
  ]);
  const [aiResults, setAiResults] = useState<AIRecommendationResult[]>(() => {
    return rankVenues(venues, {
      eventType: 'Seminar',
      attendance: 120,
      date: '2026-09-15',
      startTime: '10:00',
      endTime: '12:00',
      requiredFacilities: ['Projector', 'Air conditioning', 'Wi-Fi']
    });
  });

  const buildings = useMemo(() => {
    return Array.from(new Set(venues.map((v) => v.building)));
  }, [venues]);

  // Dynamic Time Slot generation for a venue on selected date & time
  const getVenueSlots = (venue: Venue) => {
    const defaultSlots = [
      { startTime: '08:00', endTime: '10:00' },
      { startTime: '10:00', endTime: '12:00' },
      { startTime: '12:00', endTime: '14:00' },
      { startTime: '14:00', endTime: '16:00' },
      { startTime: '16:00', endTime: '18:00' },
      { startTime: '18:00', endTime: '20:00' }
    ];

    // Check if venue is booked by existing bookings on this date
    return defaultSlots.map((slot) => {
      const isConflict = bookings.some(
        (b) =>
          b.venueId === venue.id &&
          b.date === date &&
          b.status !== 'Rejected' &&
          b.status !== 'Cancelled' &&
          !(b.endTime <= slot.startTime || b.startTime >= slot.endTime)
      );
      return {
        ...slot,
        isAvailable: !isConflict
      };
    });
  };

  // Filter & Sort Venues
  const filteredVenues = useMemo(() => {
    return venues
      .filter((v) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = v.name.toLowerCase().includes(q);
          const matchBuilding = v.building.toLowerCase().includes(q);
          if (!matchName && !matchBuilding) return false;
        }

        // Capacity filter
        if (capacityFilter === 'small' && v.capacity >= 50) return false;
        if (capacityFilter === 'medium' && (v.capacity < 50 || v.capacity > 200)) return false;
        if (capacityFilter === 'large' && v.capacity <= 200) return false;

        // Building filter
        if (selectedBuilding !== 'all' && v.building !== selectedBuilding) return false;

        // Facilities filter
        if (selectedFacilityFilters.length > 0) {
          const hasAllFacilities = selectedFacilityFilters.every((f) => v.facilities.includes(f));
          if (!hasAllFacilities) return false;
        }

        // Availability filter
        if (availabilityOnly) {
          const slots = getVenueSlots(v);
          const isSlotAvailable = slots.some((s) => s.startTime === startTime && s.isAvailable);
          if (!isSlotAvailable && v.status !== 'available') return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'capacityAsc') return a.capacity - b.capacity;
        if (sortBy === 'capacityDesc') return b.capacity - a.capacity;
        if (sortBy === 'rating') return b.historicalAverageOccupancy - a.historicalAverageOccupancy;
        return 0;
      });
  }, [
    venues,
    searchQuery,
    capacityFilter,
    selectedBuilding,
    selectedFacilityFilters,
    availabilityOnly,
    sortBy,
    date,
    startTime
  ]);

  const handleAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const req: AIRecommendationRequest = {
      eventType: aiEventType,
      attendance: Number(aiAttendance),
      date,
      startTime,
      endTime,
      requiredFacilities: aiFacilities,
      flexibleTiming
    };
    const results = rankVenues(venues, req);
    setAiResults(results);
    onFindBestVenue(req);
  };

  const toggleAiFacility = (f: FacilityItem) => {
    if (aiFacilities.includes(f)) {
      setAiFacilities(aiFacilities.filter((item) => item !== f));
    } else {
      setAiFacilities([...aiFacilities, f]);
    }
  };

  const toggleFacilityFilter = (f: FacilityItem) => {
    if (selectedFacilityFilters.includes(f)) {
      setSelectedFacilityFilters(selectedFacilityFilters.filter((item) => item !== f));
    } else {
      setSelectedFacilityFilters([...selectedFacilityFilters, f]);
    }
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto text-slate-100 font-sans pb-12">
      {/* Organizer Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0d1c3a] via-slate-900 to-[#0e2246] border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 text-xs font-semibold mb-3">
              <span>📅</span>
              <span>Campus Venue Allocation & Booking Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Find & Reserve the Ideal Campus Space
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Dynamically browse available venue slots, filter by equipment and capacity, or let our AI Matchmaker score the best space for your event.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-900/90 border border-slate-700/80 px-4 py-3 rounded-2xl text-center shadow-lg">
              <span className="block text-2xl font-black text-cyan-400">{venues.length}</span>
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Spaces</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-700/80 px-4 py-3 rounded-2xl text-center shadow-lg">
              <span className="block text-2xl font-black text-emerald-400">
                {venues.filter((v) => v.status === 'available').length}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400">Available Today</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: TIMING & TIME SLOTS SELECTION BAR */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <span>⏰</span>
              <span>Step 1: Set Event Date & Preferred Timing</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Time slots update dynamically to show real-time availability across all campus spaces.
            </p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-200 select-none bg-slate-950/80 px-3.5 py-1.5 rounded-xl border border-slate-700/80">
            <input
              type="checkbox"
              checked={flexibleTiming}
              onChange={(e) => setFlexibleTiming(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700"
            />
            <span>Flexible Timing (±1 hr window)</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Event Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Preferred Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Preferred End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-medium"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: AI VENUE RECOMMENDATION */}
      <div className="bg-gradient-to-b from-[#0b162c] to-slate-900 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xl">
              🤖
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>AI Venue Recommendation Engine</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/60">
                  Smart Optimization
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Input your event requirements to generate ranked venues with transparent suitability explanations.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleAiSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Event Type
              </label>
              <select
                value={aiEventType}
                onChange={(e) => setAiEventType(e.target.value as EventType)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl px-4 py-3 text-xs text-slate-100 font-medium focus:outline-none focus:border-cyan-400"
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Expected Attendance / Capacity
              </label>
              <input
                type="number"
                min="5"
                max="1500"
                value={aiAttendance}
                onChange={(e) => setAiAttendance(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl px-4 py-3 text-xs text-slate-100 font-medium focus:outline-none focus:border-cyan-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target Slot
              </label>
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-cyan-300 font-mono">
                {date} ({startTime} - {endTime})
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Required Facilities ({aiFacilities.length} selected):
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_FACILITIES.map((fac) => {
                const isSelected = aiFacilities.includes(fac);
                return (
                  <button
                    type="button"
                    key={fac}
                    onClick={() => toggleAiFacility(fac)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500 shadow-sm'
                        : 'bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{isSelected ? '✓' : '+'}</span>
                    <span>{fac}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition flex items-center justify-center gap-2"
          >
            <span>Run AI Venue Recommendation</span>
            <span>✨</span>
          </button>
        </form>

        {/* Top AI Recommendations Cards */}
        {aiResults.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Top Recommendation Matches ({aiResults.length} ranked)
              </span>
              <span className="text-[11px] text-slate-400">Ranked by capacity fit, facilities & time availability</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {aiResults.slice(0, 3).map((rec, idx) => {
                const medal = idx === 0 ? '🥇 Top Match' : idx === 1 ? '🥈 Alternative' : '🥉 Third Option';
                return (
                  <div
                    key={rec.venue.id}
                    className={`p-5 rounded-2xl border flex flex-col justify-between transition ${
                      idx === 0
                        ? 'bg-slate-900/90 border-cyan-500/80 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/30'
                        : 'bg-slate-900/70 border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                            idx === 0 ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {medal}
                        </span>
                        <div className="text-sm font-black text-cyan-300 bg-cyan-950/80 border border-cyan-800/50 px-2 py-0.5 rounded-lg">
                          {rec.matchScore}% Match
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-white">{rec.venue.name}</h3>
                      <p className="text-xs text-slate-400 mb-3">{rec.venue.building} • Max Cap: {rec.venue.capacity}</p>

                      {/* Suitability Explanation */}
                      <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800/90 text-xs text-slate-200 mb-3 leading-relaxed">
                        <span className="text-cyan-400 font-bold block text-[10px] uppercase mb-1">
                          Why Recommended:
                        </span>
                        {rec.whyRecommended}
                      </div>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {rec.venue.facilities.slice(0, 4).map((f) => (
                          <span
                            key={f}
                            className="text-[10px] bg-slate-800/90 text-slate-300 px-2 py-0.5 rounded flex items-center gap-1"
                          >
                            <span className="text-cyan-400">✓</span>
                            <span>{f}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        onQuickBookVenue(rec.venue, { startTime, endTime })
                      }
                      className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs uppercase tracking-wider transition"
                    >
                      Book This Venue →
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: VENUE CATALOG (SEARCH, FILTERS, CARD & TABLE VIEW) */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span>🏛️</span>
              <span>Campus Venue Catalog</span>
              <span className="text-xs font-bold text-cyan-400 bg-cyan-950/80 px-2.5 py-0.5 rounded-full border border-cyan-800/60">
                {filteredVenues.length} Spaces
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Explore room capacities, dynamic time slot availability, and equipment amenities.
            </p>
          </div>

          {/* Card / Table Switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-2xl p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                viewMode === 'cards'
                  ? 'bg-cyan-500 text-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>▦</span>
              <span>Card View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                viewMode === 'table'
                  ? 'bg-cyan-500 text-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>☵</span>
              <span>Table View</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Search Venue</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search venue name, building..."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Capacity Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Capacity</label>
              <select
                value={capacityFilter}
                onChange={(e) => setCapacityFilter(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
              >
                <option value="all">All Capacities</option>
                <option value="small">Small (&lt; 50 people)</option>
                <option value="medium">Medium (50 - 200 people)</option>
                <option value="large">Large (200+ people)</option>
              </select>
            </div>

            {/* Building Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Building</label>
              <select
                value={selectedBuilding}
                onChange={(e) => setSelectedBuilding(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
              >
                <option value="all">All Buildings</option>
                {buildings.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
              >
                <option value="rating">Popularity / Rating</option>
                <option value="capacityDesc">Capacity (High to Low)</option>
                <option value="capacityAsc">Capacity (Low to High)</option>
                <option value="name">Name (Alphabetical)</option>
              </select>
            </div>
          </div>

          {/* Quick Facilities Filter Chips */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-400">
                Filter by Facilities:
              </span>
              {selectedFacilityFilters.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedFacilityFilters([])}
                  className="text-[10px] text-rose-400 hover:text-rose-300 font-bold"
                >
                  Clear facility filters
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ALL_FACILITIES.map((fac) => {
                const active = selectedFacilityFilters.includes(fac);
                return (
                  <button
                    type="button"
                    key={fac}
                    onClick={() => toggleFacilityFilter(fac)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${
                      active
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500 font-bold'
                        : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {active ? '✓ ' : '+ '}
                    {fac}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredVenues.length === 0 && (
          <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl">
            <span className="text-3xl block mb-2">🔍</span>
            <h3 className="text-base font-bold text-white mb-1">No venues match your current filters</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
              Try removing some facility filters or selecting a wider capacity range.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setCapacityFilter('all');
                setSelectedBuilding('all');
                setSelectedFacilityFilters([]);
              }}
              className="px-4 py-2 rounded-xl bg-cyan-500 text-black text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* VIEW 1: CARD VIEW */}
        {viewMode === 'cards' && filteredVenues.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVenues.map((venue) => {
              const slots = getVenueSlots(venue);
              const isSlotOpenAtPreferred = slots.some(
                (s) => s.startTime === startTime && s.isAvailable
              );

              return (
                <div
                  key={venue.id}
                  className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col justify-between hover:border-slate-700 transition group shadow-xl"
                >
                  <div>
                    {/* Image Banner */}
                    <div className="h-44 relative overflow-hidden bg-slate-950">
                      <img
                        src={venue.image}
                        alt={venue.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute top-3 left-3 flex gap-1.5">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-sm text-white">
                          👥 Cap: {venue.capacity}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm ${
                            isSlotOpenAtPreferred
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700'
                              : 'bg-amber-950/80 text-amber-300 border border-amber-700'
                          }`}
                        >
                          ● {isSlotOpenAtPreferred ? 'Slot Open' : 'Busy at Target'}
                        </span>
                      </div>
                    </div>

                    {/* Venue Body */}
                    <div className="p-5">
                      <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                        {venue.building} • {venue.floor}
                      </span>
                      <h3 className="text-lg font-bold text-white mt-0.5 mb-1.5">{venue.name}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                        {venue.description}
                      </p>

                      {/* Available Time Slots Pill Grid */}
                      <div className="mb-4">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                          Available Slots ({date}):
                        </span>
                        <div className="grid grid-cols-3 gap-1.5">
                          {slots.map((s) => (
                            <button
                              type="button"
                              key={s.startTime}
                              onClick={() => {
                                if (s.isAvailable) {
                                  onQuickBookVenue(venue, {
                                    startTime: s.startTime,
                                    endTime: s.endTime
                                  });
                                }
                              }}
                              disabled={!s.isAvailable}
                              className={`py-1 px-1.5 rounded-lg text-[10px] font-mono text-center transition ${
                                s.isAvailable
                                  ? 'bg-slate-950 hover:bg-cyan-500 hover:text-black text-slate-200 border border-slate-800'
                                  : 'bg-rose-950/40 text-rose-400/60 border border-rose-950 cursor-not-allowed line-through'
                              }`}
                              title={s.isAvailable ? 'Click to book this slot' : 'Booked slot'}
                            >
                              {s.startTime}-{s.endTime}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Facilities Badges */}
                      <div className="flex flex-wrap gap-1">
                        {venue.facilities.map((f) => (
                          <span
                            key={f}
                            className="text-[10px] bg-slate-950 text-slate-300 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1"
                          >
                            <span className="text-cyan-400">✓</span>
                            <span>{f}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-5 pt-0 flex gap-2">
                    <button
                      onClick={() => onSelectVenueForMap(venue)}
                      className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition"
                    >
                      Campus Map 📍
                    </button>
                    <button
                      onClick={() => onQuickBookVenue(venue, { startTime, endTime })}
                      className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-black transition uppercase tracking-wider"
                    >
                      Book Space
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW 2: TABLE VIEW */}
        {viewMode === 'table' && filteredVenues.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-200">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-4 px-6">Venue Name</th>
                    <th className="py-4 px-4">Building & Floor</th>
                    <th className="py-4 px-3 text-center">Capacity</th>
                    <th className="py-4 px-4">Facilities</th>
                    <th className="py-4 px-4">Slot Availability ({date})</th>
                    <th className="py-4 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredVenues.map((v) => {
                    const slots = getVenueSlots(v);
                    const openSlotsCount = slots.filter((s) => s.isAvailable).length;

                    return (
                      <tr key={v.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-4 px-6 font-bold text-white">
                          <div className="flex items-center gap-3">
                            <img
                              src={v.image}
                              alt={v.name}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-800"
                            />
                            <div>
                              <div>{v.name}</div>
                              <span className="text-[10px] text-cyan-400 capitalize font-medium">
                                Class {v.energyRating} Energy
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-medium text-slate-200">{v.building}</div>
                          <div className="text-[10px] text-slate-400">{v.floor}</div>
                        </td>
                        <td className="py-4 px-3 text-center">
                          <span className="font-bold text-white bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                            {v.capacity}
                          </span>
                        </td>
                        <td className="py-4 px-4 max-w-xs">
                          <div className="flex flex-wrap gap-1">
                            {v.facilities.slice(0, 3).map((f) => (
                              <span key={f} className="text-[9px] bg-slate-950 text-slate-300 px-1.5 py-0.5 rounded">
                                {f}
                              </span>
                            ))}
                            {v.facilities.length > 3 && (
                              <span className="text-[9px] text-slate-400">
                                +{v.facilities.length - 3} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              openSlotsCount > 0
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-rose-950 text-rose-300 border border-rose-800'
                            }`}
                          >
                            {openSlotsCount} / {slots.length} Slots Open
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => onQuickBookVenue(v, { startTime, endTime })}
                            className="py-1.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs transition"
                          >
                            Book Slot
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
