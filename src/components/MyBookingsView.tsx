import React, { useState } from 'react';
import { Booking } from '../types';

interface MyBookingsViewProps {
  bookings: Booking[];
  onCancelBooking: (bookingId: string) => void;
  onNavigateToBookingVenue: (venueId: string) => void;
}

export const MyBookingsView: React.FC<MyBookingsViewProps> = ({
  bookings,
  onCancelBooking,
  onNavigateToBookingVenue
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'Auto-approved' | 'Approved' | 'Pending' | 'Rejected'>('all');

  const filteredBookings = bookings.filter((b) => {
    if (filterTab === 'all') return true;
    return b.status === filterTab;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white font-sans pb-12">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>📅</span>
            <span>My Bookings & Reservations</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Track your reserved campus spaces, approval statuses, and schedule details.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl">
          {(['all', 'Auto-approved', 'Approved', 'Pending', 'Rejected'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`text-xs px-3 py-1.5 rounded-xl capitalize font-semibold transition ${
                filterTab === tab
                  ? 'bg-cyan-500 text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'all' ? 'All Bookings' : tab}
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
              className="bg-slate-900/95 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 transition flex flex-col justify-between text-white shadow-xl"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border inline-block ${
                        b.status === 'Approved'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                          : b.status === 'Auto-approved'
                          ? 'bg-teal-950 text-teal-300 border-teal-700'
                          : b.status === 'Pending'
                          ? 'bg-amber-950 text-amber-300 border-amber-700 animate-pulse'
                          : 'bg-rose-950 text-rose-300 border-rose-800'
                      }`}
                    >
                      ● {b.status}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1">{b.eventName}</h3>
                    <p className="text-xs text-cyan-400 font-semibold">{b.venueName} • {b.building}</p>
                  </div>
                  <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                    #{b.id}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 my-4">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Date & Time</span>
                    <span className="font-semibold text-slate-100">{b.date}</span>
                    <span className="block text-[11px] text-cyan-300 font-mono">
                      {b.startTime} - {b.endTime}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Expected Attendance</span>
                    <span className="font-semibold text-slate-100">{b.attendance} attendees</span>
                    <span className="block text-[10px] text-slate-400">{b.eventType}</span>
                  </div>
                </div>

                {b.requestedFacilities && b.requestedFacilities.length > 0 && (
                  <div className="mb-4">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Requested Facilities:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {b.requestedFacilities.map((f) => (
                        <span key={f} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                          ✓ {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {b.notes && (
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 mb-4">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Notes:</span>
                    {b.notes}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                <button
                  onClick={() => onNavigateToBookingVenue(b.venueId)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <span>Locate Space</span>
                  <span>📍</span>
                </button>
                {b.status !== 'Cancelled' && (
                  <button
                    onClick={() => onCancelBooking(b.id)}
                    className="py-2.5 px-3 rounded-xl bg-rose-950/50 hover:bg-rose-900 border border-rose-800/60 text-rose-300 text-xs font-bold transition"
                  >
                    Cancel Booking
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
