import { Venue, AIRecommendationRequest, AIRecommendationResult, Coordinates } from '../types';

export function calculateDistanceMeters(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371e3; // metres
  const φ1 = (coord1.lat * Math.PI) / 180;
  const φ2 = (coord2.lat * Math.PI) / 180;
  const Δφ = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const Δλ = ((coord2.lng - coord1.lng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export function calculateWalkingMinutes(meters: number): number {
  // Average campus walking speed ~ 80 meters per minute (4.8 km/h)
  return Math.max(1, Math.round(meters / 80));
}

export function rankVenues(
  venues: Venue[],
  request: AIRecommendationRequest
): AIRecommendationResult[] {
  const userLoc = request.userLocation || { lat: 19.1334, lng: 72.9133 };

  const results: AIRecommendationResult[] = venues.map((venue) => {
    const distanceMeters = calculateDistanceMeters(userLoc, venue.coordinates);
    const walkingMinutes = calculateWalkingMinutes(distanceMeters);

    // 1. Capacity Fit Score (0 to 100)
    // Ideal ratio: requested attendance is 70% - 95% of venue capacity
    let capacityScore = 0;
    if (venue.capacity < request.attendance) {
      // Overcrowding penalty: impossible or severely constrained
      const deficitRatio = venue.capacity / request.attendance;
      capacityScore = Math.max(0, Math.round(deficitRatio * 35));
    } else {
      const utilizationRatio = request.attendance / venue.capacity;
      if (utilizationRatio >= 0.7 && utilizationRatio <= 0.95) {
        capacityScore = 100; // Perfect fit
      } else if (utilizationRatio > 0.95) {
        capacityScore = 90; // Near max limit
      } else if (utilizationRatio >= 0.4) {
        // Reasonable buffer
        capacityScore = Math.round(75 + utilizationRatio * 20);
      } else {
        // Excessive empty seats (e.g. 15 people in an 850 person auditorium)
        capacityScore = Math.max(30, Math.round(utilizationRatio * 150));
      }
    }

    // 2. Facility Match Score (0 to 100)
    let facilityScore = 100;
    const missingFacilities: string[] = [];
    if (request.requiredFacilities.length > 0) {
      const matched = request.requiredFacilities.filter((rf) =>
        venue.facilities.includes(rf)
      );
      facilityScore = Math.round((matched.length / request.requiredFacilities.length) * 100);
      request.requiredFacilities.forEach((rf) => {
        if (!venue.facilities.includes(rf)) {
          missingFacilities.push(rf);
        }
      });
    }

    // 3. Availability Score (0 or 100)
    let availabilityScore = 100;
    if (venue.status === 'booked') {
      availabilityScore = 20; // severely penalized
    } else if (venue.status === 'pending') {
      availabilityScore = 65;
    } else if (venue.status === 'maintenance') {
      availabilityScore = 0;
    }

    // 4. Proximity Score (0 to 100) - optimal within 500m
    const proximityScore = Math.max(
      40,
      Math.min(100, Math.round(100 - (distanceMeters / 1000) * 50))
    );

    // 5. Historical Suitability for Event Type (0 to 100)
    const historicalScore = venue.historicalSuitability[request.eventType] || 75;

    // 6. Reliability / Low Cancellation Score (0 to 100)
    const reliabilityScore = Math.max(50, Math.round(100 - venue.cancellationRate * 5));

    // 7. Demand Optimization Score (0 to 100)
    const demandScore = Math.round(100 - (venue.historicalAverageOccupancy - 50) * 0.5);

    // Weighted Overall Score
    // Capacity (25%), Facilities (25%), Availability (20%), Historical (15%), Proximity (10%), Reliability (5%)
    let weightedScore =
      capacityScore * 0.25 +
      facilityScore * 0.25 +
      availabilityScore * 0.20 +
      historicalScore * 0.15 +
      proximityScore * 0.10 +
      reliabilityScore * 0.05;

    // Hard penalty if venue cannot accommodate attendance
    if (venue.capacity < request.attendance) {
      weightedScore = Math.min(weightedScore, 54);
    }

    // Hard penalty if booked during requested slot
    if (venue.status === 'booked') {
      weightedScore = Math.min(weightedScore, 48);
    }

    const finalMatchScore = Math.max(15, Math.min(99, Math.round(weightedScore)));

    // Explainable AI points
    const whyRecommended: string[] = [];
    const highlights: string[] = [];
    const warnings: string[] = [];

    if (venue.capacity >= request.attendance && request.attendance >= venue.capacity * 0.5) {
      whyRecommended.push(`Capacity fits your event (${request.attendance} attendees in ${venue.capacity}-seat hall)`);
    } else if (venue.capacity < request.attendance) {
      warnings.push(`Venue capacity (${venue.capacity}) is below requested attendance (${request.attendance})`);
    } else {
      whyRecommended.push(`Ample space available for breakout areas and staging`);
    }

    if (missingFacilities.length === 0 && request.requiredFacilities.length > 0) {
      whyRecommended.push('All required facilities are present and verified in venue specs');
    } else if (missingFacilities.length > 0) {
      warnings.push(`Missing requested facilities: ${missingFacilities.join(', ')}`);
    }

    if (venue.status === 'available') {
      whyRecommended.push('Venue is immediately available during your requested time window');
    } else {
      warnings.push(`Venue currently marked as '${venue.status}'`);
    }

    if (historicalScore >= 85) {
      whyRecommended.push(`Past ${request.eventType} organizers rated this venue ${historicalScore}% suitable`);
    }

    if (venue.cancellationRate <= 3.0) {
      whyRecommended.push(`Consistently low cancellation rate (${venue.cancellationRate}%)`);
    }

    if (distanceMeters <= 500) {
      whyRecommended.push(`Short walking distance (${distanceMeters}m, ~${walkingMinutes} min walk)`);
    } else {
      whyRecommended.push(`Located ${distanceMeters}m from current reference point (~${walkingMinutes} min walk)`);
    }

    if (venue.wheelchairAccessible) {
      whyRecommended.push('Full wheelchair ramps and ground/elevator accessibility');
    }

    whyRecommended.push(`Energy efficiency certified (Rating ${venue.energyRating})`);

    // Key Highlights for Cards
    highlights.push(`Capacity: ${venue.capacity} (Req: ${request.attendance})`);
    highlights.push(`Distance: ${distanceMeters} m (${walkingMinutes} min walk)`);
    highlights.push(`Historical Match: ${historicalScore}%`);

    return {
      venue,
      matchScore: finalMatchScore,
      rank: 0,
      capacityScore,
      facilityScore,
      availabilityScore,
      proximityScore,
      historicalScore,
      reliabilityScore,
      demandScore,
      distanceMeters,
      walkingMinutes,
      whyRecommended,
      highlights,
      warnings
    };
  });

  // Sort descending by match score
  results.sort((a, b) => b.matchScore - a.matchScore);

  // Assign ranks
  results.forEach((res, index) => {
    res.rank = index + 1;
  });

  return results;
}
