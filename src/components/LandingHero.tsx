import React from 'react';
import { UserRole } from '../types';

interface LandingHeroProps {
  onEnterApp: (role: UserRole) => void;
  onOpenLogin?: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onEnterApp, onOpenLogin }) => {
  return (
    <div className="min-h-screen bg-[#070e1e] text-white flex flex-col justify-between selection:bg-cyan-500 selection:text-black">
      {/* Top Banner Header */}
      <nav className="border-b border-slate-800/80 px-8 py-5 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-cyan-500/25">
            CS
          </div>
          <span className="text-2xl font-black tracking-tight text-white">CampusSpace</span>
        </div>
        <div className="flex items-center gap-3">
          {onOpenLogin && (
            <button
              onClick={onOpenLogin}
              className="text-xs font-semibold px-4 py-2 rounded-xl text-cyan-300 hover:text-white border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 transition flex items-center gap-1.5"
            >
              <span>🔑</span>
              <span>Portal Sign In</span>
            </button>
          )}
          <button
            onClick={() => onEnterApp('student')}
            className="text-xs font-semibold px-4 py-2 rounded-xl text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 transition"
          >
            Student View
          </button>
          <button
            onClick={() => onEnterApp('organizer')}
            className="text-xs font-semibold px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-md shadow-cyan-500/20 transition"
          >
            Launch Demo
          </button>
        </div>
      </nav>

      {/* Main Hero Body */}
      <main className="max-w-6xl mx-auto px-6 py-12 flex flex-col items-center text-center my-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-800 text-cyan-300 text-xs font-medium mb-8">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          Next-Generation Campus Resource Intelligence
        </div>

        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.1] mb-6">
          <span className="block text-white">CampusSpace</span>
          <span className="block bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
            Book smarter. Use better. Plan ahead.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-300 max-w-2xl font-normal leading-relaxed mb-10">
          AI-powered venue booking and campus resource optimization. Traditional systems only ask{' '}
          <em className="text-slate-200">"Is this room available?"</em> CampusSpace answers{' '}
          <strong className="text-cyan-300">
            "What is the best venue, where is it, and will it actually be used?"
          </strong>
        </p>

        {/* Hackathon CTA Group */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <button
            onClick={() => onEnterApp('organizer')}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 font-bold text-base shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all"
          >
            Explore Demo (Organizer) →
          </button>
          {onOpenLogin && (
            <button
              onClick={onOpenLogin}
              className="px-7 py-4 rounded-2xl bg-gradient-to-r from-slate-900 to-[#0e1c36] hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 hover:text-white font-semibold text-base transition flex items-center gap-2 shadow-lg shadow-cyan-500/10"
            >
              <span>🔑</span>
              <span>Campus Portal Login</span>
            </button>
          )}
          <button
            onClick={() => onEnterApp('admin')}
            className="px-7 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 font-semibold text-base text-slate-200 transition"
          >
            Admin Approval Console
          </button>
        </div>

        {/* Visual Preview Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full text-left">
          {/* Card 1: AI Venue Recommendation */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition group backdrop-blur-sm">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">
              🤖
            </div>
            <h3 className="text-base font-bold text-white mb-2">AI Recommendation</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Multi-factor scoring: capacity fit, facility match, distance, and historical rating.
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs text-cyan-400 font-semibold">
              <span>94% Fit Score</span>
              <span>✓</span>
            </div>
          </div>

          {/* Card 2: Live Campus Map */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition group backdrop-blur-sm">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">
              🗺️
            </div>
            <h3 className="text-base font-bold text-white mb-2">Interactive Map</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              OpenStreetMap + Leaflet integration with color-coded pins for buildings & real-time occupancy.
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs text-blue-400 font-semibold">
              <span>Turn-by-turn routing</span>
              <span>→</span>
            </div>
          </div>

          {/* Card 3: QR Check-in */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition group backdrop-blur-sm">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">
              📱
            </div>
            <h3 className="text-base font-bold text-white mb-2">Anti-Ghost QR Check-in</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Instant digital passes. Rooms are auto-released if not scanned within 15 minutes of start.
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <span>Zero wasted rooms</span>
              <span>⚡</span>
            </div>
          </div>

          {/* Card 4: Utilization Analytics */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition group backdrop-blur-sm">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">
              📊
            </div>
            <h3 className="text-base font-bold text-white mb-2">Utilization Analytics</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Hourly heatmaps, predictive rush forecasts, and 4-week exam scheduling insights.
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs text-purple-400 font-semibold">
              <span>35% → 4% no-show drop</span>
              <span>📈</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 px-8 text-center text-xs text-slate-400">
        CampusSpace • College Campus Venue Booking & Optimization Platform • Hackathon Demo Edition
      </footer>
    </div>
  );
};
