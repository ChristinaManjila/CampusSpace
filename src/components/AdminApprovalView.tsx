import React, { useState } from 'react';
import { Booking, Venue, FacilityItem, VenueStatus } from '../types';

interface AdminApprovalViewProps {
  bookings: Booking[];
  venues: Venue[];
  onApproveBooking: (bookingId: string) => void;
  onRejectBooking: (bookingId: string) => void;
  onCancelBooking: (bookingId: string) => void;
  onSaveVenue: (venue: Venue) => void;
}

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

export const AdminApprovalView: React.FC<AdminApprovalViewProps> = ({
  bookings,
  venues,
  onApproveBooking,
  onRejectBooking,
  onCancelBooking,
  onSaveVenue
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'approvals' | 'venues' | 'utilization'>('approvals');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [isVenueModalOpen, setIsVenueModalOpen] = useState<boolean>(false);

  // Form State for Adding / Editing Venue
  const [venueName, setVenueName] = useState('');
  const [venueBuilding, setVenueBuilding] = useState('Academic Block 1');
  const [venueCapacity, setVenueCapacity] = useState(100);
  const [venueFloor, setVenueFloor] = useState('1st Floor');
  const [venueStatus, setVenueStatus] = useState<VenueStatus>('available');
  const [venueFacilities, setVenueFacilities] = useState<FacilityItem[]>(['Projector', 'Air conditioning', 'Wi-Fi']);
  const [venueDesc, setVenueDesc] = useState('');

  // Summary Metrics calculations
  const totalVenues = venues.length;
  const pendingApprovals = bookings.filter((b) => b.status === 'Pending').length;
  const todayDate = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter((b) => b.date === todayDate || b.date === '2026-09-12').length;
  const avgUtilization = Math.round(
    venues.reduce((acc, v) => acc + (v.historicalAverageOccupancy || 75), 0) / venues.length
  );
  const avgNoShowRate = (
    venues.reduce((acc, v) => acc + (v.cancellationRate || 3.0), 0) / venues.length
  ).toFixed(1);

  // Filtered Bookings Table
  const filteredBookings = bookings.filter((b) => {
    if (statusFilter === 'all') return true;
    return b.status.toLowerCase() === statusFilter.toLowerCase();
  });

  const handleOpenAddVenue = () => {
    setEditingVenue(null);
    setVenueName('');
    setVenueBuilding('Academic Block 1');
    setVenueCapacity(80);
    setVenueFloor('Ground Floor');
    setVenueStatus('available');
    setVenueFacilities(['Projector', 'Air conditioning', 'Wi-Fi']);
    setVenueDesc('Multi-purpose academic presentation space with high-speed internet.');
    setIsVenueModalOpen(true);
  };

  const handleOpenEditVenue = (venue: Venue) => {
    setEditingVenue(venue);
    setVenueName(venue.name);
    setVenueBuilding(venue.building);
    setVenueCapacity(venue.capacity);
    setVenueFloor(venue.floor);
    setVenueStatus(venue.status);
    setVenueFacilities([...venue.facilities]);
    setVenueDesc(venue.description);
    setIsVenueModalOpen(true);
  };

  const handleSaveVenueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedVenue: Venue = {
      id: editingVenue ? editingVenue.id : `venue-${Date.now()}`,
      name: venueName.trim(),
      building: venueBuilding.trim(),
      category: editingVenue ? editingVenue.category : 'hall',
      capacity: Number(venueCapacity),
      floor: venueFloor.trim(),
      coordinates: editingVenue ? editingVenue.coordinates : { lat: 19.1335, lng: 72.9135 },
      facilities: venueFacilities,
      status: venueStatus,
      energyRating: editingVenue ? editingVenue.energyRating : 'A',
      historicalSuitability: editingVenue ? editingVenue.historicalSuitability : { Seminar: 90, Workshop: 85 },
      cancellationRate: editingVenue ? editingVenue.cancellationRate : 2.5,
      historicalAverageOccupancy: editingVenue ? editingVenue.historicalAverageOccupancy : 78,
      description: venueDesc.trim(),
      image: editingVenue
        ? editingVenue.image
        : 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
      contactPerson: editingVenue ? editingVenue.contactPerson : 'Facilities Desk (Ext: 1000)',
      noiseLevel: editingVenue ? editingVenue.noiseLevel : 'Moderate',
      wheelchairAccessible: true
    };

    onSaveVenue(updatedVenue);
    setIsVenueModalOpen(false);
  };

  const toggleVenueFacility = (fac: FacilityItem) => {
    if (venueFacilities.includes(fac)) {
      setVenueFacilities(venueFacilities.filter((f) => f !== fac));
    } else {
      setVenueFacilities([...venueFacilities, fac]);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-white font-sans pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#0d1c3a] via-slate-900 to-[#1e1335] p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-800/60 text-rose-300 text-xs font-semibold mb-2">
            <span>🛡️</span>
            <span>Campus Administration & Governance Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            CampusSpace Administration Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Review event booking requests, manage venue availability, and track campus resource utilization analytics.
          </p>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-1.5 bg-slate-950/90 border border-slate-800 p-1.5 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('approvals')}
            className={`px-3.5 py-2 rounded-xl transition ${
              activeSubTab === 'approvals'
                ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📋 Approvals ({pendingApprovals})
          </button>
          <button
            onClick={() => setActiveSubTab('venues')}
            className={`px-3.5 py-2 rounded-xl transition ${
              activeSubTab === 'venues'
                ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🏛️ Venue Management
          </button>
          <button
            onClick={() => setActiveSubTab('utilization')}
            className={`px-3.5 py-2 rounded-xl transition ${
              activeSubTab === 'utilization'
                ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📊 Utilization Charts
          </button>
        </div>
      </div>

      {/* SUMMARY METRICS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#0b1329] border border-slate-800 shadow-lg">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Total Venues
          </span>
          <span className="text-2xl sm:text-3xl font-black text-cyan-400">{totalVenues}</span>
          <span className="text-[10px] text-slate-400 block mt-1">Across 6 Complexes</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0b1329] border border-slate-800 shadow-lg">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Today's Bookings
          </span>
          <span className="text-2xl sm:text-3xl font-black text-blue-400">{todayBookings}</span>
          <span className="text-[10px] text-emerald-400 block mt-1">✓ Active Slots</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0b1329] border border-slate-800 shadow-lg">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Pending Approvals
          </span>
          <span className="text-2xl sm:text-3xl font-black text-amber-400">{pendingApprovals}</span>
          <span className="text-[10px] text-amber-300 block mt-1">Action Required</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0b1329] border border-slate-800 shadow-lg">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Avg Utilization
          </span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-400">{avgUtilization}%</span>
          <span className="text-[10px] text-emerald-300 block mt-1">Healthy Capacity</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0b1329] border border-slate-800 shadow-lg col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            No-Show Rate
          </span>
          <span className="text-2xl sm:text-3xl font-black text-indigo-400">{avgNoShowRate}%</span>
          <span className="text-[10px] text-slate-400 block mt-1">Historical Campus Avg</span>
        </div>
      </div>

      {/* SUBTAB 1: BOOKING MANAGEMENT TABLE */}
      {activeSubTab === 'approvals' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>📋</span>
                <span>Booking Requests & Approval Console</span>
              </h2>
              <p className="text-xs text-slate-400">
                Review incoming reservations, verify equipment requirements, and approve or reject submissions.
              </p>
            </div>

            {/* Status Filter Chips */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
              {['all', 'pending', 'auto-approved', 'approved', 'rejected'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`capitalize px-2.5 py-1 rounded-lg font-semibold transition text-[11px] ${
                    statusFilter === s
                      ? 'bg-rose-500 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#0b1329] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-200">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-4 px-5">ID & Event</th>
                    <th className="py-4 px-4">Venue & Location</th>
                    <th className="py-4 px-4">Organizer</th>
                    <th className="py-4 px-3 text-center">Attendees</th>
                    <th className="py-4 px-4">Date & Time</th>
                    <th className="py-4 px-3 text-center">Status</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No bookings match the selected status filter.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-850 transition">
                        <td className="py-4 px-5">
                          <div className="font-mono text-[11px] text-cyan-400">{b.id}</div>
                          <div className="font-bold text-white text-sm mt-0.5">{b.eventName}</div>
                          <span className="text-[10px] text-slate-400">{b.eventType}</span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-semibold text-slate-100">{b.venueName}</div>
                          <div className="text-[11px] text-slate-400">{b.building}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-medium text-slate-200">{b.organizerName}</div>
                          <div className="text-[10px] text-slate-400">{b.organizerEmail}</div>
                        </td>
                        <td className="py-4 px-3 text-center font-bold text-slate-100">
                          {b.attendance}
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-medium text-slate-200">{b.date}</div>
                          <div className="text-[10px] text-cyan-300 font-mono">
                            {b.startTime} - {b.endTime}
                          </div>
                        </td>
                        <td className="py-4 px-3 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block ${
                              b.status === 'Approved'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                                : b.status === 'Auto-approved'
                                ? 'bg-teal-950 text-teal-300 border border-teal-700'
                                : b.status === 'Pending'
                                ? 'bg-amber-950 text-amber-300 border border-amber-700 animate-pulse'
                                : 'bg-rose-950 text-rose-300 border border-rose-800'
                            }`}
                          >
                            ● {b.status}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {b.status === 'Pending' && (
                              <>
                                <button
                                  onClick={() => onApproveBooking(b.id)}
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-black font-bold text-[11px] transition border border-emerald-500/40"
                                  title="Approve Booking"
                                >
                                  Approve ✓
                                </button>
                                <button
                                  onClick={() => onRejectBooking(b.id)}
                                  className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white font-bold text-[11px] transition border border-rose-500/40"
                                  title="Reject Booking"
                                >
                                  Reject ✕
                                </button>
                              </>
                            )}
                            {b.status !== 'Pending' && b.status !== 'Cancelled' && (
                              <button
                                onClick={() => onCancelBooking(b.id)}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 text-[11px] font-semibold transition"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: VENUE MANAGEMENT (ADD / EDIT) */}
      {activeSubTab === 'venues' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>🏛️</span>
                <span>Campus Venue Management</span>
              </h2>
              <p className="text-xs text-slate-400">
                Add new conference halls, edit capacities, update facilities, and toggle maintenance status.
              </p>
            </div>
            <button
              onClick={handleOpenAddVenue}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-black font-extrabold text-xs tracking-wider transition shadow-lg flex items-center gap-1.5"
            >
              <span>+</span>
              <span>Add New Venue</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {venues.map((venue) => (
              <div
                key={venue.id}
                className="bg-[#0b1329] border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-xl"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-[10px] font-bold text-cyan-400 uppercase">
                        {venue.building} • {venue.floor}
                      </span>
                      <h3 className="text-base font-bold text-white mt-0.5">{venue.name}</h3>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        venue.status === 'available'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                          : 'bg-rose-950 text-rose-300 border border-rose-700'
                      }`}
                    >
                      {venue.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/80 p-3 rounded-xl border border-slate-800 mb-3">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Capacity</span>
                      <span className="font-bold text-white">{venue.capacity} seats</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Energy Rating</span>
                      <span className="font-bold text-emerald-400">Class {venue.energyRating}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {venue.facilities.map((f) => (
                      <span
                        key={f}
                        className="text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800"
                      >
                        ✓ {f}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleOpenEditVenue(venue)}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <span>✏️</span>
                  <span>Edit Venue Details</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: UTILIZATION DASHBOARD & CHARTS */}
      {activeSubTab === 'utilization' && (
        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>📊</span>
              <span>Campus Resource Utilization & Predictive Analytics</span>
            </h2>
            <p className="text-xs text-slate-400">
              Analysis of booking volumes, peak demand periods, room efficiency, and underused spaces.
            </p>
          </div>

          {/* Actionable Insights Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-3xl bg-amber-950/40 border border-amber-800/60 flex items-start gap-3.5">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Overbooked Bottleneck Alert
                </h3>
                <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                  <strong>Main Auditorium</strong> has 91% average occupancy on Fridays and weekend evenings. Suggest routing medium conferences (&lt; 200) to <strong>Seminar Hall A</strong> to prevent schedule congestion.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-cyan-950/40 border border-cyan-800/60 flex items-start gap-3.5">
              <span className="text-2xl">💡</span>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                  Underused Space Optimization
                </h3>
                <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                  <strong>Conference Room B</strong> and <strong>Open Amphitheatre</strong> have lower morning utilization (38%-45%). Recommend releasing morning windows for student group study and club rehearsals.
                </p>
              </div>
            </div>
          </div>

          {/* Chart Section 1: Most vs Least Booked Venues */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#0b1329] border border-slate-800 p-6 rounded-3xl shadow-xl">
              <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 mb-4 flex items-center gap-2">
                <span>📈</span>
                <span>Venue Utilization Percentage</span>
              </h3>
              <div className="space-y-3.5">
                {venues.map((v) => (
                  <div key={v.id} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-200">{v.name}</span>
                      <span className="text-cyan-400">{v.historicalAverageOccupancy}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          v.historicalAverageOccupancy > 85
                            ? 'bg-gradient-to-r from-cyan-400 to-blue-500'
                            : v.historicalAverageOccupancy > 70
                            ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                            : 'bg-gradient-to-r from-amber-400 to-orange-500'
                        }`}
                        style={{ width: `${v.historicalAverageOccupancy}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart Section 2: Booking Volume by Day of the Week */}
            <div className="bg-[#0b1329] border border-slate-800 p-6 rounded-3xl shadow-xl">
              <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 mb-4 flex items-center gap-2">
                <span>📅</span>
                <span>Booking Volume by Day of Week</span>
              </h3>
              <div className="grid grid-cols-7 gap-2 items-end h-48 pt-6 pb-2 text-center text-xs">
                {[
                  { day: 'Mon', count: 18, height: '55%' },
                  { day: 'Tue', count: 24, height: '75%' },
                  { day: 'Wed', count: 32, height: '95%' },
                  { day: 'Thu', count: 28, height: '85%' },
                  { day: 'Fri', count: 34, height: '100%' },
                  { day: 'Sat', count: 22, height: '70%' },
                  { day: 'Sun', count: 12, height: '40%' }
                ].map((item) => (
                  <div key={item.day} className="flex flex-col items-center h-full justify-end group">
                    <span className="text-[10px] text-slate-400 mb-1 group-hover:text-cyan-400 font-bold">
                      {item.count}
                    </span>
                    <div
                      className="w-full max-w-[28px] bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-lg transition-all group-hover:brightness-125"
                      style={{ height: item.height }}
                    />
                    <span className="text-[10px] text-slate-400 mt-2 font-semibold">{item.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Peak Demand Periods & High-Demand Forecast */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#0b1329] border border-slate-800 p-6 rounded-3xl shadow-xl">
              <h3 className="text-sm font-bold uppercase tracking-wider text-rose-400 mb-2 flex items-center gap-2">
                <span>⏰</span>
                <span>Peak Campus Demand Periods</span>
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Average simultaneous bookings across campus by 2-hour daily slots:
              </p>
              <div className="space-y-2.5 text-xs">
                {[
                  { time: '08:00 - 10:00 (Early Morning)', level: 'Moderate (42% busy)', pct: 42, color: 'bg-emerald-500' },
                  { time: '10:00 - 12:00 (Peak Morning Keynotes)', level: 'High Demand (88% busy)', pct: 88, color: 'bg-rose-500' },
                  { time: '12:00 - 14:00 (Lunch & Seminars)', level: 'Moderate (55% busy)', pct: 55, color: 'bg-blue-500' },
                  { time: '14:00 - 16:00 (Prime Workshop Slot)', level: 'High Demand (92% busy)', pct: 92, color: 'bg-rose-500' },
                  { time: '16:00 - 18:00 (Clubs & Cultural)', level: 'High Demand (78% busy)', pct: 78, color: 'bg-amber-500' },
                  { time: '18:00 - 20:00 (Evening Rehearsals)', level: 'Moderate (48% busy)', pct: 48, color: 'bg-emerald-500' }
                ].map((slot) => (
                  <div key={slot.time} className="p-2.5 rounded-xl bg-slate-950 border border-slate-850">
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold text-slate-200">{slot.time}</span>
                      <span className="text-[11px] font-bold text-slate-300">{slot.level}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div className={`h-full ${slot.color}`} style={{ width: `${slot.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* High-Demand Forecast Card */}
            <div className="bg-[#0b1329] border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400 mb-2 flex items-center gap-2">
                  <span>🔮</span>
                  <span>High-Demand Predictive Forecast</span>
                </h3>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  Based on historical semester analytics, these upcoming campus periods require early reservation:
                </p>

                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center justify-between font-bold text-white mb-1">
                      <span>October 12 - 16: National Tech Symposium</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-mono">
                        98% Projected Load
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      High competition for Main Auditorium & Innovation Lab. Recommended action: Submit reservations 3 weeks in advance.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center justify-between font-bold text-white mb-1">
                      <span>November 02 - 08: Inter-College Cultural Week</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-mono">
                        89% Projected Load
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Open Amphitheatre and sports grounds heavily booked during evenings.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center justify-between font-bold text-white mb-1">
                      <span>December 01 - 12: Final Semester Examinations</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-mono">
                        94% Projected Load
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      All Computer Systems Labs and Seminar Halls reserved for scheduled university evaluations.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-purple-950/30 border border-purple-800/40 text-[11px] text-purple-200">
                ✨ <em>CampusSpace AI proactively alerts organizers when scheduling overlaps with predicted peak campus events.</em>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VENUE ADD / EDIT MODAL */}
      {isVenueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0b1329] border border-slate-700 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-white max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsVenueModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2"
            >
              ✕
            </button>

            <h3 className="text-xl font-bold text-white mb-1">
              {editingVenue ? 'Edit Campus Venue' : 'Add New Campus Venue'}
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Update room specifications, seating capacity, and standard equipment amenities.
            </p>

            <form onSubmit={handleSaveVenueSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Venue Name</label>
                <input
                  type="text"
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  placeholder="e.g. Seminar Hall C"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Building</label>
                  <input
                    type="text"
                    value={venueBuilding}
                    onChange={(e) => setVenueBuilding(e.target.value)}
                    placeholder="e.g. Academic Block 1"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Capacity</label>
                  <input
                    type="number"
                    min="5"
                    max="2000"
                    value={venueCapacity}
                    onChange={(e) => setVenueCapacity(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Floor</label>
                  <input
                    type="text"
                    value={venueFloor}
                    onChange={(e) => setVenueFloor(e.target.value)}
                    placeholder="e.g. 2nd Floor"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                  <select
                    value={venueStatus}
                    onChange={(e) => setVenueStatus(e.target.value as VenueStatus)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="available">Available</option>
                    <option value="maintenance">Under Maintenance</option>
                    <option value="booked">Booked</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Installed Facilities ({venueFacilities.length} selected):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_FACILITIES.map((fac) => {
                    const isSelected = venueFacilities.includes(fac);
                    return (
                      <button
                        type="button"
                        key={fac}
                        onClick={() => toggleVenueFacility(fac)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${
                          isSelected
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500 font-bold'
                            : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {fac}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={venueDesc}
                  onChange={(e) => setVenueDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-400 resize-none"
                  required
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsVenueModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-xs font-bold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-cyan-500 text-black font-extrabold text-xs"
                >
                  Save Venue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
