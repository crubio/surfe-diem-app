/**
 * Tide Explorer API client
 *
 * Richer tide surface than the legacy `/api/v1/tides/*` routes (still used by
 * a couple of other pages — see `./tides.ts`). Tide Explorer gives us:
 *  - nearest-station lookup with distance + rich metadata
 *  - future multi-day hi/lo predictions (up to 1 year)
 *  - future hourly predictions for charting, server-interpolated for
 *    subordinate ("hilo only") stations
 *
 * Docs: https://api.surfe-diem.com/api/v1#tag/Tide-Explorer
 * See .docs/forecast-spot-plan.md §2b / §3.F for the full analysis.
 */
import { DateTime } from 'luxon';
import { axios } from 'lib/axios';
import { API_ROUTES } from 'utils/routing';

// --- Shared shapes ---

export interface TideExplorerStation {
  station_id: string;
  name: string;
  latitude: number;
  longitude: number;
  state: string | null;
  region: string | null;
  timezone: number | null;
  station_type: 'R' | 'S' | null; // R = reference (has observations), S = subordinate (predictions only)
  has_water_level: boolean | null;
}

export interface TideExplorerStationDistance extends TideExplorerStation {
  distance: number; // miles
}

export interface TidePrediction {
  t: string; // "YYYY-MM-DD HH:MM", station-local time (no tz suffix)
  v: string;
  type: 'H' | 'L';
}

export interface TideExtremes {
  king_tide_threshold?: number;
  extreme_minus_threshold?: number;
  units?: string;
  king_tides?: TidePrediction[];
  extreme_minus_tides?: TidePrediction[];
}

export interface TidePredictionsResponse {
  predictions: TidePrediction[];
  extremes?: TideExtremes;
  meta: Record<string, unknown>;
}

export interface TideChartPoint {
  t: string;
  v: string;
}

export interface TidePredictionsChartResponse {
  predictions: TideChartPoint[];
  hilo?: TidePrediction[];
  meta: Record<string, unknown> & { interpolated?: boolean; fallback?: boolean };
}

export interface TideRecentResponse {
  data: TideChartPoint[];
  hilo?: TidePrediction[];
  meta: Record<string, unknown> & { product?: 'water_level' | 'predictions'; interpolated?: boolean; fallback?: boolean };
}

// --- Requests ---

interface NearbyStationsParams {
  lat: number;
  lng: number;
  limit?: number;
}

interface DateRangeParams {
  station: string;
  begin_date: string; // YYYYMMDD
  end_date: string;   // YYYYMMDD
}

/**
 * NOAA YYYYMMDD for `days` from today *in the station/spot's timezone*, for
 * Tide Explorer begin/end params.
 */
export const toNoaaDate = (timezone: string, days = 0): string =>
  DateTime.now().setZone(timezone).plus({ days }).toFormat('yyyyLLdd');

export const getNearbyTideStations = (
  params: NearbyStationsParams
): Promise<{ stations: TideExplorerStationDistance[] }> => {
  return axios
    .get(API_ROUTES.TIDE_EXPLORER_STATIONS_NEARBY, { params })
    .then((response) => response.data);
};

export const getTideToday = (params: { station: string }): Promise<TidePredictionsResponse> => {
  return axios.get(API_ROUTES.TIDE_EXPLORER_TODAY, { params }).then((response) => response.data);
};

export const getTideRecent = (params: { station: string }): Promise<TideRecentResponse> => {
  return axios.get(API_ROUTES.TIDE_EXPLORER_RECENT, { params }).then((response) => response.data);
};

export const getTidePredictions = (params: DateRangeParams): Promise<TidePredictionsResponse> => {
  return axios
    .get(API_ROUTES.TIDE_EXPLORER_PREDICTIONS, { params })
    .then((response) => response.data);
};

export const getTidePredictionsChart = (
  params: DateRangeParams
): Promise<TidePredictionsChartResponse> => {
  return axios
    .get(API_ROUTES.TIDE_EXPLORER_PREDICTIONS_CHART, { params })
    .then((response) => response.data);
};
