import { Venue, AIRecommendationRequest, AIRecommendationResult, FacilityItem, Coordinates } from '../types';

export function calculateDistanceMeters(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371e3;
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
    let capacityScore = 0;
    if (venue.capacity < request.attendance) {
      // Cannot hold expected attendees
      const deficitRatio = venue.capacity / request.attendance;
      capacityScore = Math.max(10, Math.round(deficitRatio * 40));
    } else {
      const ratio = request.attendance / venue.capacity;
      if (ratio >= 0.65 && ratio <= 0.95) {
        capacityScore = 100; // Optimal room sizing
      } else if (ratio > 0.95) {
        capacityScore = 88; // Close to max capacity
      } else if (ratio >= 0.35) {
        capacityScore = Math.round(75 + ratio * 25);
      } else {
        // Vastly oversized space
        capacityScore = Math.max(35, Math.round(ratio * 160));
      }
    }

    // 2. Facility Match Score (0 to 100)
    const matchedFacilities = request.requiredFacilities.filter((rf) =>
      venue.facilities.includes(rf)
    );
    const missingFacilities = request.requiredFacilities.filter(
      (rf) => !venue.facilities.includes(rf)
    );

    let facilityScore = 100;
    if (request.requiredFacilities.length > 0) {
      facilityScore = Math.round(
        (matchedFacilities.length / request.requiredFacilities.length) * 100
      );
    }

    // 3. Availability Score (0 to 100)
    let availabilityScore = venue.status === 'available' ? 100 : 25;
    if (venue.availableTimeSlots && venue.availableTimeSlots.length > 0) {
      const matchSlot = venue.availableTimeSlots.find((s) => {
        return s.startTime <= request.startTime && s.endTime >= request.endTime;
      });
      if (matchSlot) {
        availabilityScore = matchSlot.isAvailable ? 100 : 20;
      }
    }

    // 4. Proximity Score (0 to 100)
    const proximityScore = Math.max(50, Math.round(100 - (distanceMeters / 1000) * 40));

    // 5. Historical Suitability (0 to 100)
    const historicalScore = venue.historicalSuitability[request.eventType] || 75;

    // Weighted Overall Match Score
    const matchScore = Math.min(
      99,
      Math.max(
        25,
        Math.round(
          capacityScore * 0.35 +
          facilityScore * 0.30 +
          availabilityScore * 0.20 +
          historicalScore * 0.10 +
          proximityScore * 0.05
        )
      )
    );

    // Natural Language Explanation
    const facilityNames = matchedFacilities.slice(0, 3).join(' & ');
    const facilityMention = facilityNames ? `${facilityNames} requirements` : 'all required equipment';
    const capacityText = venue.capacity >= request.attendance
      ? `Matches your ${request.attendance}-person capacity (${venue.capacity} max)`
      : `Constrained for ${request.attendance} attendees (${venue.capacity} cap)`;

    const whyRecommended = `${capacityText}, satisfies ${facilityMention}, and is available on ${request.date} at ${request.startTime}.`;

    const detailedReasons: string[] = [
      `Capacity Sizing: ${venue.capacity} seats accommodating your ${request.attendance} attendees without space waste.`,
      `Facility Match: Equipped with ${matchedFacilities.length} of ${request.requiredFacilities.length || 'all'} requested facilities (${matchedFacilities.join(', ') || 'Standard amenities'}).`,
      `Campus Proximity: Located in ${venue.building}, approx ${distanceMeters}m walk (~${walkingMinutes} min) from central hub.`,
      `Event Fit: Rated ${historicalScore}% historical success for ${request.eventType} events on campus.`
    ];

    if (missingFacilities.length > 0) {
      detailedReasons.push(`Note: Missing ${missingFacilities.join(', ')} (portable AV booking required).`);
    }

    return {
      venue,
      matchScore,
      rank: 0,
      capacityScore,
      facilityScore,
      availabilityScore,
      proximityScore,
      historicalScore,
      whyRecommended,
      detailedReasons,
      matchedFacilities,
      missingFacilities,
      distanceMeters,
      walkingMinutes
    };
  });

  // Sort descending by matchScore
  results.sort((a, b) => b.matchScore - a.matchScore);

  // Assign ranks
  results.forEach((r, idx) => {
    r.rank = idx + 1;
  });

  return results;
}
