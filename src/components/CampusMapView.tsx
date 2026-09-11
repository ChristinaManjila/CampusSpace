import React, { useEffect, useRef, useState } from 'react';
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
  onNavigateToVenue,
  recommendedVenueId,
  userLocation
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const userMarkerRef = useRef<any>(null);

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');

  const categories = [
    { id: 'all', label: 'All Campus Spaces' },
    { id: 'hall', label: 'Seminar Halls & Auds' },
    { id: 'lab', label: 'Tech & Maker Labs' },
    { id: 'classroom', label: 'Smart Classrooms' },
    { id: 'commons', label: 'Library & Hub' },
    { id: 'sports', label: 'Sports & Grounds' }
  ];

  const filteredVenues = venues.filter((v) => {
    const matchesCat =
      activeCategory === 'all' ||
      (activeCategory === 'hall' && (v.category === 'hall' || v.category === 'auditorium')) ||
      (activeCategory === 'sports' && (v.category === 'sports' || v.category === 'outdoor')) ||
      v.category === activeCategory;

    const matchesSearch =
      v.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      v.building.toLowerCase().includes(searchFilter.toLowerCase());

    return matchesCat && matchesSearch;
  });

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false
      }).setView([19.1334, 72.9133], 16);

      // Clean OpenStreetMap CartoDB / standard tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> | &copy; OpenStreetMap',
        maxZoom: 19
      }).addTo(map);

      // Add Zoom Control at bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker: any) => map.removeLayer(marker));
    markersRef.current = {};

    // Render Venue Markers
    filteredVenues.forEach((venue) => {
      const isRecommended = venue.id === recommendedVenueId;

      // Determine marker color
      let markerColor = '#22c55e'; // Green available
      let markerBorder = '#15803d';
      let statusLabel = 'Available';

      if (isRecommended) {
        markerColor = '#06b6d4'; // Cyan/Blue AI Recommended
        markerBorder = '#0891b2';
        statusLabel = 'AI Match';
      } else if (venue.status === 'booked') {
        markerColor = '#ef4444'; // Red booked
        markerBorder = '#b91c1c';
        statusLabel = 'Booked';
      } else if (venue.status === 'pending') {
        markerColor = '#f59e0b'; // Amber pending
        markerBorder = '#d97706';
        statusLabel = 'Pending';
      }

      // Custom HTML Pin
      const iconHtml = `
        <div style="
          background: ${markerColor};
          border: 2px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.35);
          width: 32px;
          height: 32px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        ">
          <div style="
            transform: rotate(45deg);
            color: white;
            font-size: 11px;
            font-weight: 800;
          ">
            ${isRecommended ? '★' : venue.capacity > 300 ? 'H' : '●'}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-campus-pin',
        html: iconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });

      const marker = L.marker([venue.coordinates.lat, venue.coordinates.lng], {
        icon: customIcon
      }).addTo(map);

      marker.on('click', () => {
        onSelectVenue(venue);
      });

      markersRef.current[venue.id] = marker;
    });

    // Render User Location Pin (Live GPS or Simulated Campus Point)
    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
    }

    const userIconHtml = `
      <div style="
        position: relative;
        width: 22px;
        height: 22px;
      ">
        <div style="
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          background: rgba(56, 189, 248, 0.4);
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>
        <div style="
          position: relative;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #0284c7;
          border: 3px solid white;
          box-shadow: 0 0 10px rgba(2, 132, 199, 0.6);
        "></div>
      </div>
    `;

    const userIcon = L.divIcon({
      className: 'user-location-pin',
      html: userIconHtml,
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });

    const userMarker = L.marker([userLocation.lat, userLocation.lng], {
      icon: userIcon,
      zIndexOffset: 1000
    }).addTo(map);

    userMarker.bindTooltip('Your Live Location (Campus)', {
      permanent: false,
      direction: 'top',
      className: 'bg-slate-900 text-white text-xs px-2 py-1 rounded shadow'
    });

    userMarkerRef.current = userMarker;

  }, [filteredVenues, recommendedVenueId, userLocation]);

  // Center on selected venue when changed
  useEffect(() => {
    if (selectedVenue && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(
        [selectedVenue.coordinates.lat, selectedVenue.coordinates.lng],
        17,
        { duration: 1 }
      );
    }
  }, [selectedVenue]);

  return (
    <div className="relative w-full h-[calc(100vh-140px)] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 flex flex-col">
      {/* Top Floating Controls Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800 pointer-events-auto shadow-xl">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition ${
                activeCategory === cat.id
                  ? 'bg-cyan-500 text-black shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="hidden sm:flex items-center gap-3 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-800 pointer-events-auto text-[11px] text-slate-300 shadow-xl font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>Booked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <span>AI Recommended</span>
          </div>
        </div>
      </div>

      {/* Full Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Selected Venue Slide-Up Detail Card */}
      {selectedVenue && (
        <div className="absolute bottom-6 left-6 right-6 sm:right-auto sm:w-[420px] z-20 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-3xl p-5 shadow-2xl text-white animate-slideUp">
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

          {/* Facilities Checklist */}
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

          {/* Action Buttons */}
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
  );
};
