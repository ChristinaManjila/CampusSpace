import React, { useState } from 'react';
import { Booking } from '../types';

interface MyBookingsViewProps {
  bookings: Booking[];
  onOpenQRModal: (booking: Booking) => void;
  onCancelBooking: (bookingId: string) => void;
  onNavigateToBookingVenue: (venueId: string) => void;
}

export const MyBookingsView: React.FC<MyBookingsViewProps> = ({
  bookings,
  onOpenQRModal,
  onCancelBooking,
  onNavigateToBookingVenue
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'confirmed' | 'pending' | 'completed'>('all');

  const filteredBookings = bookings.filter((b) => {
    if (filterTab === 'all') return true;
    return b.status === filterTab;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>📅</span>
            <span>My Campus Bookings</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your scheduled events, retrieve access QR passes, and check in.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl">
          {(['all', 'confirmed', 'pending', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`text-xs px-3.5 py-1.5 rounded-xl capitalize font-semibold transition ${
                filterTab === tab
                  ? 'bg-cyan-500 text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-white max-w-md mx-auto my-8">
          <div className="text-4xl mb-3">📅</div>
          <h4 className="text-lg font-bold mb-1">No Bookings Found</h4>
          <p className="text-xs text-slate-400">
            No reservations match the selected filter criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              className="bg-slate-900/95 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-6 transition flex flex-col justify-between text-white shadow-xl shadow-black/20"
            >
              <div>
                {/* Status Bar */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        b.status === 'confirmed'
                          ? 'bg-emerald-950/80 text-emerald-400 border-emerald-700'
                          : b.status === 'pending'
                          ? 'bg-amber-950/80 text-amber-400 border-amber-700'
                          : b.status === 'completed'
                          ? 'bg-blue-950/80 text-blue-400 border-blue-700'
                          : 'bg-rose-950/80 text-rose-400 border-rose-700'
                      }`}
                    >
                      ● {b.status}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">{b.eventType}</span>
                  </div>

                  <span className="text-xs font-mono text-cyan-400/90 font-medium">#{b.id}</span>
                </div>

                <h3 className="text-lg font-bold text-white tracking-tight mb-1">{b.eventName}</h3>
                <p className="text-xs text-cyan-300 font-medium mb-4">
                  {b.venueName} • {b.building}
                </p>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 mb-4">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Date & Time</span>
                    <span className="font-semibold text-slate-200">
                      {b.date} • {b.startTime} - {b.endTime}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Attendance</span>
                    <span className="font-semibold text-slate-200">{b.attendance} attendees</span>
                  </div>
                </div>

                {/* Check-in Status Notice */}
                {b.checkedIn ? (
                  <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 mb-4 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-lg">
                    <span>✓</span>
                    <span>Check-in verified. Smart Door lock active.</span>
                  </div>
                ) : (
                  <div className="text-xs text-amber-400 font-medium flex items-center gap-1.5 mb-4 bg-amber-950/30 border border-amber-800/30 px-3 py-1.5 rounded-lg">
                    <span>⏳</span>
                    <span>Check-in required upon venue arrival via QR.</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-800/80">
                <button
                  onClick={() => onOpenQRModal(b)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs tracking-wider transition flex items-center justify-center gap-1.5"
                >
                  <span>Smart Pass (QR)</span>
                  <span>📱</span>
                </button>
                <button
                  onClick={() => onNavigateToBookingVenue(b.venueId)}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
                  title="Walking route"
                >
                  📍
                </button>
                {b.status !== 'cancelled' && b.status !== 'completed' && (
                  <button
                    onClick={() => onCancelBooking(b.id)}
                    className="py-2.5 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 text-xs font-bold transition"
                    title="Cancel Booking"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
