import React from 'react';
import { UserRole } from '../types';

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
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  currentRole,
  pendingApprovalsCount
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

      {/* Quick Help / Hackathon Demo Note */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-800/60 to-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-2">
        <div className="flex items-center gap-2 text-cyan-300 font-semibold">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          <span>Hackathon Demo Mode</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Switch roles anytime in top bar to test Student bookings, Organizer recommendations, or Administrator approvals.
        </p>
      </div>
    </aside>
  );
};
