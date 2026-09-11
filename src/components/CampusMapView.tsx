import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Venue, Coordinates, Room, CampusLocation } from '../types';
import {
  MACE_CAMPUS_LOCATIONS,
  MACE_CS_BLOCK_ROOMS,
  MACE_CAMPUS_CENTER,
  MACE_CAMPUS_BOUNDS,
  searchMaceCampus
} from '../data/maceLocations';

interface CampusMapViewProps {
  venues: Venue[];
  selectedVenue: Venue | null;
  onSelectVenue: (venue: Venue | null) => void;
  onBookVenue: (venue: Venue) => void;
  onNavigateToVenue: (venue: Venue) => void;
  recommendedVenueId?: string;
  userLocation: Coordinates;
}

// Convert geographic coordinates to SVG coordinates (1000 x 1400)
const geoToSvg = (coords: Coordinates): { x: number; y: number } => {
  const x = ((coords.lng - MACE_CAMPUS_BOUNDS.west) / (MACE_CAMPUS_BOUNDS.east - MACE_CAMPUS_BOUNDS.west)) * 1000;
  const y = 1400 - ((coords.lat - MACE_CAMPUS_BOUNDS.south) / (MACE_CAMPUS_BOUNDS.north - MACE_CAMPUS_BOUNDS.south)) * 1400;
  return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
};

