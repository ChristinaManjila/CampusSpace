import React from 'react';
import { AIRecommendationResult, Venue, AIRecommendationRequest } from '../types';

interface AIRecommendationsViewProps {
  recommendations: AIRecommendationResult[];
  lastRequest: AIRecommendationRequest | null;
  onSelectVenueForDetails: (rec: AIRecommendationResult) => void;
  onSelectVenueForMap: (venue: Venue) => void;
  onBookVenue: (venue: Venue, matchScore: number) => void;
  onModifySearch: () => void;
}

export const AIRecommendationsView: React.FC<AIRecommendationsViewProps> = ({
  recommendations,
  lastRequest,
  onSelectVenueForDetails,
  onSelectVenueForMap,
  onBookVenue,
  onModifySearch
}) => {
  if (recommendations.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center max-w-xl mx-auto my-12 text-white">
        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
          🔍
        </div>
        <h3 className="text-xl font-bold mb-2">No Recommendations Yet</h3>
        <p className="text-sm text-slate-400 mb-6">
          Submit your event criteria in the Dashboard to generate multi-factor AI venue recommendations.
        </p>
        <button
          onClick={onModifySearch}
          className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition"
        >
          Go to Event Planner
        </button>
      </div>
    );
  }

  const topRec = recommendations[0];
  const otherRecs = recommendations.slice(1);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Search Context Summary Bar */}
      <div className="bg-[#0b1329] border border-slate-800 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4 text-white">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-bold tracking-wider text-cyan-400">
              AI Query Results
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-300">
              {recommendations.length} campus venues evaluated
            </span>
          </div>
          <div className="text-sm font-semibold text-slate-200">
            For {lastRequest?.eventType || 'Event'} with {lastRequest?.attendance || 180} attendees on {lastRequest?.date || 'Today'}
          </div>
        </div>

        <button
          onClick={onModifySearch}
          className="text-xs font-semibold px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
        >
          Edit Requirements ✏️
        </button>
      </div>

      {/* AI Recommendations Header */}
      <div>
        <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
          <span>AI RECOMMENDATIONS</span>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
            Ranked by Suitability
          </span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Scored by real-time capacity optimization, facility availability, walking proximity, and historical suitability.
        </p>
      </div>

      {/* Primary Top Recommendation Card (🥇 1st Place Hero Card) */}
      {topRec && (
        <div className="relative bg-gradient-to-br from-slate-900 via-[#0e1c36] to-slate-900 border-2 border-cyan-500/60 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-500/10 overflow-hidden text-white">
          <div className="absolute top-0 right-0 bg-gradient-to-l from-cyan-500/20 to-transparent w-72 h-72 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-start gap-5">
              {/* Rank Medal & Score Ring */}
              <div className="relative flex-shrink-0">
                <svg className="w-24 h-24 -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="7"
                    className="text-slate-800"
                    fill="transparent"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="7"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * topRec.matchScore) / 100}
                    className="text-cyan-400 transition-all duration-1000"
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-white">{topRec.matchScore}%</span>
                  <span className="text-[9px] uppercase font-bold text-cyan-300">Match</span>
                </div>
                <div className="absolute -top-1 -left-1 text-2xl" title="Rank 1 - Top Recommended">
                  🥇
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-cyan-500 text-black">
                    Top Recommendation
                  </span>
                  <span className="text-xs text-slate-400">
                    {topRec.venue.building} • {topRec.venue.floor}
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {topRec.venue.name}
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-xl line-clamp-2">
                  {topRec.venue.description}
                </p>

                {/* Key Spec Checks as highlighted in prompt */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 text-xs">
                  <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80">
                    <span className="text-slate-400 block text-[10px]">Capacity</span>
                    <span className="font-bold text-white">
                      {topRec.venue.capacity}{' '}
                      <span className="text-slate-400 font-normal">
                        (Req: {lastRequest?.attendance || 180})
                      </span>
                    </span>
                  </div>

                  <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80">
                    <span className="text-slate-400 block text-[10px]">Walk Distance</span>
                    <span className="font-bold text-cyan-300">
                      {topRec.distanceMeters} m ({topRec.walkingMinutes} min)
                    </span>
                  </div>

                  <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80">
                    <span className="text-slate-400 block text-[10px]">Suitability</span>
                    <span className="font-bold text-emerald-300">
                      {topRec.historicalScore}% Match
                    </span>
                  </div>

                  <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80">
                    <span className="text-slate-400 block text-[10px]">Status</span>
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <span>✓</span>
                      <span>Available</span>
                    </span>
                  </div>
                </div>

                {/* Facilities Checklist */}
                <div className="flex flex-wrap items-center gap-2 mt-4 text-xs">
                  {topRec.venue.facilities.slice(0, 5).map((fac) => (
                    <span
                      key={fac}
                      className="inline-flex items-center gap-1 bg-slate-900/90 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-800 text-[11px] font-medium"
                    >
                      <span className="text-cyan-400 font-bold">✓</span>
                      <span>{fac}</span>
                    </span>
                  ))}
                  {topRec.venue.facilities.length > 5 && (
                    <span className="text-[11px] text-slate-400">
                      +{topRec.venue.facilities.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full lg:w-44 flex-shrink-0">
              <button
                onClick={() => onBookVenue(topRec.venue, topRec.matchScore)}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition"
              >
                BOOK NOW
              </button>
              <button
                onClick={() => onSelectVenueForDetails(topRec)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider transition"
              >
                VIEW DETAILS
              </button>
              <button
                onClick={() => onSelectVenueForMap(topRec.venue)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 font-bold text-xs uppercase tracking-wider transition"
              >
                VIEW ON MAP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Secondary Recommendations Grid (🥈, 🥉, etc.) */}
      {otherRecs.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Alternative Matched Venues
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {otherRecs.map((rec) => {
              const medal = rec.rank === 2 ? '🥈' : rec.rank === 3 ? '🥉' : '📍';
              return (
                <div
                  key={rec.venue.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition flex flex-col justify-between text-white"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{medal}</span>
                          <span className="text-xs text-slate-400">{rec.venue.building}</span>
                        </div>
                        <h4 className="text-lg font-bold text-white tracking-tight">
                          {rec.venue.name}
                        </h4>
                      </div>

                      {/* Circular Match Gauge */}
                      <div className="relative flex-shrink-0">
                        <svg className="w-14 h-14 -rotate-90">
                          <circle
                            cx="28"
                            cy="28"
                            r="23"
                            stroke="currentColor"
                            strokeWidth="4"
                            className="text-slate-800"
                            fill="transparent"
                          />
                          <circle
                            cx="28"
                            cy="28"
                            r="23"
                            stroke="currentColor"
                            strokeWidth="4"
                            strokeDasharray="144.5"
                            strokeDashoffset={144.5 - (144.5 * rec.matchScore) / 100}
                            className={`${
                              rec.matchScore >= 80 ? 'text-cyan-400' : 'text-blue-400'
                            } transition-all duration-700`}
                            strokeLinecap="round"
                            fill="transparent"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-black text-white">{rec.matchScore}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Spec badges */}
                    <div className="grid grid-cols-3 gap-2 text-xs mb-4">
                      <div className="bg-slate-800/80 p-2 rounded-lg text-center">
                        <span className="text-[10px] text-slate-400 block">Capacity</span>
                        <span className="font-bold text-white">{rec.venue.capacity}</span>
                      </div>
                      <div className="bg-slate-800/80 p-2 rounded-lg text-center">
                        <span className="text-[10px] text-slate-400 block">Distance</span>
                        <span className="font-bold text-cyan-300">{rec.distanceMeters} m</span>
                      </div>
                      <div className="bg-slate-800/80 p-2 rounded-lg text-center">
                        <span className="text-[10px] text-slate-400 block">Walking</span>
                        <span className="font-bold text-slate-200">{rec.walkingMinutes} min</span>
                      </div>
                    </div>

                    {/* Facilities pill preview */}
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {rec.venue.facilities.slice(0, 4).map((f) => (
                        <span
                          key={f}
                          className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md flex items-center gap-1"
                        >
                          <span className="text-cyan-400">✓</span>
                          <span>{f}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                    <button
                      onClick={() => onSelectVenueForMap(rec.venue)}
                      className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
                    >
                      VIEW ON MAP
                    </button>
                    <button
                      onClick={() => onSelectVenueForDetails(rec)}
                      className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-bold transition"
                    >
                      VIEW DETAILS
                    </button>
                    <button
                      onClick={() => onBookVenue(rec.venue, rec.matchScore)}
                      className="flex-1 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-black transition"
                    >
                      BOOK NOW
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
