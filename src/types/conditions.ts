/**
 * Types for GET /api/v1/conditions and POST /api/v1/batch-conditions.
 *
 * All metric (meters/seconds/km-h/degrees) — the API deliberately does no
 * imperial conversion; that stays the frontend's job, same as elsewhere.
 */
export interface CurrentConditions {
  timestamp: string;
  primary_swell_height: number | null; // meters
  primary_swell_period: number | null; // seconds
  primary_swell_direction: number | null; // degrees
  secondary_swell_height: number | null;
  secondary_swell_period: number | null;
  secondary_swell_period_is_estimated: boolean | null;
  secondary_swell_direction: number | null;

  wind_wave_height: number | null;
  wind_wave_period: number | null;
  wind_wave_period_is_estimated: boolean | null;
  wind_wave_direction: number | null;

  water_temperature: number | null; // °C, buoy-only

  // Buoy-observed bulk wave reading (NDBC WVHT/DPD/MWD) — additive, not a
  // replacement for primary_swell_*/wind_wave_* above. Combined swell+wind-wave
  // energy at the buoy's own location, not the spot-specific NWS split.
  buoy_wave_height: number | null;
  buoy_wave_period: number | null;
  buoy_wave_direction: number | null;

  // Buoy-observed swell-vs-wind-wave SPLIT (NDBC .spec) — a real observation,
  // not estimated. Not every buoy publishes .spec (met-only stations don't).
  buoy_swell_height: number | null;
  buoy_swell_period: number | null;
  buoy_swell_direction: number | null;
  buoy_swell_compass_direction: string | null; // e.g. "SSE"
  buoy_wind_wave_height: number | null;
  buoy_wind_wave_period: number | null;
  buoy_wind_wave_direction: number | null;
  buoy_wind_wave_compass_direction: string | null;
  buoy_steepness: string | null; // NDBC's own category, e.g. "SWELL"/"AVERAGE"/"STEEP"

  // Wind — nearest reporting buoy first, NWS gridpoint second.
  wind_speed: number | null; // km/h
  wind_direction: number | null;
  wind_gust: number | null;
  wind_source: 'buoy' | 'nws' | null;

  twenty_foot_wind_speed: number | null;
  twenty_foot_wind_direction: number | null;

  // Derived
  swell_power: number | null; // primary swell only
  total_power: number | null; // primary + secondary + wind wave
}

export interface BatchConditionsResult {
  spot_id: number;
  conditions: CurrentConditions | null;
}

export interface BatchConditionsError {
  spot_id: number;
  error: string;
}

export interface BatchConditionsResponse {
  results: BatchConditionsResult[];
  errors: BatchConditionsError[];
}
