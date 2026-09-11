import React from 'react';
import { UserRole } from '../types';

interface SettingsViewProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onResetDemoData: () => void;
  isSimulatingLocation: boolean;
  onToggleSimulateLocation: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentRole,
  onRoleChange,
  onResetDemoData,
  isSimulatingLocation,
  onToggleSimulateLocation
}) => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto text-white">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
          <span>⚙️</span>
          <span>System & Demo Settings</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure demo simulation parameters, user persona permissions, and reset local state.
        </p>
      </div>

      <div className="space-y-6">
        {/* User Persona Switcher */}
        <div className="bg-[#0b1329] border border-slate-800 p-6 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400">
            Active User Persona
          </h3>
          <p className="text-xs text-slate-400">
            Switch your profile persona to test role-specific workflows across CampusSpace.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { role: 'student', title: 'Student', desc: 'Book rooms, view smart pass, walk navigation' },
              { role: 'organizer', title: 'Organizer', desc: 'AI venue matcher, multi-criteria recommendations' },
              { role: 'admin', title: 'Administrator', desc: 'Approval queue, conflict manager, auto-release rules' }
            ].map((p) => (
              <button
                key={p.role}
                onClick={() => onRoleChange(p.role as UserRole)}
                className={`p-4 rounded-2xl border text-left transition ${
                  currentRole === p.role
                    ? 'bg-cyan-500/10 border-cyan-500 text-white shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-white">{p.title}</span>
                  {currentRole === p.role && (
                    <span className="text-cyan-400 text-xs font-bold">Active</span>
                  )}
                </div>
                <p className="text-[11px] leading-relaxed text-slate-400">{p.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Live GPS & Campus Simulation */}
        <div className="bg-[#0b1329] border border-slate-800 p-6 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400">
            Geolocation & Campus Coordinates
          </h3>
          <p className="text-xs text-slate-400">
            When simulating campus GPS, your device position is pinned directly on the university campus plaza (19.1334, 72.9133) so judges can test walking routing anywhere.
          </p>

          <div className="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <div>
              <span className="text-xs font-bold text-white block">
                Simulate Campus Grounds Geolocation
              </span>
              <span className="text-[11px] text-slate-400">
                {isSimulatingLocation ? 'Simulated location locked to campus center' : 'Using real browser GPS'}
              </span>
            </div>

            <button
              onClick={onToggleSimulateLocation}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                isSimulatingLocation
                  ? 'bg-cyan-500 text-black'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {isSimulatingLocation ? 'Enabled ✓' : 'Disabled'}
            </button>
          </div>
        </div>

        {/* Demo State Reset */}
        <div className="bg-[#0b1329] border border-rose-950/40 p-6 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-rose-400">
            Reset Hackathon Demo Data
          </h3>
          <p className="text-xs text-slate-400">
            Clear all created bookings, reset checked-in states, and restore default seed data.
          </p>

          <button
            onClick={() => {
              if (window.confirm('Reset all demo data to default state?')) {
                onResetDemoData();
              }
            }}
            className="px-5 py-2.5 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-200 text-xs font-bold transition"
          >
            Reset All Sample Data to Initial State
          </button>
        </div>
      </div>
    </div>
  );
};