// Calculate Haversine distance in meters
const calculateHaversine = (from: Coordinates, to: Coordinates): number => {
  const R = 6371000;
  const rad = Math.PI / 180;
  const dLat = (to.lat - from.lat) * rad;
  const dLng = (to.lng - from.lng) * rad;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(from.lat * rad) * Math.cos(to.lat * rad) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

// Calculate bearing in degrees
const calculateBearing = (from: Coordinates, to: Coordinates): number => {
  const rad = Math.PI / 180;
  const y = Math.sin((to.lng - from.lng) * rad) * Math.cos(to.lat * rad);
  const x =
    Math.cos(from.lat * rad) * Math.sin(to.lat * rad) -
    Math.sin(from.lat * rad) * Math.cos(to.lat * rad) * Math.cos((to.lng - from.lng) * rad);
  const deg = (Math.atan2(y, x) * 180) / Math.PI;
  return Math.round((deg + 360) % 360);
};

const getBearingLabel = (bearing: number): string => {
  const directions = ['North', 'Northeast', 'East', 'Southeast', 'South', 'Southwest', 'West', 'Northwest'];
  const index = Math.round(bearing / 45) % 8;
  return directions[index];
};

export const CampusMapView: React.FC<CampusMapViewProps> = ({
  venues,
  selectedVenue,
  onSelectVenue,
  onBookVenue,
  onNavigateToVenue,
  userLocation: propUserLocation
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Pan & Zoom state
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const searchResults = useMemo(() => searchMaceCampus(searchQuery), [searchQuery]);

  // Selected Location / Building state
  const [selectedLocation, setSelectedLocation] = useState<CampusLocation | null>(null);

  // CS Block Floor Plan Modal state
  const [isFloorPlanOpen, setIsFloorPlanOpen] = useState<boolean>(false);
  const [currentFloor, setCurrentFloor] = useState<number>(2);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Live GPS tracking state
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [currentGps, setCurrentGps] = useState<Coordinates>(propUserLocation || MACE_CAMPUS_CENTER);
  const [gpsAccuracy, setGpsAccuracy] = useState<number>(15);
  const [gpsMessage, setGpsMessage] = useState<string | null>(null);

  // Active Navigation Route state
  const [activeNavDestination, setActiveNavDestination] = useState<{
    name: string;
    coordinates: Coordinates;
    floor?: number;
    room?: string;
  } | null>(null);

  // Geolocation watch
  useEffect(() => {
    let watchId: number | null = null;
    if (isTracking && navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setCurrentGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setGpsAccuracy(Math.min(pos.coords.accuracy, 40));
          setGpsMessage(null);
        },
        (err) => {
          setGpsMessage(`Location access unavailable (${err.message}). Using campus center.`);
          setIsTracking(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 3000 }
      );
    }
    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [isTracking]);

  const toggleTracking = () => {
    if (isTracking) {
      setIsTracking(false);
      setGpsMessage('GPS location tracking paused');
    } else {
      if (!navigator.geolocation) {
        setGpsMessage('Geolocation is not supported by your browser');
        return;
      }
      setIsTracking(true);
      setGpsMessage('Acquiring live GPS satellite lock...');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setGpsAccuracy(Math.min(pos.coords.accuracy, 30));
          setGpsMessage('Live GPS location locked');
          setTimeout(() => setGpsMessage(null), 3000);
        },
        () => {
          setGpsMessage('Location permission denied. You can still explore and navigate!');
          setIsTracking(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  };

  // Synchronize venue selection
  useEffect(() => {
    if (selectedVenue) {
      const loc = MACE_CAMPUS_LOCATIONS.find((l) =>
        l.name.toLowerCase().includes(selectedVenue.building.toLowerCase()) ||
        selectedVenue.name.toLowerCase().includes(l.name.toLowerCase())
      );
      if (loc) {
        setSelectedLocation(loc);
        focusCoordinates(loc.coordinates);
      }
    }
  }, [selectedVenue]);

  // Center/focus on coordinates
  const focusCoordinates = (coords: Coordinates, customZoom = 1.3) => {
    const svgPoint = geoToSvg(coords);
    // Center within 1000x1400 viewport
    const newX = (500 - svgPoint.x) * customZoom;
    const newY = (700 - svgPoint.y) * customZoom;
    setZoom(customZoom);
    setPan({ x: newX, y: newY });
  };

  // Start Navigation to a target
  const handleStartNavigation = (target: { name: string; coordinates: Coordinates; floor?: number; room?: string }) => {
    setActiveNavDestination(target);
    setIsFloorPlanOpen(false);
    focusCoordinates(target.coordinates, 1.2);
  };

  const handleStopNavigation = () => {
    setActiveNavDestination(null);
  };

  // Fullscreen
  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Mouse pan handling
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Left click only
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    setZoom((z) => Math.max(0.7, Math.min(3, z + delta)));
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedLocation(null);
    onSelectVenue(null);
  };

  // User position in SVG space
  const userSvgPos = geoToSvg(currentGps);

  // Active navigation metrics
  const navMetrics = useMemo(() => {
    if (!activeNavDestination) return null;
    const distMeters = calculateHaversine(currentGps, activeNavDestination.coordinates);
    const bearing = calculateBearing(currentGps, activeNavDestination.coordinates);
    const walkMins = Math.max(1, Math.round(distMeters / 83.3));
    const label = getBearingLabel(bearing);
    const destSvgPos = geoToSvg(activeNavDestination.coordinates);

    return {
      distance: distMeters,
      bearing,
      walkMins,
      direction: label,
      destSvgPos,
      isClose: distMeters < 15
    };
  }, [activeNavDestination, currentGps]);

  // Road SVG definitions
  const entrancePos = geoToSvg({ lat: 10.055167, lng: 76.619167 });
  const mainBlockPos = geoToSvg({ lat: 10.0538, lng: 76.6192 });
  const csBlockPos = geoToSvg({ lat: 10.052444, lng: 76.618639 });
  const canteenPos = geoToSvg({ lat: 10.0528, lng: 76.6198 });
  const oatPos = geoToSvg({ lat: 10.0544, lng: 76.6181 });
  const libraryPos = geoToSvg({ lat: 10.053667, lng: 76.619694 });

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[calc(100vh-140px)] min-h-[580px] rounded-3xl overflow-hidden border border-sky-500/20 shadow-[0_16px_40px_rgba(0,0,0,0.6),0_0_25px_rgba(37,141,255,0.12),0_0_45px_rgba(36,214,140,0.08)] bg-[#071322] flex flex-col select-none text-slate-100 font-sans"
    >
      {/* 1. Header Toolbar */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-slate-900/95 via-[#0c1c2e]/95 to-slate-950/95 backdrop-blur-md border-b border-slate-800/80 z-20 gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse"></span>
            MACE Smart Map
          </div>

          {/* Integrated Search Bar */}
          <div className="relative w-64 sm:w-80">
            <div className="relative flex items-center">
              <span className="absolute left-3 text-slate-400 text-sm">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="Search campus buildings, labs, rooms (e.g. L206)..."
                className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-cyan-400 rounded-xl pl-9 pr-8 py-1.5 text-xs text-white placeholder-slate-400 outline-none transition shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearchOpen(false);
                  }}
                  className="absolute right-2.5 text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Search Dropdown Results */}
            {isSearchOpen && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-900/98 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-72 overflow-y-auto">
                {searchResults.map((res, i) => {
                  const isLoc = res.type === 'location';
                  const loc = isLoc ? (res.item as CampusLocation) : null;
                  const room = !isLoc ? (res.item as Room) : null;

                  return (
                    <div
                      key={i}
                      onClick={() => {
                        setIsSearchOpen(false);
                        if (isLoc && loc) {
                          setSelectedLocation(loc);
                          focusCoordinates(loc.coordinates);
                        } else if (room) {
                          const csLoc = MACE_CAMPUS_LOCATIONS.find((l) => l.id === 'cs-block');
                          if (csLoc) {
                            setSelectedLocation(csLoc);
                            focusCoordinates(csLoc.coordinates);
                          }
                          setSelectedRoom(room);
                          setCurrentFloor(room.floor);
                          setIsFloorPlanOpen(true);
                        }
                      }}
                      className="px-3.5 py-2.5 hover:bg-slate-800/80 cursor-pointer border-b border-slate-800/50 flex items-center justify-between gap-2 text-xs transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-base flex-shrink-0">
                          {isLoc ? (loc?.type === 'building' ? '🏛' : loc?.type === 'facility' ? '🍽' : '📍') : '🔬'}
                        </span>
                        <div className="truncate">
                          <p className="font-semibold text-slate-100 truncate">
                            {isLoc ? loc?.name : `${room?.number} • ${room?.name}`}
                          </p>
                          <p className="text-[10px] text-cyan-400 truncate">
                            {isLoc ? loc?.shortName || loc?.type : `CS Block • Floor ${room?.floor}`}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsSearchOpen(false);
                          if (isLoc && loc) {
                            handleStartNavigation({ name: loc.name, coordinates: loc.coordinates });
                          } else if (room) {
                            const csLoc = MACE_CAMPUS_LOCATIONS.find((l) => l.id === 'cs-block');
                            handleStartNavigation({
                              name: `${room.number} (${room.name})`,
                              coordinates: csLoc?.coordinates || MACE_CAMPUS_CENTER,
                              floor: room.floor,
                              room: room.number
                            });
                          }
                        }}
                        className="flex-shrink-0 px-2.5 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white font-bold text-[10px] border border-blue-500/30 transition"
                      >
                        Navigate 🧭
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Map Control Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* My Location GPS Button */}
          <button
            type="button"
            onClick={toggleTracking}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              isTracking
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.3)]'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
            }`}
            title="Toggle live GPS location"
          >
            <span>🛰️</span>
            <span>{isTracking ? 'GPS Active' : 'My Location'}</span>
          </button>

          {/* CS Block Floor Plans */}
          <button
            type="button"
            onClick={() => {
              setIsFloorPlanOpen(true);
              const csLoc = MACE_CAMPUS_LOCATIONS.find((l) => l.id === 'cs-block');
              if (csLoc) setSelectedLocation(csLoc);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            title="Inspect building floor plans"
          >
            <span>📐</span>
            <span className="hidden sm:inline">CS Floor Plans</span>
          </button>

          {/* Zoom In */}
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold border border-slate-700 flex items-center justify-center transition"
            title="Zoom In"
          >
            +
          </button>

          {/* Zoom Out */}
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.7, z - 0.25))}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold border border-slate-700 flex items-center justify-center transition"
            title="Zoom Out"
          >
            -
          </button>

          {/* Reset View */}
          <button
            type="button"
            onClick={resetView}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center justify-center transition"
            title="Reset Campus View"
          >
            ⌖
          </button>

          {/* Fullscreen */}
          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center justify-center transition"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? 'Exit' : '⛶'}
          </button>
        </div>
      </div>

      {/* GPS Status Toast Notification */}
      {gpsMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-xl bg-slate-900/90 border border-cyan-500/40 text-cyan-300 text-xs shadow-xl animate-fade">
          {gpsMessage}
        </div>
      )}

      {/* 2. Interactive SVG Map Canvas */}
      <div
        className="relative flex-1 w-full h-full bg-[#06101d] overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      >
        <svg
          ref={svgRef}
          viewBox="0 0 1000 1400"
          className="w-full h-full transition-transform duration-75 ease-out"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '50% 50%'
          }}
        >
          <defs>
            {/* Campus Background Pattern */}
            <pattern id="campusGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
            </pattern>

            {/* Glowing Drop Shadows */}
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#38bdf8" floodOpacity="0.3" />
            </filter>
            <filter id="buildingShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#000000" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* 1. Base Canvas & Campus Ground */}
          <rect width="1000" height="1400" fill="#071322" />
          <rect width="1000" height="1400" fill="url(#campusGrid)" />

          {/* 2. Campus Boundary Perimeter */}
          <rect
            x="40"
            y="40"
            width="920"
            height="1320"
            rx="24"
            fill="none"
            stroke="rgba(79, 163, 255, 0.12)"
            strokeWidth="2"
            strokeDasharray="8 6"
          />

          {/* 3. Green Landscaped Commons & Parks */}
          <g id="greenSpaces">
            {/* NSS Park */}
            <ellipse cx="440" cy="700" rx="90" ry="70" fill="rgba(16, 185, 129, 0.15)" stroke="rgba(52, 211, 153, 0.3)" strokeWidth="2" />
            <text x="440" y="705" textAnchor="middle" fill="#6ee7b7" fontSize="13" fontWeight="bold" opacity="0.8">
              🌳 NSS Park
            </text>

            {/* Campus Center Lawn */}
            <ellipse cx="500" cy="550" rx="70" ry="50" fill="rgba(16, 185, 129, 0.10)" stroke="rgba(52, 211, 153, 0.2)" strokeWidth="1" />

            {/* Decorative Trees */}
            {[
              [240, 480], [280, 520], [720, 560], [760, 600],
              [350, 920], [380, 960], [620, 920], [660, 960],
              [480, 260], [520, 260]
            ].map(([tx, ty], idx) => (
              <g key={idx} transform={`translate(${tx}, ${ty})`}>
                <circle cx="0" cy="0" r="14" fill="rgba(16, 185, 129, 0.25)" stroke="rgba(52, 211, 153, 0.4)" strokeWidth="1" />
                <circle cx="0" cy="0" r="6" fill="#10b981" opacity="0.7" />
              </g>
            ))}
          </g>

          {/* 4. Campus Road Network */}
          <g id="roadNetwork">
            {/* Main Spine Road */}
            <path
              d={`
                M ${entrancePos.x} ${entrancePos.y}
                L ${mainBlockPos.x} ${mainBlockPos.y}
                L ${mainBlockPos.x + 60} ${mainBlockPos.y + 70}
                L ${canteenPos.x} ${canteenPos.y}
                M ${mainBlockPos.x} ${mainBlockPos.y}
                L ${mainBlockPos.x - 40} ${mainBlockPos.y + 110}
                L ${csBlockPos.x} ${csBlockPos.y}
                L ${canteenPos.x} ${canteenPos.y}
                M ${mainBlockPos.x} ${mainBlockPos.y}
                L ${oatPos.x} ${oatPos.y}
                M ${mainBlockPos.x + 60} ${mainBlockPos.y + 70}
                L ${libraryPos.x} ${libraryPos.y}
              `}
              fill="none"
              stroke="#17283c"
              strokeWidth="26"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Road Borders */}
            <path
              d={`
                M ${entrancePos.x} ${entrancePos.y}
                L ${mainBlockPos.x} ${mainBlockPos.y}
                L ${mainBlockPos.x + 60} ${mainBlockPos.y + 70}
                L ${canteenPos.x} ${canteenPos.y}
                M ${mainBlockPos.x} ${mainBlockPos.y}
                L ${mainBlockPos.x - 40} ${mainBlockPos.y + 110}
                L ${csBlockPos.x} ${csBlockPos.y}
                L ${canteenPos.x} ${canteenPos.y}
                M ${mainBlockPos.x} ${mainBlockPos.y}
                L ${oatPos.x} ${oatPos.y}
                M ${mainBlockPos.x + 60} ${mainBlockPos.y + 70}
                L ${libraryPos.x} ${libraryPos.y}
              `}
              fill="none"
              stroke="rgba(79, 163, 255, 0.25)"
              strokeWidth="28"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Dashed Center Guidance Line */}
            <path
              d={`
                M ${entrancePos.x} ${entrancePos.y}
                L ${mainBlockPos.x} ${mainBlockPos.y}
                L ${mainBlockPos.x + 60} ${mainBlockPos.y + 70}
                L ${canteenPos.x} ${canteenPos.y}
                M ${mainBlockPos.x} ${mainBlockPos.y}
                L ${mainBlockPos.x - 40} ${mainBlockPos.y + 110}
                L ${csBlockPos.x} ${csBlockPos.y}
                L ${canteenPos.x} ${canteenPos.y}
                M ${mainBlockPos.x} ${mainBlockPos.y}
                L ${oatPos.x} ${oatPos.y}
                M ${mainBlockPos.x + 60} ${mainBlockPos.y + 70}
                L ${libraryPos.x} ${libraryPos.y}
              `}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2"
              strokeDasharray="10 10"
              strokeLinecap="round"
              opacity="0.8"
            />
          </g>

          {/* 5. Campus Buildings & Facilities */}
          <g id="campusBuildings">
            {MACE_CAMPUS_LOCATIONS.map((loc) => {
              const pos = geoToSvg(loc.coordinates);
              const isSelected = selectedLocation?.id === loc.id;
              const isBuilding = loc.type === 'building';
              const isEntrance = loc.type === 'entrance';
              const isLandmark = loc.type === 'landmark';

              if (isEntrance) {
                return (
                  <g
                    key={loc.id}
                    onClick={() => {
                      setSelectedLocation(loc);
                      focusCoordinates(loc.coordinates);
                    }}
                    className="cursor-pointer group"
                  >
                    <circle cx={pos.x} cy={pos.y} r="18" fill="#0284c7" stroke="#ffffff" strokeWidth="2.5" />
                    <text x={pos.x} y={pos.y + 5} textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">
                      🚪
                    </text>
                    <rect x={pos.x - 55} y={pos.y + 24} width="110" height="22" rx="6" fill="rgba(15, 23, 42, 0.9)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                    <text x={pos.x} y={pos.y + 39} textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="bold">
                      {loc.name}
                    </text>
                  </g>
                );
              }

              if (isLandmark) {
                return (
                  <g
                    key={loc.id}
                    onClick={() => {
                      setSelectedLocation(loc);
                      focusCoordinates(loc.coordinates);
                    }}
                    className="cursor-pointer group"
                  >
                    <circle cx={pos.x} cy={pos.y} r="20" fill={isSelected ? '#f59e0b' : '#0d9488'} stroke="#ffffff" strokeWidth="2" filter="url(#neonGlow)" />
                    <text x={pos.x} y={pos.y + 6} textAnchor="middle" fill="#ffffff" fontSize="14">
                      {loc.id.includes('stage') ? '🎤' : '🎭'}
                    </text>
                    <rect x={pos.x - 70} y={pos.y + 25} width="140" height="22" rx="6" fill="rgba(15, 23, 42, 0.9)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                    <text x={pos.x} y={pos.y + 40} textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="bold">
                      {loc.name}
                    </text>
                  </g>
                );
              }

              // Departmental Building Blocks
              const width = loc.id === 'main-block' ? 120 : loc.id === 'cs-block' ? 105 : 90;
              const height = loc.id === 'main-block' ? 70 : loc.id === 'cs-block' ? 65 : 55;

              return (
                <g
                  key={loc.id}
                  onClick={() => {
                    setSelectedLocation(loc);
                    focusCoordinates(loc.coordinates);
                  }}
                  className="cursor-pointer group"
                >
                  {/* Building Base Shadow & Fill */}
                  <rect
                    x={pos.x - width / 2}
                    y={pos.y - height / 2}
                    width={width}
                    height={height}
                    rx="12"
                    fill={isSelected ? '#1e3a8a' : '#0f2744'}
                    stroke={isSelected ? '#38bdf8' : '#334155'}
                    strokeWidth={isSelected ? '3.5' : '2'}
                    filter="url(#buildingShadow)"
                    className="transition-all duration-200 group-hover:stroke-cyan-400 group-hover:brightness-110"
                  />

                  {/* Top Roof Accent / Strip */}
                  <rect
                    x={pos.x - width / 2 + 4}
                    y={pos.y - height / 2 + 4}
                    width={width - 8}
                    height="10"
                    rx="4"
                    fill={
                      loc.id === 'cs-block'
                        ? '#0284c7'
                        : loc.id === 'main-block'
                        ? '#3b82f6'
                        : loc.id === 'ece-block'
                        ? '#8b5cf6'
                        : '#10b981'
                    }
                    opacity="0.85"
                  />

                  {/* Building Department Code / Icon */}
                  <text
                    x={pos.x}
                    y={pos.y + 2}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="12"
                    fontWeight="800"
                    letterSpacing="0.5"
                  >
                    {loc.shortName?.split(' ')[0] || loc.name.split(' ')[0]}
                  </text>

                  {/* Multi-floor Badge */}
                  {loc.floors && (
                    <g transform={`translate(${pos.x + width / 2 - 22}, ${pos.y - height / 2 - 8})`}>
                      <circle cx="10" cy="10" r="10" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
                      <text x="10" y="14" textAnchor="middle" fill="#0f172a" fontSize="10" fontWeight="bold">
                        {loc.floors.length}F
                      </text>
                    </g>
                  )}

                  {/* Building Label Tag */}
                  <rect
                    x={pos.x - (loc.name.length * 4.2)}
                    y={pos.y + height / 2 + 8}
                    width={loc.name.length * 8.4}
                    height="20"
                    rx="6"
                    fill="rgba(8, 20, 36, 0.95)"
                    stroke={isSelected ? '#38bdf8' : 'rgba(255, 255, 255, 0.12)'}
                    strokeWidth="1"
                  />
                  <text
                    x={pos.x}
                    y={pos.y + height / 2 + 22}
                    textAnchor="middle"
                    fill="#f1f5f9"
                    fontSize="10.5"
                    fontWeight="bold"
                  >
                    {loc.name}
                  </text>
                </g>
              );
            })}
          </g>

          {/* 6. Active Navigation Route Polyline */}
          {navMetrics && (
            <g id="activeRoute">
              <line
                x1={userSvgPos.x}
                y1={userSvgPos.y}
                x2={navMetrics.destSvgPos.x}
                y2={navMetrics.destSvgPos.y}
                stroke="#38bdf8"
                strokeWidth="5"
                strokeDasharray="12 6"
                strokeLinecap="round"
                filter="url(#neonGlow)"
              />
              {/* Destination Flag Marker */}
              <g transform={`translate(${navMetrics.destSvgPos.x}, ${navMetrics.destSvgPos.y})`}>
                <circle cx="0" cy="0" r="16" fill="#ef4444" stroke="#ffffff" strokeWidth="2.5" />
                <text x="0" y="5" textAnchor="middle" fill="#ffffff" fontSize="12">
                  🏁
                </text>
              </g>
            </g>
          )}

          {/* 7. Live User Location Marker (Pulsing GPS Pin) */}
          <g id="userLocationMarker" transform={`translate(${userSvgPos.x}, ${userSvgPos.y})`}>
            {/* Accuracy Zone */}
            <circle cx="0" cy="0" r={gpsAccuracy * 1.5} fill="rgba(56, 189, 248, 0.12)" stroke="rgba(56, 189, 248, 0.3)" strokeWidth="1" />
            {/* Outer Pulse Ring */}
            <circle cx="0" cy="0" r="22" fill="none" stroke="#38bdf8" strokeWidth="2" opacity="0.7">
              <animate attributeName="r" values="14;28;14" dur="2.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0;0.8" dur="2.5s" repeatCount="indefinite" />
            </circle>
            {/* Core User Pin */}
            <circle cx="0" cy="0" r="9" fill="#0284c7" stroke="#ffffff" strokeWidth="2.5" />
            <circle cx="0" cy="0" r="4" fill="#ffffff" />
          </g>
        </svg>

        {/* 3. Navigation HUD Panel (Bottom Overlay) */}
        {activeNavDestination && navMetrics && (
          <div className="absolute top-4 left-4 right-4 sm:right-auto sm:w-96 z-30 bg-slate-900/95 backdrop-blur-xl border border-cyan-500/40 rounded-2xl p-4 shadow-2xl text-white animate-slideUp">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Live Navigation
                </span>
                <h3 className="text-base font-bold text-white mt-1.5 flex items-center gap-1.5">
                  <span>📍</span>
                  <span>{activeNavDestination.name}</span>
                </h3>
                {activeNavDestination.floor && (
                  <p className="text-xs text-cyan-400">Floor {activeNavDestination.floor}</p>
                )}
              </div>
              <button
                onClick={handleStopNavigation}
                className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 border border-rose-500/30 text-xs font-bold transition"
              >
                Stop
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs my-2">
              <div className="bg-slate-800/80 p-2 rounded-xl">
                <span className="text-[10px] text-slate-400 block">Distance</span>
                <span className="font-extrabold text-white text-sm">{navMetrics.distance} m</span>
              </div>
              <div className="bg-slate-800/80 p-2 rounded-xl">
                <span className="text-[10px] text-slate-400 block">Walking</span>
                <span className="font-extrabold text-cyan-300 text-sm">~{navMetrics.walkMins} min</span>
              </div>
              <div className="bg-slate-800/80 p-2 rounded-xl">
                <span className="text-[10px] text-slate-400 block">Bearing</span>
                <span className="font-extrabold text-emerald-400 text-sm">{navMetrics.direction}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-300 mt-2 bg-slate-800/50 p-2 rounded-lg border border-slate-700/50 flex items-center gap-2">
              <span>🧭</span>
              <span>Head {navMetrics.direction} along the central pedestrian avenue.</span>
            </p>
          </div>
        )}

        {/* 4. Selected Location Detail Card */}
        {selectedLocation && !activeNavDestination && (
          <div className="absolute bottom-6 left-6 right-6 sm:right-auto sm:w-[420px] z-30 bg-slate-900/95 backdrop-blur-xl border border-slate-700/90 rounded-3xl p-5 shadow-2xl text-white animate-slideUp">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
                  {selectedLocation.type}
                </span>
                <h3 className="text-lg font-bold text-white tracking-tight mt-1">
                  {selectedLocation.name}
                </h3>
                {selectedLocation.shortName && (
                  <p className="text-xs text-cyan-400 font-medium">{selectedLocation.shortName}</p>
                )}
              </div>
              <button
                onClick={() => {
                  setSelectedLocation(null);
                  onSelectVenue(null);
                }}
                className="text-slate-400 hover:text-white p-1 text-sm"
              >
                ✕
              </button>
            </div>

            {selectedLocation.description && (
              <p className="text-xs text-slate-300 leading-relaxed my-3 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
                {selectedLocation.description}
              </p>
            )}

            {/* Quick Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => handleStartNavigation({ name: selectedLocation.name, coordinates: selectedLocation.coordinates })}
                className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/30"
              >
                <span>Navigate</span>
                <span>🧭</span>
              </button>

              {selectedLocation.floors && (
                <button
                  type="button"
                  onClick={() => {
                    setCurrentFloor(2);
                    setIsFloorPlanOpen(true);
                  }}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold border border-cyan-500/30 transition flex items-center justify-center gap-1.5"
                >
                  <span>Floor Plans</span>
                  <span>📐</span>
                </button>
              )}

              {/* If connected to CampusSpace Venue */}
              {selectedVenue && (
                <button
                  type="button"
                  onClick={() => onBookVenue(selectedVenue)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition"
                >
                  BOOK VENUE
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 5. CS Block Floor Plans Modal */}
      {isFloorPlanOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Floor Plan Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
              <div className="flex items-center gap-3">
                <span className="text-xl">📐</span>
                <div>
                  <h3 className="text-base font-bold text-white">CS Department Block • Floor Plans</h3>
                  <p className="text-xs text-slate-400">Interactive blueprint & room navigation</p>
                </div>
              </div>

              {/* Floor Switcher Tabs */}
              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setCurrentFloor(2)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    currentFloor === 2 ? 'bg-cyan-500 text-black' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Level 2 (L2XX)
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentFloor(3)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    currentFloor === 3 ? 'bg-cyan-500 text-black' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Level 3 (L3XX)
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsFloorPlanOpen(false)}
                className="text-slate-400 hover:text-white p-2 text-base font-bold"
              >
                ✕
              </button>
            </div>

            {/* Floor Plan Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {MACE_CS_BLOCK_ROOMS.filter((r) => r.floor === currentFloor).map((room) => {
                  const isSelected = selectedRoom?.id === room.id;
                  return (
                    <div
                      key={room.id}
                      onClick={() => setSelectedRoom(room)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                        isSelected
                          ? 'bg-cyan-950/60 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                          : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-500 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono font-extrabold text-sm text-cyan-300">{room.number}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-semibold uppercase">
                          {room.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 font-semibold truncate">{room.name}</p>
                    </div>
                  );
                })}
              </div>

              {/* Selected Room Details Bar */}
              {selectedRoom && (
                <div className="mt-4 p-4 rounded-2xl bg-slate-950/90 border border-slate-700 flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span className="text-cyan-400 font-mono text-base">{selectedRoom.number}</span>
                      <span>{selectedRoom.name}</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      CS Block • Floor {selectedRoom.floor} • Type: {selectedRoom.type}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const csLoc = MACE_CAMPUS_LOCATIONS.find((l) => l.id === 'cs-block');
                      handleStartNavigation({
                        name: `${selectedRoom.number} • ${selectedRoom.name}`,
                        coordinates: csLoc?.coordinates || MACE_CAMPUS_CENTER,
                        floor: selectedRoom.floor,
                        room: selectedRoom.number
                      });
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg shadow-blue-600/30"
                  >
                    Walk to {selectedRoom.number} 🧭
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
