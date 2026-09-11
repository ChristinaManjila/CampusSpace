import React from 'react';
import { DEMAND_FORECAST } from '../data/sampleAnalytics';

export const DemandForecastView: React.FC = () => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <span>🔮</span>
            <span>AI Predictive Demand Forecast</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Machine learning forecast of campus venue rush windows, exam season loads, and optimal scheduling slots.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-xl bg-purple-950 text-purple-300 border border-purple-800 font-semibold">
            Next 4-Week Horizon
          </span>
        </div>
      </div>

      {/* Forecast Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {DEMAND_FORECAST.map((forecast, idx) => {
          const isCritical = forecast.riskLevel.includes('Critical');
          const isHigh = forecast.riskLevel.includes('High');
          const isLow = forecast.riskLevel.includes('Low');

          const badgeColor = isCritical
            ? 'bg-rose-950 text-rose-300 border-rose-800'
            : isHigh
            ? 'bg-amber-950 text-amber-300 border-amber-800'
            : isLow
            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
            : 'bg-blue-950 text-blue-300 border-blue-800';

          return (
            <div
              key={idx}
              className="bg-[#0b1329] border border-slate-800 hover:border-slate-700 rounded-3xl p-6 shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="text-xs font-mono text-cyan-400 font-bold block">
                      {forecast.week}
                    </span>
                    <h3 className="text-lg font-bold text-white tracking-tight mt-0.5">
                      {forecast.period}
                    </h3>
                  </div>

                  <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border ${badgeColor}`}>
                    {forecast.riskLevel}
                  </span>
                </div>

                {/* Demand Meter */}
                <div className="bg-slate-900/90 border border-slate-800/80 p-4 rounded-2xl mb-4">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-400">Projected Demand Level:</span>
                    <span className="font-extrabold text-white">{forecast.demandScore}/100</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-700 ${
                        isCritical
                          ? 'bg-gradient-to-r from-rose-500 to-red-600'
                          : isHigh
                          ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                          : 'bg-gradient-to-r from-cyan-400 to-blue-500'
                      }`}
                      style={{ width: `${forecast.demandScore}%` }}
                    />
                  </div>
                </div>

                {/* Peak Days & Venues */}
                <div className="space-y-2 text-xs mb-5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-slate-400 font-medium w-24 flex-shrink-0">Peak Days:</span>
                    <span className="font-semibold text-slate-200">
                      {forecast.peakDays.join(', ')}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-slate-400 font-medium w-24 flex-shrink-0">High-Traffic:</span>
                    <span className="text-cyan-300 font-medium">
                      {forecast.predictedPeakVenues.join(' • ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* AI Recommendation Tip */}
              <div className="pt-4 border-t border-slate-800/80 bg-slate-900/40 -mx-6 -mb-6 p-4 rounded-b-3xl text-xs flex items-start gap-2.5 text-slate-300">
                <span className="text-base flex-shrink-0">💡</span>
                <p className="leading-relaxed">
                  <strong className="text-cyan-300">AI Scheduling Tip:</strong>{' '}
                  {forecast.aiRecommendationTip}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
