export interface Spot {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  active: boolean;
  subregion_name: string;
  timezone: string;
}

export type LocationQueryParams = {
  search?: string,
  limit?: number
}

export type SearchQueryParams = {
  q: string,
  limit?: number
}

export interface BuoyLocation {
  name: string,
  url: string,
  active: boolean,
  description?: string,
  depth?: string,
  elevation?: string,
  location?: string,
  location_id: string,
  id: number,
  date_created: string,
  date_updated: string,
  station_id?: string,
}

export interface BuoyLocations {
  locations: Location[]
}

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

export interface BuoyLocationLatestObservation {
  wave_height?: string
  peak_period?: string
  water_temp?: string
  atmospheric_pressure?: string
  air_temp?: string
  dew_point?: string
  swell_height?: string
  period?: string
  direction?: string
  wind_wave_height?: string
}

export interface BuoyLocationLatestObservations {
  latest_observations: BuoyLatestObservation[]
}
