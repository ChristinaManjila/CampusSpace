import React from 'react';
import { UserRole } from '../types';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onOpenNotifications: () => void;
  unreadNotificationsCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onQuickLocate: () => void;
  isSimulatingLocation: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  onOpenNotifications,
  unreadNotificationsCount,
  searchQuery,
  onSearchChange,
  onQuickLocate,
  isSimulatingLocation
}) => {
  return (
    <header className="h-18 bg-[#0b1329]/95 backdrop-blur-md border-b border-slate-800 text-white flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Brand & Tagline */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 font-black text-xl text-white">
          CS
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-cyan-300">
              CampusSpace
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
              AI Powered
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            Book smarter. Use better. Plan ahead.
          </p>
        </div>
      </div>

      {/* Global Search */}
      <div className="hidden md:flex items-center relative w-72 lg:w-96">
        <svg
          className="w-4 h-4 text-slate-400 absolute left-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search venues, buildings, labs, capacity..."
          className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 transition"
        />
      </div>

      {/* Action Controls & Role Switcher */}
      <div className="flex items-center gap-3">
        {/* Quick GPS Status */}
        <button
          onClick={onQuickLocate}
          title="Toggle Campus GPS Simulation / Live Tracking"
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border transition ${
            isSimulatingLocation
              ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 shadow-sm shadow-cyan-500/10'
              : 'bg-slate-900 border-slate-700/80 text-slate-300 hover:text-white'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="hidden sm:inline">GPS:</span>
          <span className="font-semibold">{isSimulatingLocation ? 'Campus Active' : 'Locate Me'}</span>
        </button>

        {/* Role Switcher */}
        <div className="flex items-center bg-slate-900/90 border border-slate-700/80 rounded-xl p-1 text-xs">
          <span className="text-slate-400 px-2 font-medium hidden lg:inline">Role:</span>
          {(['student', 'organizer', 'admin'] as UserRole[]).map((role) => (
            <button
              key={role}
              onClick={() => onRoleChange(role)}
              className={`capitalize px-2.5 py-1 rounded-lg font-medium transition ${
                currentRole === role
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        {/* Notifications Icon */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-white hover:border-slate-600 transition"
          title="Notifications"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
              {unreadNotificationsCount}
            </span>
          )}
        </button>

        {/* User Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow">
            {currentRole === 'admin' ? 'AD' : currentRole === 'organizer' ? 'OR' : 'ST'}
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-semibold text-slate-200 capitalize">
              {currentRole === 'admin'
                ? 'Campus Admin'
                : currentRole === 'organizer'
                ? 'Pooja Hegde'
                : 'Aarav Patel'}
            </div>
            <div className="text-[10px] text-slate-400 capitalize">{currentRole} account</div>
          </div>
        </div>
      </div>
    </header>
  );
};
