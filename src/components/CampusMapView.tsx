import React, { useRef, useState } from 'react';
import { Venue, Coordinates } from '../types';

interface CampusMapViewProps {
  venues: Venue[];
  selectedVenue: Venue | null;
  onSelectVenue: (venue: Venue) => void;
  onBookVenue: (venue: Venue) => void;
  onNavigateToVenue: (venue: Venue) => void;
  recommendedVenueId?: string;
  userLocation: Coordinates;
}

export const CampusMapView: React.FC<CampusMapViewProps> = ({
  venues,
  selectedVenue,
  onSelectVenue,
  onBookVenue,
  onNavigateToVenue
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const mapUrl = 'https://mace-maps.vercel.app/';

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleReload = () => {
    setHasError(false);
    if (iframeRef.current) {
      const src = iframeRef.current.src;
      iframeRef.current.src = '';
      setTimeout(() => {
        if (iframeRef.current) iframeRef.current.src = src;
      }, 50);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[calc(100vh-140px)] min-h-[580px] rounded-3xl overflow-hidden border border-sky-500/20 shadow-[0_16px_40px_rgba(0,0,0,0.5),0_0_25px_rgba(37,141,255,0.10),0_0_45px_rgba(36,214,140,0.06)] bg-slate-950 flex flex-col"
    >
      {/* Top Header / Action Bar */}
      <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-slate-900/95 to-slate-950/95 backdrop-blur-md border-b border-slate-800 z-20 gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse"></span>
            Live MACE Maps
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Interactive Campus Structure & Live Navigation
          </span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition transform hover:-translate-y-0.5"
            title="Open MACE Maps in new tab"
          >
            <span>🧭 Open Navigation</span>
            <span className="text-[10px]">↗</span>
          </a>

          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            title="Toggle full screen"
          >
            <span>{isFullscreen ? 'Exit' : '⛶'}</span>
            <span className="hidden sm:inline">Fullscreen</span>
          </button>

          <button
            type="button"
            onClick={handleReload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            title="Reload map"
          >
            <span>🔄</span>
            <span className="hidden sm:inline">Reload</span>
          </button>
        </div>
      </div>

      {/* Map Frame Canvas & Fallback */}
      <div className="relative flex-1 w-full h-full bg-[#07111f] overflow-hidden">
        {!hasError ? (
          <>
            <iframe
              ref={iframeRef}
              src={mapUrl}
              title="MACE Campus Map & Navigation"
              className="w-full h-full border-0 block bg-[#07111f] brightness-[0.97] contrast-[1.02]"
              allow="geolocation *; camera; microphone; fullscreen; clipboard-read; clipboard-write"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              onError={() => setHasError(true)}
            />
            {/* Subtle edge-blending treatment that softens harsh iframe borders into CampusSpace navy theme */}
            <div className="absolute inset-0 pointer-events-none rounded-b-3xl shadow-[inset_0_0_24px_rgba(7,17,31,0.65),inset_0_0_1px_rgba(79,163,255,0.2)]" />
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-radial-slate text-white z-10">
            <div className="text-5xl mb-3 drop-shadow-[0_4px_12px_rgba(56,189,248,0.4)]">🗺️</div>
            <h3 className="text-xl font-bold mb-2">MACE Campus Navigation</h3>
            <p className="text-sm text-slate-400 max-w-md mb-5 leading-relaxed">
              Official interactive campus map for Mar Athanasius College of Engineering with GPS tracking, building floor plans, and navigation.
            </p>
            <div className="flex items-center gap-3">
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-600/30 transition"
              >
                🧭 Open Navigation
              </a>
              <button
                type="button"
                onClick={handleReload}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold border border-slate-700 transition"
              >
                🔄 Retry
              </button>
            </div>
          </div>
        )}

        {/* Selected Venue Slide-Up Detail Card */}
        {selectedVenue && (
          <div className="absolute bottom-6 left-6 right-6 sm:right-auto sm:w-[420px] z-30 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-3xl p-5 shadow-2xl text-white animate-slideUp">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      selectedVenue.status === 'available'
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                        : selectedVenue.status === 'booked'
                        ? 'bg-rose-950/80 text-rose-300 border-rose-700'
                        : 'bg-amber-950/80 text-amber-300 border-amber-700'
                    }`}
                  >
                    {selectedVenue.status === 'available'
                      ? '🟢 Available'
                      : selectedVenue.status === 'booked'
                      ? '🔴 Booked'
                      : '🟡 Pending'}
                  </span>
                  <span className="text-xs text-slate-400">{selectedVenue.floor}</span>
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight mt-1">
                  {selectedVenue.name}
                </h3>
                <p className="text-xs text-cyan-400 font-medium">{selectedVenue.building}</p>
              </div>

              <button
                onClick={() => onSelectVenue(null as any)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 my-3 text-xs">
              <div className="bg-slate-800/80 p-2 rounded-xl text-center">
                <span className="text-[10px] text-slate-400 block">Capacity</span>
                <span className="font-bold text-white">{selectedVenue.capacity}</span>
              </div>
              <div className="bg-slate-800/80 p-2 rounded-xl text-center">
                <span className="text-[10px] text-slate-400 block">Occupancy</span>
                <span className="font-bold text-cyan-300">
                  {selectedVenue.historicalAverageOccupancy}%
                </span>
              </div>
              <div className="bg-slate-800/80 p-2 rounded-xl text-center">
                <span className="text-[10px] text-slate-400 block">Energy</span>
                <span className="font-bold text-emerald-400">Class {selectedVenue.energyRating}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 mb-4">
              {selectedVenue.facilities.slice(0, 4).map((f) => (
                <span
                  key={f}
                  className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md flex items-center gap-1"
                >
                  <span className="text-cyan-400">✓</span>
                  <span>{f}</span>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => onNavigateToVenue(selectedVenue)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <span>Walk Directions</span>
                <span>📍</span>
              </button>
              <button
                onClick={() => onBookVenue(selectedVenue)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-black transition"
              >
                BOOK VENUE
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
