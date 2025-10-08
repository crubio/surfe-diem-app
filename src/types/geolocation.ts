export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface LocationData {
  coordinates: GeolocationCoordinates
  address: Record<string, string> | string; // Formatted address components
  city?: string;
  region?: string;
  country?: string;
  postalCode?: string | undefined;
  timestamp: string | undefined; // ISO string
}

export type LocationSource = 'auto' | 'manual' | 'fallback';

export interface UserLocation {
  location: LocationData | undefined;
  source: LocationSource | undefined;
  isLoading: boolean | undefined;
  error: string | undefined;
  hasPermission: boolean | undefined
  lastUpdated: string | undefined; // ISO string
}

export interface LocationStore extends UserLocation {
  // Actions
  setLocation: (location: LocationData, source: LocationSource) => void;
  requestGeolocation: () => Promise<void>;
  setManualLocation: (coordinates: GeolocationCoordinates, address?: string) => void;
  clearLocation: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | undefined) => void;
  setPermission: (hasPermission: boolean) => void;
}

export type LocationInput = {
  query: string; // e.g., "Santa Cruz, CA"
  coordinates?: GeolocationCoordinates; // Result after geocoding
}