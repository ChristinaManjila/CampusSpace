import React from 'react';
import { NotificationItem } from '../types';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer panel */}
      <div className="absolute inset-y-0 right-0 max-w-md w-full bg-[#0b1329] border-l border-slate-800 p-6 flex flex-col justify-between text-white shadow-2xl">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔔</span>
              <h3 className="text-base font-bold text-white">Campus Notifications</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold">
                {notifications.filter((n) => !n.read).length} Unread
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              ✕
            </button>
          </div>

          <div className="flex justify-end mb-3">
            <button
              onClick={onMarkAllAsRead}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              Mark all as read
            </button>
          </div>

          {/* List */}
          <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-160px)]">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3.5 rounded-2xl border transition ${
                  n.read
                    ? 'bg-slate-900/60 border-slate-800/80 text-slate-400'
                    : 'bg-slate-900 border-cyan-500/30 text-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white">{n.title}</span>
                  <span className="text-[10px] text-slate-500">{n.timestamp}</span>
                </div>
                <p className="text-xs leading-relaxed">{n.message}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-500">
            Real-time event conflict alerts & QR door check-in pings
          </p>
        </div>
      </div>
    </div>
  );
};
