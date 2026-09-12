import React, { useState, useRef, useEffect } from 'react';
import { UserRole, UserProfile } from '../types';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onOpenNotifications: () => void;
  unreadNotificationsCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onQuickLocate: () => void;
  isSimulatingLocation: boolean;
  currentUser?: UserProfile | null;
  onLogout: () => void;
  onOpenLanding?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  onOpenNotifications,
  unreadNotificationsCount,
  searchQuery,
  onSearchChange,
  onQuickLocate,
  isSimulatingLocation,
  currentUser,
  onLogout,
  onOpenLanding
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-18 bg-[#0b1329]/95 backdrop-blur-md border-b border-slate-800 text-white flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Brand & Tagline */}
      <div
        className="flex items-center gap-3 cursor-pointer group"
        onClick={onOpenLanding}
        title="View CampusSpace Landing Page"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 font-black text-xl text-white group-hover:scale-105 transition">
          CS
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-cyan-300">
              CampusSpace
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
              Smart Venue Platform
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            AI-Powered Campus Venue Allocation & Capacity Optimization
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
          title="Campus GPS Simulation / Live Tracking"
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border transition ${
            isSimulatingLocation
              ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 shadow-sm shadow-cyan-500/10'
              : 'bg-slate-900 border-slate-700/80 text-slate-300 hover:text-white'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="hidden sm:inline">GPS:</span>
          <span className="font-semibold">{isSimulatingLocation ? 'Campus Central' : 'Locate'}</span>
        </button>

        {/* Role Chip Indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span className="text-cyan-300 uppercase tracking-wider text-[10px]">
            {currentRole.replace('_', ' ')}
          </span>
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

        {/* User Pill & Profile Dropdown with Logout */}
        <div className="relative pl-2 border-l border-slate-800" ref={menuRef}>
          {currentUser ? (
            <div>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-800/80 transition cursor-pointer text-left"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover border border-cyan-500/40 shadow-sm"
                />
                <div className="hidden xl:block">
                  <div className="text-xs font-bold text-slate-100 leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-cyan-400 capitalize font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>{currentUser.role} mode</span>
                  </div>
                </div>
                <span className="text-slate-400 text-xs ml-0.5">▾</span>
              </button>

              {/* Profile Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-[#0b1329] border border-slate-700/90 rounded-2xl shadow-2xl py-3 px-4 z-50 text-white animate-slideUp">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-11 h-11 rounded-full object-cover border-2 border-cyan-500"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white truncate">{currentUser.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">@{currentUser.username}</div>
                      <span className="inline-block mt-0.5 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                        {currentUser.badge}
                      </span>
                    </div>
                  </div>

                  <div className="py-2.5 space-y-1 text-xs text-slate-300 border-b border-slate-800">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Department:</span>
                      <span className="font-medium text-slate-200 truncate max-w-[140px]">
                        {currentUser.department}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Active Role:</span>
                      <span className="font-bold text-cyan-400 uppercase">{currentUser.role}</span>
                    </div>
                  </div>

                  <div className="pt-2.5 space-y-1.5">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onRoleChange(currentRole === 'admin' ? 'organizer' : 'admin');
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-between transition"
                    >
                      <span className="flex items-center gap-2">
                        <span>🔄</span>
                        <span>Switch to {currentRole === 'admin' ? 'Organizer' : 'Admin'}</span>
                      </span>
                      <span>→</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-900/50 text-rose-300 text-xs font-semibold flex items-center justify-between transition"
                    >
                      <span className="flex items-center gap-2">
                        <span>🚪</span>
                        <span>Log Out of Session</span>
                      </span>
                      <span>✕</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onLogout}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
