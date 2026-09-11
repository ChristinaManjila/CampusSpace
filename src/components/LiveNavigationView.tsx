import React, { useEffect, useRef, useState } from 'react';
import { Venue, Coordinates, NavigationRoute } from '../types';
import { generateCampusWalkingRoute } from '../utils/mapRouting';

interface LiveNavigationViewProps {
  venues: Venue[];
  userLocation: Coordinates;
  onUpdateUserLocation: (coords: Coordinates) => void;
  initialDestinationVenue?: Venue | null;
}

export const LiveNavigationView: React.FC<LiveNavigationViewProps> = ({
  venues,
  userLocation,
  onUpdateUserLocation,
  initialDestinationVenue
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const routeLineRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const destMarkerRef = useRef<any>(null);

  const [selectedDestination, setSelectedDestination] = useState<Venue | null>(
    initialDestinationVenue || venues[0] || null
  );
  const [activeRoute, setActiveRoute] = useState<NavigationRoute | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [gpsStatus, setGpsStatus] = useState<string>('Campus GPS Active');

  // Trigger live location tracking using navigator.geolocation
  const handleLocateMe = () => {
    if (!('geolocation' in navigator)) {
      setGpsStatus('Geolocation not supported by browser');
      return;
    }

    setIsLocating(true);
    setGpsStatus('Acquiring satellite lock...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        setGpsStatus('Live GPS Acquired');
        onUpdateUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        setIsLocating(false);
        setGpsStatus(`Simulated Campus Lock (${error.message || 'fallback'})`);
        // Fallback to campus center
        onUpdateUserLocation({ lat: 19.1334, lng: 72.9133 });
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  // Recalculate route whenever user location or destination changes
  useEffect(() => {
    if (selectedDestination) {
      const route = generateCampusWalkingRoute(userLocation, selectedDestination);
      setActiveRoute(route);
    }
  }, [userLocation, selectedDestination]);

  // Leaflet map setup & route polyline rendering
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false
      }).setView([userLocation.lat, userLocation.lng], 16);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO | &copy; OpenStreetMap',
        maxZoom: 19
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Remove previous route line
    if (routeLineRef.current) {
      map.removeLayer(routeLineRef.current);
    }
    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
    }
    if (destMarkerRef.current) {
      map.removeLayer(destMarkerRef.current);
    }

    // Draw user marker
    const userIconHtml = `
      <div style="position: relative; width: 24px; height: 24px;">
        <div style="position: absolute; inset: -4px; border-radius: 50%; background: rgba(56, 189, 248, 0.5); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position: relative; width: 24px; height: 24px; border-radius: 50%; background: #0284c7; border: 3px solid white; box-shadow: 0 0 12px rgba(2, 132, 199, 0.7); display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: bold;">
          YOU
        </div>
      </div>
    `;
    const userIcon = L.divIcon({
      className: 'user-pin',
      html: userIconHtml,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
    userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
      icon: userIcon
    }).addTo(map);

    // Draw destination marker
    if (selectedDestination) {
      const destIconHtml = `
        <div style="
          background: #0ea5e9;
          border: 2px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.35);
          width: 32px;
          height: 32px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="transform: rotate(45deg); color: white; font-size: 14px;">
            🏁
          </div>
        </div>
      `;
      const destIcon = L.divIcon({
        className: 'dest-pin',
        html: destIconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });
      destMarkerRef.current = L.marker(
        [selectedDestination.coordinates.lat, selectedDestination.coordinates.lng],
        { icon: destIcon }
      ).addTo(map);
    }

    // Draw Walking Route Polyline
    if (activeRoute && activeRoute.waypoints.length > 0) {
      const polyline = L.polyline(activeRoute.waypoints, {
        color: '#0284c7',
        weight: 5,
        opacity: 0.9,
        dashArray: '8, 8',
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      routeLineRef.current = polyline;

      // Fit bounds to show entire route
      map.fitBounds(polyline.getBounds(), { padding: [60, 60] });
    }
  }, [userLocation, selectedDestination, activeRoute]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto h-[calc(100vh-140px)]">
      {/* Left Column: Navigation Controls & Turn-by-Turn Guidance */}
      <div className="bg-[#0b1329] border border-slate-800 rounded-3xl p-6 flex flex-col justify-between overflow-y-auto text-white shadow-2xl">
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>📍</span>
                <span>Live Campus Navigation</span>
              </h2>
              <p className="text-xs text-slate-400">Pedestrian walking routes & turn guidance</p>
            </div>
          </div>

          {/* GPS Status & Locate Me Button */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">GPS Status:</span>
              <span className="text-cyan-400 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                <span>{gpsStatus}</span>
              </span>
            </div>

            <button
              onClick={handleLocateMe}
              disabled={isLocating}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <span>{isLocating ? 'Acquiring GPS...' : 'Locate Me (watchPosition)'}</span>
              <span>🛰️</span>
            </button>
          </div>

          {/* Destination Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Select Destination Venue
            </label>
            <select
              value={selectedDestination?.id || ''}
              onChange={(e) => {
                const found = venues.find((v) => v.id === e.target.value);
                if (found) setSelectedDestination(found);
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-slate-100 font-medium focus:outline-none focus:border-cyan-400"
            >
              {venues.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.building})
                </option>
              ))}
            </select>
          </div>

          {/* Route Metric Cards */}
          {activeRoute && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-cyan-950/40 to-slate-900 border border-cyan-800/40 p-3.5 rounded-2xl text-center">
                <span className="text-[10px] uppercase font-bold text-cyan-400 block">
                  Walking Time
                </span>
                <span className="text-2xl font-black text-white">
                  {activeRoute.totalWalkingMinutes} min
                </span>
              </div>
              <div className="bg-gradient-to-br from-blue-950/40 to-slate-900 border border-blue-800/40 p-3.5 rounded-2xl text-center">
                <span className="text-[10px] uppercase font-bold text-blue-400 block">
                  Distance
                </span>
                <span className="text-2xl font-black text-white">
                  {activeRoute.totalDistanceMeters} m
                </span>
              </div>
            </div>
          )}

          {/* Turn-by-turn steps */}
          {activeRoute && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Turn-by-Turn Walking Directions
              </h3>
              <div className="space-y-2.5">
                {activeRoute.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 bg-slate-900/70 border border-slate-800/80 p-3 rounded-xl text-xs"
                  >
                    <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-200 leading-snug">{step.instruction}</p>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {step.distanceMeters}m • ~{step.durationMinutes} min
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Accessibility & Speed Note */}
        <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Speed: ~4.8 km/h</span>
          <span className="text-emerald-400 font-semibold">♿ Wheelchair Step-Free</span>
        </div>
      </div>

      {/* Right Column: Live Route Map View */}
      <div className="lg:col-span-2 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative bg-slate-950">
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>
    </div>
  );
};
