import React, { useState } from 'react';
import { Venue, Booking, UserRole, FacilityItem } from '../types';

interface BookingModalProps {
  venue: Venue | null;
  initialMatchScore?: number;
  currentRole: UserRole;
  onClose: () => void;
  onConfirmBooking: (booking: Booking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  venue,
  initialMatchScore,
  currentRole,
  onClose,
  onConfirmBooking
}) => {
  if (!venue) return null;

  const [eventName, setEventName] = useState<string>('AI Innovation Workshop');
  const [organizerName, setOrganizerName] = useState<string>(
    currentRole === 'admin' ? 'Campus Admin' : currentRole === 'organizer' ? 'Pooja Hegde' : 'Aarav Patel'
  );
  const [organizerEmail, setOrganizerEmail] = useState<string>('organizer@campus.edu');
  const [attendance, setAttendance] = useState<number>(Math.min(venue.capacity, 150));
  const [date, setDate] = useState<string>('2026-09-16');
  const [startTime, setStartTime] = useState<string>('10:00');
  const [endTime, setEndTime] = useState<string>('14:00');
  const [notes, setNotes] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newBooking: Booking = {
      id: `BK-2026-${Math.floor(100 + Math.random() * 900)}`,
      venueId: venue.id,
      venueName: venue.name,
      building: venue.building,
      eventName,
      eventType: 'Workshop',
      organizerName,
      organizerEmail,
      organizerRole: currentRole,
      attendance,
      date,
      startTime,
      endTime,
      // Admin and organizer get immediate confirmation; student gets pending if large
      status: currentRole === 'student' && attendance > 100 ? 'pending' : 'confirmed',
      qrCodeToken: `CS-PASS-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      checkedIn: false,
      requestedFacilities: venue.facilities.slice(0, 4),
      notes: notes || undefined,
      matchScore: initialMatchScore || 94,
      createdAt: new Date().toISOString()
    };

    onConfirmBooking(newBooking);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0b1329] border border-slate-700 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-white max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white bg-slate-800/80 p-2 rounded-xl transition"
        >
          ✕
        </button>

        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
            Venue Reservation
          </span>
          {initialMatchScore && (
            <span className="text-xs font-bold text-emerald-400">
              ★ {initialMatchScore}% AI Match
            </span>
          )}
        </div>

        <h3 className="text-2xl font-bold tracking-tight text-white mb-1">{venue.name}</h3>
        <p className="text-xs text-slate-400 mb-6">
          {venue.building} • Max Capacity: {venue.capacity} seats
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Event Title
            </label>
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Organizer Name
              </label>
              <input
                type="text"
                value={organizerName}
                onChange={(e) => setOrganizerName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Expected Attendance
              </label>
              <input
                type="number"
                max={venue.capacity}
                value={attendance}
                onChange={(e) => setAttendance(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Start
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                End
              </label>
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
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Special Requests or Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Need guest parking slots, audio recording enabled"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition"
            >
              Confirm Booking & Generate Smart Pass
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
