import { Coordinates, Venue, RouteStep, NavigationRoute } from '../types';
import { calculateDistanceMeters, calculateWalkingMinutes } from './aiRecommender';

export function generateCampusWalkingRoute(
  start: Coordinates,
  destination: Venue
): NavigationRoute {
  const destCoords = destination.coordinates;

  // Generate 2-3 realistic path waypoints connecting start to destination along campus avenues
  const midLat = (start.lat + destCoords.lat) / 2;
  const midLng = (start.lng + destCoords.lng) / 2;

  // Subtle curvature to simulate campus path grid
  const waypoint1: [number, number] = [
    start.lat + (destCoords.lat - start.lat) * 0.35 + (start.lng > destCoords.lng ? 0.0003 : -0.0003),
    start.lng + (destCoords.lng - start.lng) * 0.25
  ];

  const waypoint2: [number, number] = [
    midLat,
    midLng + 0.0004
  ];

  const waypoint3: [number, number] = [
    start.lat + (destCoords.lat - start.lat) * 0.75,
    destCoords.lng - 0.0002
  ];

  const waypoints: [number, number][] = [
    [start.lat, start.lng],
    waypoint1,
    waypoint2,
    waypoint3,
    [destCoords.lat, destCoords.lng]
  ];

  // Calculate cumulative distance
  let totalDistanceMeters = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    totalDistanceMeters += calculateDistanceMeters(
      { lat: waypoints[i][0], lng: waypoints[i][1] },
      { lat: waypoints[i + 1][0], lng: waypoints[i + 1][1] }
    );
  }

  // Slightly round distance
  totalDistanceMeters = Math.max(80, Math.round(totalDistanceMeters * 1.15));
  const totalWalkingMinutes = calculateWalkingMinutes(totalDistanceMeters);

  const steps: RouteStep[] = [
    {
      instruction: `Head straight along Central Campus Boulevard towards ${destination.building}`,
      distanceMeters: Math.round(totalDistanceMeters * 0.35),
      durationMinutes: Math.max(1, Math.round(totalWalkingMinutes * 0.35)),
      icon: 'straight'
    },
    {
      instruction: `Turn towards the shaded pedestrian walkway past the Central Library plaza`,
      distanceMeters: Math.round(totalDistanceMeters * 0.4),
      durationMinutes: Math.max(1, Math.round(totalWalkingMinutes * 0.4)),
      icon: 'turn-right'
    },
    {
      instruction: `Enter ${destination.building} main portico and proceed to ${destination.floor}`,
      distanceMeters: Math.round(totalDistanceMeters * 0.25),
      durationMinutes: Math.max(1, Math.round(totalWalkingMinutes * 0.25)),
      icon: 'enter'
    }
  ];

  return {
    destination,
    totalDistanceMeters,
    totalWalkingMinutes,
    waypoints,
    steps
  };
}
