import React, { useState } from 'react';
import { Venue, Booking, UserRole, EventType, FacilityItem, BookingStatus } from '../types';

interface BookingModalProps {
  venue: Venue | null;
  initialMatchScore?: number;
  initialTime?: { startTime: string; endTime: string };
  currentRole: UserRole;
  onClose: () => void;
  onConfirmBooking: (booking: Booking) => void;
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

export const BookingModal: React.FC<BookingModalProps> = ({
  venue,
  initialMatchScore,
  initialTime,
  currentRole,
  onClose,
  onConfirmBooking
}) => {
  if (!venue) return null;

  const [eventName, setEventName] = useState<string>('Campus Technical Keynote');
  const [eventType, setEventType] = useState<EventType>('Seminar');
  const [organizerName, setOrganizerName] = useState<string>(
    currentRole === 'admin' ? 'Campus Admin' : (currentRole === 'student' ? 'Student Explorer' : 'Team Lead')
  );
  const [organizerEmail, setOrganizerEmail] = useState<string>(
    currentRole === 'admin' ? 'admin@campus.edu' : (currentRole === 'student' ? 'student@campus.edu' : 'teamlead@campus.edu')
  );
  const [attendance, setAttendance] = useState<number>(Math.min(venue.capacity, 25));
  const [date, setDate] = useState<string>('2026-09-16');
  const [startTime, setStartTime] = useState<string>(initialTime?.startTime || '10:00');
  const [endTime, setEndTime] = useState<string>(initialTime?.endTime || '12:00');
  const [requestedFacilities, setRequestedFacilities] = useState<FacilityItem[]>(
    venue.facilities.slice(0, 3)
  );
  const [notes, setNotes] = useState<string>('');

  // Low-risk auto-approval criteria:
  // - Attendance <= 30 attendees
  // - Normal daytime hours between 08:00 and 17:00
  // - Event types suitable for standard meeting/workshop/presentation
  const isLowRiskBooking =
    attendance <= 30 &&
    startTime >= '08:00' &&
    endTime <= '18:00' &&
    venue.capacity <= 200;

  const toggleFacility = (facility: FacilityItem) => {
    if (requestedFacilities.includes(facility)) {
      setRequestedFacilities(requestedFacilities.filter((f) => f !== facility));
    } else {
      setRequestedFacilities([...requestedFacilities, facility]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let calculatedStatus: BookingStatus = 'Pending';
    if (currentRole === 'admin') {
      calculatedStatus = 'Approved';
    } else if (isLowRiskBooking) {
      calculatedStatus = 'Auto-approved';
    } else {
      calculatedStatus = 'Pending';
    }

    const newBooking: Booking = {
      id: `BK-2026-${Math.floor(100 + Math.random() * 900)}`,
      venueId: venue.id,
      venueName: venue.name,
      building: venue.building,
      eventName,
      eventType,
      organizerName,
      organizerEmail,
      organizerRole: currentRole,
      attendance,
      date,
      startTime,
      endTime,
      status: calculatedStatus,
      requestedFacilities,
      notes: notes || undefined,
      matchScore: initialMatchScore || 95,
      createdAt: new Date().toISOString(),
      isAutoApproved: isLowRiskBooking
    };

    onConfirmBooking(newBooking);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0b1329] border border-slate-700/80 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-2">
          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-800/60">
            Venue Reservation
          </span>
          <span className="text-xs text-slate-400 font-mono">ID: {venue.id}</span>
        </div>

        <h2 className="text-2xl font-black text-white tracking-tight">{venue.name}</h2>
        <p className="text-xs text-slate-400 mb-5">
          {venue.building} • {venue.floor} • Maximum Capacity: {venue.capacity} attendees
        </p>

        {/* Auto-Approval Eligibility Indicator Card */}
        <div
          className={`p-3.5 rounded-2xl border mb-5 flex items-center gap-3 text-xs ${
            isLowRiskBooking
              ? 'bg-emerald-950/60 border-emerald-700/70 text-emerald-200'
              : 'bg-amber-950/60 border-amber-700/70 text-amber-200'
          }`}
        >
          <span className="text-xl">{isLowRiskBooking ? '⚡' : '⏳'}</span>
          <div>
            <div className="font-bold">
              {isLowRiskBooking
                ? 'Eligible for Instant Auto-Approval'
                : 'Requires Administrator Review'}
            </div>
            <div className="text-[11px] opacity-80">
              {isLowRiskBooking
                ? 'Low-risk reservation (≤30 attendees during normal campus hours). Room will be auto-approved immediately.'
                : 'Large attendance or peak period. Request will be submitted to the Admin Approval queue.'}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Event Title
            </label>
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-medium"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Event Type
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as EventType)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Expected Attendance (Max: {venue.capacity})
              </label>
              <input
                type="number"
                min="1"
                max={venue.capacity}
                value={attendance}
                onChange={(e) => setAttendance(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Available Venue Facilities ({requestedFacilities.length} requested):
            </label>
            <div className="flex flex-wrap gap-1.5">
              {venue.facilities.map((fac) => {
                const isSelected = requestedFacilities.includes(fac);
                return (
                  <button
                    type="button"
                    key={fac}
                    onClick={() => toggleFacility(fac)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
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
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Special Event Notes / Equipment Setup Requirements
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Podium placement, guest speaker arrival, recording request..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-400 resize-none placeholder-slate-500"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 text-white font-black text-xs uppercase tracking-wider shadow-xl shadow-cyan-500/20 transition"
            >
              Confirm Reservation →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
