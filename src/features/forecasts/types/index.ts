// This matches the actual API response structure
export interface ForecastDataHourlyResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  hourly_units: {
    time: string;
    swell_wave_height: string;
    swell_wave_direction: string;
    swell_wave_period: string;
    wave_height: string;
    wave_direction: string;
    wave_period: string;
  };
  hourly: {
    time: string[];
    swell_wave_height: number[];
    swell_wave_direction: number[];
    swell_wave_period: number[];
    wave_height: number[];
    wave_direction: number[];
    wave_period: number[];
  };
  current_units?: {
    [key: string]: string;
  };
  current?: {
    time: string;
    interval: number;
    swell_wave_height: number;
    swell_wave_direction: number;
    swell_wave_period: number;
    wind_wave_height: number;
    wind_wave_direction: number;
    wind_wave_period: number;
    sea_surface_temperature: number;
  };
}

// This is a normalized/flattened version for easier consumption
export interface ForecastDataHourly {
  time: string;
  wave_height: number;
  wave_direction: number;
  wave_period: number;
}

// Keep your existing types
export interface ForecastDataDaily {
  daily: {
    time: string[];
    wave_height_max: number[];
    swell_wave_height_max: number[];
    wave_direction_dominant?: number[];
    swell_wave_direction_dominant: number[];
    wave_period_max?: number[];
    swell_wave_period_max: number[];
  };
}

export interface ForecastDataCurrent {
  current: {
    time: string;
    interval: number;
    swell_wave_height: number;
    swell_wave_direction: number;
    swell_wave_period: number;
    wind_wave_height: number;
    wind_wave_direction: number;
    wind_wave_period: number;
    sea_surface_temperature: number;
  };
  current_units: {
    [key: string]: string;
  };
}

export interface NWSForecastParams {
  spot_id?: number;
  spot_slug?: string;
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
  wave_data: NWSWaveData;
  source: "nws" | "cache";  // Literal union type
  updated_at: string;  // ISO 8601 datetime
  timezone: string;  // e.g., "America/Los_Angeles"
  units: NWSUnits;
  cached_at: string | null;
  expires_at: string | null;
}
