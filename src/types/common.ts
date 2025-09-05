/**
 * Common utility types and shared interfaces
 */

/**
 * Query parameters for location searches
 */
export type LocationQueryParams = {
  search?: string;
  limit?: number;
};

/**
 * Search query parameters
 */
export type SearchQueryParams = {
  q: string;
  limit?: number;
};

/**
 * Buoy nearest type for search results
 */
export type BuoyNearestType = {
  description: string;
  distance: string;
  latitude: string;
  location: string;
  location_id: string;
  longitude: string;
  name: string;
  url: string;
  latest_observation?: any; // TODO: Replace with proper typing
};

/**
 * Buoy location summary props
 */
export type BuoyLocationSummaryProps = {
  location_id: string;
  name: string;
  url: string;
  description: string;
  depth: string;
  elevation: string;
  location: string;
  date_updated: string;
};

/**
 * Buoy location latest observation
 */
export interface BuoyLocationLatestObservation {
  wave_height?: string;
  peak_period?: string;
  water_temp?: string;
  atmospheric_pressure?: string;
  air_temp?: string;
  dew_point?: string;
  swell_height?: string;
  period?: string;
  direction?: string;
  wind_wave_height?: string;
}

/**
 * Buoy location latest observations
 */
export interface BuoyLocationLatestObservations {
  latest_observations: BuoyLocationLatestObservation[];
}

/**
 * Buoy locations container
 */
export interface BuoyLocations {
  locations: any[]; // TODO: Replace with proper typing
}

/**
 * Buoy location interface
 */
export interface BuoyLocation {
  name: string;
  url: string;
  active: boolean;
  description?: string;
  depth?: string;
  elevation?: string;
  location?: string;
  location_id: string;
  id: number;
  date_created: string;
  date_updated: string;
  station_id?: string;
}
