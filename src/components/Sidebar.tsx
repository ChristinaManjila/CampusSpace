import React from 'react';
import { UserRole, UserProfile } from '../types';

export type NavTab =
  | 'dashboard'
  | 'map'
  | 'recommendations'
  | 'bookings'
  | 'navigation'
  | 'analytics'
  | 'forecast'
  | 'admin'
  | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  currentRole: UserRole;
  pendingApprovalsCount: number;
  currentUser?: UserProfile | null;
  onOpenLogin?: () => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  currentRole,
  pendingApprovalsCount,
  currentUser,
  onOpenLogin,
  onLogout
}) => {
  const navItems: { id: NavTab; label: string; icon: string; badge?: number; adminOnly?: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'map', label: 'Campus Map', icon: '🗺️' },
    { id: 'recommendations', label: 'AI Recommendations', icon: '🤖' },
    { id: 'bookings', label: 'My Bookings', icon: '📅' },
    { id: 'navigation', label: 'Live Navigation', icon: '📍' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'forecast', label: 'Demand Forecast', icon: '🔮' },
    { id: 'admin', label: 'Admin Approvals', icon: '🛡️', badge: pendingApprovalsCount, adminOnly: true },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  const visibleItems = navItems.filter(item => !item.adminOnly || currentRole === 'admin');

  return (
    <aside className="w-64 bg-[#070e1e] border-r border-slate-800/80 flex flex-col justify-between py-5 px-3 select-none flex-shrink-0">
      <div className="space-y-1">
        <div className="px-3 pb-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Platform Navigation
          </p>
        </div>

        {visibleItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/10 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* User Session Footer & Mode Note */}
      <div className="space-y-2">
        {currentUser ? (
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs flex items-center justify-between gap-2 shadow-inner">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover border border-cyan-500/40 shrink-0"
              />
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-slate-200 truncate">{currentUser.name}</div>
                <div className="text-[9px] text-cyan-400 capitalize truncate">{currentUser.role}</div>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {onOpenLogin && (
                <button
                  onClick={onOpenLogin}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs"
                  title="Switch User / Login Portal"
                >
                  🔄
                </button>
              )}
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800/40 text-rose-300 hover:text-rose-100 transition text-xs"
                  title="Log out"
                >
                  🚪
                </button>
              )}
            </div>
          </div>
        ) : (
          onOpenLogin && (
            <button
              onClick={onOpenLogin}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white font-bold text-xs tracking-wider shadow-md shadow-cyan-500/20 transition flex items-center justify-center gap-2"
            >
              <span>🔑</span>
              <span>Portal Sign In</span>
            </button>
          )
        )}

        <div className="p-3 rounded-2xl bg-gradient-to-b from-slate-800/40 to-slate-900/80 border border-slate-800/80 text-xs text-slate-300 space-y-1.5">
          <div className="flex items-center gap-1.5 text-cyan-300 font-semibold text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>Campus Gateway v2.4</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Multi-factor resource allocation with explainable AI scoring & policy auto-approvals.
          </p>
        </div>
      </div>
    </aside>
  );
};
