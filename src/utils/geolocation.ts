import { TransitStation } from '../types';

export interface UserCoordinates {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp?: number;
}

export interface NearestStationResult {
  station: TransitStation;
  distanceMeters: number;
  distanceFormatted: string;
}

/**
 * Standard WGS84 GPS Coordinates for Singapore MRT Stations
 */
export const STATION_GPS_COORDINATES: Record<string, { lat: number; lng: number }> = {
  jurong_east: { lat: 1.33315, lng: 103.74229 },
  choa_chu_kang: { lat: 1.38536, lng: 103.74437 },
  woodlands: { lat: 1.43606, lng: 103.78655 },
  yishun: { lat: 1.42944, lng: 103.83500 },
  ang_mo_kio: { lat: 1.36993, lng: 103.84956 },
  bishan: { lat: 1.35084, lng: 103.84814 },
  newton: { lat: 1.31232, lng: 103.83798 },
  orchard: { lat: 1.30398, lng: 103.83179 },
  dhoby_ghaut: { lat: 1.29870, lng: 103.84594 },
  city_hall: { lat: 1.29299, lng: 103.85208 },
  raffles_place: { lat: 1.28302, lng: 103.85132 },
  marina_bay: { lat: 1.27643, lng: 103.85460 },
  marina_south_pier: { lat: 1.26600, lng: 103.86310 },
  tuas_link: { lat: 1.31948, lng: 103.63674 },
  boon_lay: { lat: 1.33861, lng: 103.70584 },
  clementi: { lat: 1.31515, lng: 103.76524 },
  buona_vista: { lat: 1.30733, lng: 103.79002 },
  outram_park: { lat: 1.28014, lng: 103.83949 },
  tanjong_pagar: { lat: 1.27652, lng: 103.84580 },
  bugis: { lat: 1.30047, lng: 103.85600 },
  paya_lebar: { lat: 1.31811, lng: 103.89310 },
  bedok: { lat: 1.32400, lng: 103.93003 },
  tampines: { lat: 1.35259, lng: 103.94532 },
  pasir_ris: { lat: 1.37304, lng: 103.94928 },
  expo: { lat: 1.33538, lng: 103.96181 },
  changi_airport: { lat: 1.35732, lng: 103.98853 },
  harbourfront: { lat: 1.26539, lng: 103.82231 },
  chinatown: { lat: 1.28434, lng: 103.84401 },
  little_india: { lat: 1.30681, lng: 103.84920 },
  serangoon: { lat: 1.34983, lng: 103.87373 },
  sengkang: { lat: 1.39165, lng: 103.89549 },
  punggol: { lat: 1.40504, lng: 103.90234 },
  promenade: { lat: 1.29397, lng: 103.86082 },
  bayfront: { lat: 1.28187, lng: 103.85908 },
  stadium: { lat: 1.30282, lng: 103.87534 },
  macpherson: { lat: 1.32615, lng: 103.88986 },
  caldecott: { lat: 1.33777, lng: 103.83955 },
  botanic_gardens: { lat: 1.32242, lng: 103.81534 },
  bukit_panjang: { lat: 1.37894, lng: 103.76182 },
  beauty_world: { lat: 1.34134, lng: 103.77580 },
  stevens: { lat: 1.32001, lng: 103.82602 },
  gardens_by_the_bay: { lat: 1.27902, lng: 103.86728 },
  marine_parade: { lat: 1.30322, lng: 103.90561 },
  bayshore: { lat: 1.31174, lng: 103.93482 },
};

/**
 * Calculates distance in meters using Haversine formula
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Radius of the Earth in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Formats distance into readable meter or kilometer string
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Finds the nearest MRT station to given latitude and longitude coordinates
 */
export function findNearestStation(
  userLat: number,
  userLng: number,
  stations: TransitStation[]
): NearestStationResult | null {
  if (!stations || stations.length === 0) return null;

  let nearestStation = stations[0];
  let minDistance = Infinity;

  for (const station of stations) {
    const coords = STATION_GPS_COORDINATES[station.id] || {
      lat: station.lat || 1.3521,
      lng: station.lng || 103.8198,
    };
    const dist = calculateDistanceMeters(userLat, userLng, coords.lat, coords.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearestStation = station;
    }
  }

  return {
    station: nearestStation,
    distanceMeters: minDistance,
    distanceFormatted: formatDistance(minDistance),
  };
}

/**
 * Directly executes navigator.geolocation.getCurrentPosition
 * Returns a Promise that resolves with UserCoordinates or rejects with friendly error
 */
export function getUserCurrentPosition(
  options?: PositionOptions
): Promise<UserCoordinates> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser or environment.'));
      return;
    }

    const defaultOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 30000,
      ...options,
    };

    // Explicit call to navigator.geolocation.getCurrentPosition
    navigator.geolocation.getCurrentPosition(
      (position: GeolocationPosition) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        });
      },
      (error: GeolocationPositionError) => {
        let message = 'Unable to retrieve your current location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location permission was denied. Please allow location access in your browser.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'GPS location information is currently unavailable.';
            break;
          case error.TIMEOUT:
            message = 'Request to acquire location timed out.';
            break;
        }
        reject(new Error(message));
      },
      defaultOptions
    );
  });
}

/**
 * Projects real GPS coordinates (lat, lng) to the schematic SVG map coordinates (x, y)
 * Uses proximity weighting against the closest stations to achieve smooth, visually aligned positioning
 */
export function projectGpsToMapCoordinates(
  userLat: number,
  userLng: number,
  stations: TransitStation[]
): { x: number; y: number } {
  // Find top 3 nearest stations to compute weighted geometric position
  const distances = stations.map((s) => {
    const coords = STATION_GPS_COORDINATES[s.id] || { lat: s.lat || 1.3521, lng: s.lng || 103.8198 };
    const d = calculateDistanceMeters(userLat, userLng, coords.lat, coords.lng);
    return { station: s, d: Math.max(d, 10) };
  });

  distances.sort((a, b) => a.d - b.d);
  const nearest = distances[0];

  // If very close to a station (< 200m), snap directly to station position
  if (nearest.d < 200) {
    return { x: nearest.station.x, y: nearest.station.y };
  }

  // Otherwise interpolate among top 3 stations with inverse distance weights
  const top3 = distances.slice(0, 3);
  const totalWeight = top3.reduce((sum, item) => sum + 1 / item.d, 0);

  let interpX = 0;
  let interpY = 0;
  for (const item of top3) {
    const w = (1 / item.d) / totalWeight;
    interpX += item.station.x * w;
    interpY += item.station.y * w;
  }

  return {
    x: Math.round(interpX),
    y: Math.round(interpY),
  };
}
