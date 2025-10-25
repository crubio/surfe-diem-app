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
