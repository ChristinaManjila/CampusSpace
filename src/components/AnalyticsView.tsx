import React from 'react';
import {
  HOURLY_UTILIZATION,
  VENUE_CATEGORY_UTILIZATION,
  NO_SHOW_REDUCTION_DATA
} from '../data/sampleAnalytics';

export const AnalyticsView: React.FC = () => {
  // Peak hour calculation
  const maxOccupancy = Math.max(...HOURLY_UTILIZATION.map((h) => h.occupancyRate));

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-white">
      {/* Analytics Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <span>📊</span>
            <span>Campus Resource Analytics</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time space efficiency, peak occupancy patterns, and ghost booking elimination.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800 font-semibold">
            Live AI Telemetry
          </span>
        </div>
      </div>

      {/* KPI Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#0b1329] border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs text-slate-400 font-medium block mb-1">Average Campus Occupancy</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">82.4%</span>
            <span className="text-xs text-emerald-400 font-bold">+18.2% vs last term</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3">
            <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-1.5 rounded-full w-[82.4%]" />
          </div>
        </div>

        <div className="bg-[#0b1329] border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs text-slate-400 font-medium block mb-1">Ghost Bookings Prevented</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-cyan-400">239</span>
            <span className="text-xs text-slate-400">rooms released</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Saved 710 hours of wasted space via 15m QR rule</p>
        </div>

        <div className="bg-[#0b1329] border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs text-slate-400 font-medium block mb-1">No-Show Drop Rate</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400">4.1%</span>
            <span className="text-xs text-emerald-300 font-bold">Down from 35.4%</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Driven by smart check-in enforcement</p>
        </div>

        <div className="bg-[#0b1329] border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs text-slate-400 font-medium block mb-1">HVAC & Energy Savings</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-indigo-400">28.6%</span>
            <span className="text-xs text-slate-400">kWh reduction</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Auto HVAC power-down in unoccupied halls</p>
        </div>
      </div>

      {/* Hourly Utilization Chart (SVG Area Chart) */}
      <div className="bg-[#0b1329] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-white">
              Campus-wide Hourly Utilization Curve
            </h3>
            <p className="text-xs text-slate-400">Percentage of total campus seats occupied (08:00 - 21:00)</p>
          </div>
          <span className="text-xs text-amber-400 font-bold bg-amber-950/60 border border-amber-800/80 px-3 py-1 rounded-full">
            Peak: 11:00 AM (94%)
          </span>
        </div>

        {/* SVG Area Chart */}
        <div className="relative h-64 w-full">
          <svg viewBox="0 0 700 240" className="w-full h-full overflow-visible">
            {/* Grid lines */}
            {[0, 60, 120, 180].map((y) => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="700"
                y2={y}
                stroke="#1e293b"
                strokeDasharray="4,4"
              />
            ))}

            {/* Gradient definition */}
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Area path */}
            {(() => {
              const points = HOURLY_UTILIZATION.map((d, i) => {
                const x = (i / (HOURLY_UTILIZATION.length - 1)) * 700;
                const y = 220 - (d.occupancyRate / 100) * 200;
                return `${x},${y}`;
              });
              const dPath = `M0,220 L${points.join(' L')} L700,220 Z`;
              const linePath = `M${points.join(' L')}`;

              return (
                <>
                  <path d={dPath} fill="url(#areaGradient)" />
                  <path
                    d={linePath}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {HOURLY_UTILIZATION.map((d, i) => {
                    const x = (i / (HOURLY_UTILIZATION.length - 1)) * 700;
                    const y = 220 - (d.occupancyRate / 100) * 200;
                    return (
                      <g key={i}>
                        <circle
                          cx={x}
                          cy={y}
                          r="4"
                          fill="#0f172a"
                          stroke="#38bdf8"
                          strokeWidth="2.5"
                        />
                      </g>
                    );
                  })}
                </>
              );
            })()}
          </svg>

          {/* X-axis labels */}
          <div className="flex justify-between text-[10px] text-slate-400 mt-3 px-1">
            {HOURLY_UTILIZATION.map((h) => (
              <span key={h.hour}>{h.hour}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Category Breakdown & No-Show Reduction */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-[#0b1329] border border-slate-800 rounded-3xl p-6 shadow-xl">
          <h3 className="text-base font-bold text-white mb-1">
            Category Space Utilization Rate
          </h3>
          <p className="text-xs text-slate-400 mb-6">Efficiency across venue archetypes</p>

          <div className="space-y-4">
            {VENUE_CATEGORY_UTILIZATION.map((cat) => (
              <div key={cat.category} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-200">{cat.category}</span>
                  <span className="font-bold text-cyan-300">{cat.utilization}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-700"
                    style={{ width: `${cat.utilization}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>{cat.bookedHours} hours booked</span>
                  <span className="text-emerald-400">
                    +{cat.ghostBookingsPrevented} ghost bookings saved
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* No-Show Reduction Trend */}
        <div className="bg-[#0b1329] border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-1">
              Ghost Booking & No-Show Reduction
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Before CampusSpace vs. With AI QR Check-in System
            </p>

            <div className="space-y-3.5">
              {NO_SHOW_REDUCTION_DATA.map((d) => (
                <div key={d.month} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-300">{d.month}</span>
                    <div className="flex gap-3 text-xs">
                      <span className="text-rose-400 line-through">
                        {d.beforeCampusSpace}%
                      </span>
                      <span className="text-emerald-400 font-bold">
                        {d.withCampusSpaceAI}%
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1 h-2 rounded-full overflow-hidden bg-slate-900">
                    <div
                      className="bg-rose-500/70 h-full rounded-l"
                      style={{ width: `${d.beforeCampusSpace * 2}%` }}
                    />
                    <div
                      className="bg-emerald-400 h-full rounded-r"
                      style={{ width: `${d.withCampusSpaceAI * 2}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-6 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span>Before (Legacy system)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span>With CampusSpace AI</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
