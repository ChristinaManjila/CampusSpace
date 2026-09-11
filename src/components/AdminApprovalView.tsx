import React, { useState } from 'react';
import { Booking, Venue } from '../types';

interface AdminApprovalViewProps {
  bookings: Booking[];
  venues: Venue[];
  onApproveBooking: (bookingId: string) => void;
  onRejectBooking: (bookingId: string) => void;
}

export const AdminApprovalView: React.FC<AdminApprovalViewProps> = ({
  bookings,
  venues,
  onApproveBooking,
  onRejectBooking
}) => {
  const [autoReleaseMinutes, setAutoReleaseMinutes] = useState<number>(15);
  const [conflictDetectionEnabled, setConflictDetectionEnabled] = useState<boolean>(true);

  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed');

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <span>🛡️</span>
            <span>Administrator Approval & Governance Console</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Review student club and departmental requests, enforce campus safety policies, and manage auto-release rules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
            {pendingBookings.length} Pending Review
          </span>
        </div>
      </div>

      {/* Rules & Automation Policy Widget */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#0b1329] border border-slate-800 p-6 rounded-3xl">
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
            <span>⚡</span>
            <span>Anti-Ghost Booking Automation</span>
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            If an organizer does not check in with their QR Pass within the grace period after scheduled start time, the room is automatically released and returned to the public pool.
          </p>
          <div className="flex items-center gap-3 pt-1">
            <span className="text-xs font-semibold text-slate-300">Grace Period:</span>
            <select
              value={autoReleaseMinutes}
              onChange={(e) => setAutoReleaseMinutes(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-400"
            >
              <option value={10}>10 minutes</option>
              <option value={15}>15 minutes (Standard)</option>
              <option value={20}>20 minutes</option>
              <option value={30}>30 minutes</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-2">
            <span>🔍</span>
            <span>Automated Conflict Detector</span>
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            AI scanner checks facility equipment overlap, noise interference between adjacent halls, and maintenance teardown buffers.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="conflictToggle"
              checked={conflictDetectionEnabled}
              onChange={(e) => setConflictDetectionEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700"
            />
            <label htmlFor="conflictToggle" className="text-xs text-slate-200 font-medium">
              Strict Acoustical & Safety Separation Enabled
            </label>
          </div>
        </div>
      </div>

      {/* Pending Approvals Queue */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">
          Pending Approval Requests ({pendingBookings.length})
        </h3>

        {pendingBookings.length === 0 ? (
          <div className="bg-[#0b1329] border border-slate-800 rounded-2xl p-10 text-center">
            <span className="text-3xl block mb-2">🎉</span>
            <h4 className="text-base font-bold text-white">All Caught Up!</h4>
            <p className="text-xs text-slate-400">No pending venue requests awaiting administrative action.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingBookings.map((b) => (
              <div
                key={b.id}
                className="bg-[#0b1329] border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl"
              >
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono text-cyan-400 font-bold">#{b.id}</span>
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
                      Pending Approval
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">{b.eventType}</span>
                  </div>

                  <h4 className="text-lg font-bold text-white">{b.eventName}</h4>

                  <p className="text-xs text-slate-300">
                    <strong className="text-white">Venue:</strong> {b.venueName} ({b.building}) •{' '}
                    <strong className="text-white">Time:</strong> {b.date} from {b.startTime} to {b.endTime}
                  </p>

                  <p className="text-xs text-slate-400">
                    <strong className="text-slate-300">Requested by:</strong> {b.organizerName} (
                    <span className="capitalize">{b.organizerRole}</span>) • {b.attendance} Attendees
                  </p>

                  {b.notes && (
                    <div className="bg-slate-900/90 border border-slate-800/80 p-2.5 rounded-xl text-xs text-amber-300/90">
                      <strong>Special Request / Safety Note:</strong> {b.notes}
                    </div>
                  )}
                </div>

                {/* Approve / Reject Controls */}
                <div className="flex items-center gap-3 w-full md:w-auto flex-shrink-0">
                  <button
                    onClick={() => onRejectBooking(b.id)}
                    className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-950 hover:border-rose-700 hover:text-rose-300 border border-slate-700 text-xs font-bold transition"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => onApproveBooking(b.id)}
                    className="flex-1 md:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black text-xs font-extrabold shadow-lg shadow-emerald-500/20 transition"
                  >
                    ✓ Approve Request
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Campus Approvals History */}
      <div>
        <h3 className="text-base font-bold text-white mb-4">
          Recently Approved Events on Campus ({confirmedBookings.length})
        </h3>
        <div className="bg-[#0b1329] border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">ID</th>
                <th className="p-3.5">Event</th>
                <th className="p-3.5">Venue</th>
                <th className="p-3.5">Date & Time</th>
                <th className="p-3.5">Organizer</th>
                <th className="p-3.5">QR Pass Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {confirmedBookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-900/40">
                  <td className="p-3.5 font-mono text-cyan-400">{b.id}</td>
                  <td className="p-3.5 font-bold text-white">{b.eventName}</td>
                  <td className="p-3.5">{b.venueName}</td>
                  <td className="p-3.5">{b.date} ({b.startTime})</td>
                  <td className="p-3.5">{b.organizerName}</td>
                  <td className="p-3.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                      Verified
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
