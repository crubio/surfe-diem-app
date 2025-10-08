export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface LocationData {
  coordinates: GeolocationCoordinates
  address: string;
  city?: string;
  region?: string;
  country?: string;
  postalCode?: string;
  timestamp: string; // ISO string
}

export type LocationSource = 'auto' | 'manual' | 'fallback';

export interface UserLocation {
  location: LocationData | null;
  source: LocationSource | null;
  isLoading: boolean;
  error: string | null;
  hasPermission: boolean
  lastUpdated: string | null; // ISO string
}

export interface LocationStore extends UserLocation {
  // Actions
  setLocation: (location: LocationData, source: LocationSource) => void;
  requestGeolocation: () => Promise<void>;
  setManualLocation: (coordinates: GeolocationCoordinates, address?: string) => void;
  clearLocation: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPermission: (hasPermission: boolean) => void;
}

export type LocationInput = {
  query: string; // e.g., "Santa Cruz, CA"
  coordinates?: GeolocationCoordinates; // Result after geocoding
}