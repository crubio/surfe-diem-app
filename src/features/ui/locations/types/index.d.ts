export interface Location {
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
  date_updated: string
}

export interface Locations {
  locations: Location[]
}

export type LocationSummaryProps = {
  location_id: string;
  name: string;
  url: string;
  description: string;
  depth: string;
  elevation: string;
  location: string;
  date_updated: string;
};

export interface LocationLatestObservation {
  id: number,
  location_id: string,
  date_created: string,
  timestamp: string,
  title?: string,
  href?: string,
  published?: string,
  wind_speed?: string,
  dominant_wave_period?: string,
  dew_point?: string,
  water_temp?: string,
  mean_wave_direction?: string,
  wind_gust?: string,
  average_period?: string,
  location?: string,
  wind_direction?: string,
  air_temp?: string,
  atmospheric_pressure?: string,
  significant_wave_height?: string,
  dominant_wave_period?: string,
}

export interface LocationLatestObservations {
  latest_observations: LatestObservation[]
}
