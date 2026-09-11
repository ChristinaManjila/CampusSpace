import React from 'react';
import { Booking } from '../types';
import { generateQRCodeSVG } from '../utils/qrGenerator';

interface QRCodeModalProps {
  booking: Booking | null;
  onClose: () => void;
  onSimulateCheckIn: (bookingId: string) => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  booking,
  onClose,
  onSimulateCheckIn
}) => {
  if (!booking) return null;

  const qrSvg = generateQRCodeSVG(booking.qrCodeToken, 210);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0b1329] border border-slate-700 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-white text-center">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white bg-slate-800/80 p-2 rounded-xl transition"
        >
          ✕
        </button>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 text-[11px] font-bold uppercase tracking-wider mb-3">
          CampusSpace Smart Pass
        </div>

        <h3 className="text-xl font-bold tracking-tight text-white">{booking.eventName}</h3>
        <p className="text-xs text-slate-400 mb-6">{booking.venueName} • {booking.building}</p>

        {/* QR Code Container */}
        <div className="flex justify-center mb-6">
          <div
            className="p-3 bg-white rounded-2xl shadow-xl shadow-cyan-500/10 inline-block"
            dangerouslySetInnerHTML={{ __html: qrSvg }}
          />
        </div>

        {/* Pass Details */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs space-y-2 mb-6 text-left">
          <div className="flex justify-between">
            <span className="text-slate-400">Date & Time:</span>
            <span className="font-semibold text-white">
              {booking.date} ({booking.startTime} - {booking.endTime})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Attendees:</span>
            <span className="font-semibold text-white">{booking.attendance} people</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Token ID:</span>
            <span className="font-mono text-cyan-300 font-bold">{booking.qrCodeToken}</span>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-slate-800">
            <span className="text-slate-400">Check-in Status:</span>
            <span
              className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                booking.checkedIn
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-amber-950 text-amber-400 border border-amber-800'
              }`}
            >
              {booking.checkedIn ? '✓ Checked In (Door Unlocked)' : '● Awaiting Arrival'}
            </span>
          </div>
        </div>

        {/* Action Button: Simulate QR Door Check-in */}
        <button
          onClick={() => {
            onSimulateCheckIn(booking.id);
            onClose();
          }}
          className={`w-full py-3 px-4 rounded-xl font-extrabold text-xs uppercase tracking-wider transition ${
            booking.checkedIn
              ? 'bg-slate-800 text-slate-400 cursor-default'
              : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black shadow-lg shadow-emerald-500/20'
          }`}
          disabled={booking.checkedIn}
        >
          {booking.checkedIn ? 'Already Checked In' : '📱 Simulate Door QR Scan (Check-in)'}
        </button>

        <p className="text-[10px] text-slate-400 mt-3">
          Anti-Ghost Rule: Venues automatically release to the public if not scanned within 15 minutes of reservation start.
        </p>
      </div>
    </div>
  );
};
