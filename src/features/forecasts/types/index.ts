export interface NWSForecastParams {
  spot_id?: number;
  spot_slug?: string;
  /** Also return wave-height-only grids (no swell breakdown); see swell_coverage */
  include_partial?: boolean;
}

// Individual data point in NWS time series
export interface NWSDataPoint {
  validTime: string;  // ISO 8601 time interval: "<start-time>/<duration>" (e.g., "2025-11-03T15:00:00+00:00/PT21H")
                       // Duration format: P = period, T = time separator, followed by duration units
                       // PT21H = 21 hours, P1D = 1 day, P1DT6H = 1 day + 6 hours
  value: number | null;  // Measurement value, null if no data available
}

// Complete wave data structure from NWS API
export interface NWSWaveData {
  wave_height: NWSDataPoint[];
  wave_period: NWSDataPoint[];
  wave_direction: NWSDataPoint[];  // Can be empty array
  primary_swell_height: NWSDataPoint[];
  primary_swell_direction: NWSDataPoint[];
  primary_swell_period: NWSDataPoint[];
  secondary_swell_height: NWSDataPoint[];
  secondary_swell_direction: NWSDataPoint[];
  wind_wave_height: NWSDataPoint[];
}

// Units returned by the API
export interface NWSUnits {
  wave_height: string;  // e.g., "meters"
  wave_period: string;  // e.g., "seconds"
  swell_direction: string;  // e.g., "degrees"
}

export interface NWSForecastResponse {
  spot_id: number;
  latitude: number;
  longitude: number;
  grid_id: string;
  grid_x: number;
  grid_y: number;
  wave_data: NWSWaveData | null;
  source: "nws" | "cache";  // Literal union type
  updated_at: string;  // ISO 8601 datetime
  timezone: string;  // e.g., "America/Los_Angeles"
  units: NWSUnits;
  cached_at: string | null;
  expires_at: string | null;
  ndbc_fallback_station?: string | null;
  /** "wave_height_only": swell series are empty, only wave_height + wind (needs include_partial) */
  swell_coverage?: 'full' | 'wave_height_only' | null;
}

// ========================================
// ML FORECAST TYPES (surfe-diem model)
// ========================================

export interface MLForecastParams {
  spot_id: number;
}

export interface MLForecastItem {
  horizon_hours: number;
  valid_time: string;
  value_m: number;
  value_ft: number;
  dominant_period_s?: number;
  ground_swell_direction_deg?: number;
  ground_swell_direction_confidence?: number;
}

export interface MLObservedWaveHeight {
  observed_time: string;
  value_m: number;
  value_ft: number;
}

export interface MLForecastResponse {
  station_id: string;
  spot_id?: number;
  latitude?: number;
  longitude?: number;
  observed_wave_height: MLObservedWaveHeight;
  forecast: MLForecastItem[];
  source: string;
  units: {
    wave_height: string;
    wave_height_imperial: string;
    dominant_period?: string;
    swell_direction?: string;
  };
}
