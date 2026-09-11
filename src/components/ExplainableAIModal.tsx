import React from 'react';
import { AIRecommendationResult } from '../types';

interface ExplainableAIModalProps {
  recommendation: AIRecommendationResult | null;
  onClose: () => void;
  onBook: () => void;
  onViewOnMap: () => void;
}

export const ExplainableAIModal: React.FC<ExplainableAIModalProps> = ({
  recommendation,
  onClose,
  onBook,
  onViewOnMap
}) => {
  if (!recommendation) return null;

  const { venue, matchScore, whyRecommended, warnings, highlights } = recommendation;

  // Breakdown metrics
  const scoreFactors = [
    { label: 'Capacity Fit Ratio', score: recommendation.capacityScore, weight: '25%' },
    { label: 'Facility Coverage', score: recommendation.facilityScore, weight: '25%' },
    { label: 'Real-Time Availability', score: recommendation.availabilityScore, weight: '20%' },
    { label: 'Historical Suitability', score: recommendation.historicalScore, weight: '15%' },
    { label: 'Campus Proximity & Walk', score: recommendation.proximityScore, weight: '10%' },
    { label: 'Reliability & Low Cancellation', score: recommendation.reliabilityScore, weight: '5%' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0b1329] border border-slate-700/80 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto text-white">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white bg-slate-800/80 p-2 rounded-xl transition"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="relative flex-shrink-0">
            {/* Circular Progress Ring */}
            <svg className="w-20 h-20 -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke="currentColor"
                strokeWidth="6"
                className="text-slate-800"
                fill="transparent"
              />
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke="currentColor"
                strokeWidth="6"
                strokeDasharray="213.6"
                strokeDashoffset={213.6 - (213.6 * matchScore) / 100}
                className="text-cyan-400 transition-all duration-1000"
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-black text-white">{matchScore}%</span>
              <span className="text-[9px] uppercase font-bold text-cyan-300">Match</span>
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 text-[11px] font-semibold mb-1">
              <span>Explainable AI Engine</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">{venue.name}</h2>
            <p className="text-xs text-slate-400">{venue.building} • {venue.floor}</p>
          </div>
        </div>

        {/* Explainable AI Checklist */}
        <div className="mb-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-300 mb-3 flex items-center gap-2">
            <span>✓</span>
            <span>Why CampusSpace recommends this venue</span>
          </h3>

          <div className="space-y-2.5">
            {whyRecommended.map((reason, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-200">
                <span className="text-emerald-400 font-bold flex-shrink-0 mt-0.5">✓</span>
                <span className="leading-relaxed">{reason}</span>
              </div>
            ))}

            {warnings.length > 0 && (
              <div className="pt-2 border-t border-slate-800 space-y-1">
                {warnings.map((warn, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-amber-400">
                    <span className="font-bold flex-shrink-0">⚠️</span>
                    <span className="leading-relaxed">{warn}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Multi-Factor Weight Breakdown */}
        <div className="mb-6 bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            Transparent Scoring Breakdown
          </h3>

          <div className="space-y-3">
            {scoreFactors.map((factor) => (
              <div key={factor.label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">
                    {factor.label}{' '}
                    <span className="text-slate-500 text-[10px]">({factor.weight} weight)</span>
                  </span>
                  <span className="font-bold text-white">{factor.score}/100</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-700 ${
                      factor.score >= 85
                        ? 'bg-gradient-to-r from-cyan-400 to-emerald-400'
                        : factor.score >= 60
                        ? 'bg-gradient-to-r from-blue-400 to-cyan-400'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${factor.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onViewOnMap}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
          >
            View on Interactive Map
          </button>
          <button
            onClick={onBook}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-extrabold shadow-lg shadow-cyan-500/20 transition"
          >
            Confirm & Reserve Venue
          </button>
        </div>
      </div>
    </div>
  );
};
