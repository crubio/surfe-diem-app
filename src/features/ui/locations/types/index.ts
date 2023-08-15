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

export type LatestObservation = {
  location_id: string,
  timestamp: string,
  title: string,
  href: string,
  published: string,
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
  significant_wave_height?: string
}