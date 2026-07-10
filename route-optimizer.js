class RouteOptimizer {
  /**
   * Calculates geodesic distance in miles rounded to 2 decimal places using the Haversine formula.
   */
  static haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 3958.8; // Earth's radius in miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return Math.round(distance * 100) / 100;
  }

  /**
   * Calculates dynamic travel duration in minutes.
   */
  static calculateETA(distanceMiles, trafficMultiplier) {
    return Math.max(1, Math.round((distanceMiles / 30) * 60 * trafficMultiplier));
  }

  /**
   * Animates a technician marker along a route using requestAnimationFrame.
   */
  static animateMarker(marker, routePolyline, startCoords, endCoords, durationMs) {
    if (typeof window !== 'undefined') {
      if (window.activeRouteAnimationId) {
        cancelAnimationFrame(window.activeRouteAnimationId);
      }

      const startTime = performance.now();

      const step = timestamp => {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / durationMs, 1);

        const lat = startCoords[0] + (endCoords[0] - startCoords[0]) * progress;
        const lng = startCoords[1] + (endCoords[1] - startCoords[1]) * progress;

        if (marker && typeof marker.setLatLng === 'function') {
          marker.setLatLng([lat, lng]);
        }

        if (progress < 1) {
          window.activeRouteAnimationId = requestAnimationFrame(step);
        } else {
          window.activeRouteAnimationId = undefined;
        }
      };

      window.activeRouteAnimationId = requestAnimationFrame(step);
    }
  }
}

if (typeof window !== 'undefined') {
  window.RouteOptimizer = RouteOptimizer;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RouteOptimizer;
}
