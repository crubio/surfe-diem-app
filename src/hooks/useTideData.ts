import { useQuery } from '@tanstack/react-query';
import {
  getNearbyTideStations,
  getTideRecent,
  getTidePredictions,
  getTidePredictionsChart,
  toNoaaDate,
} from '@features/tides/api/tide-explorer';
import { calculateCurrentTideState, type TideState } from 'utils/tides';
import { TIDE_STATION_MAX_MILES, DEFAULT_TIMEZONE } from 'utils/constants';
import { QUERY_KEYS, QUERY_CONFIG } from '../config/query-config';

/**
 * Tide data for the spot page and dashboard, backed by the Tide Explorer API
 * (richer than the legacy `/api/v1/tides/*` routes still used directly by
 * spots.tsx — see .docs/forecast-spot-plan.md §2b / §3.F for why).
 */

/**
 * Hook for fetching the nearest Tide Explorer station to a location.
 * Includes distance (miles) + station metadata (state, region, station_type, ...).
 */
export const useNearbyTideStation = (latitude: number | undefined, longitude: number | undefined) => {
  return useQuery({
    queryKey: [QUERY_KEYS.TIDE_EXPLORER_STATION, latitude, longitude],
    queryFn: async () => {
      const { stations } = await getNearbyTideStations({ lat: latitude!, lng: longitude!, limit: 1 });
      return stations[0] ?? null;
    },
    enabled: !!latitude && !!longitude,
    staleTime: QUERY_CONFIG.STALE_TIME.LONG,
    gcTime: QUERY_CONFIG.GC_TIME.LONG,
  });
};

/**
 * Hook for fetching a station's recent 6-minute tide series (observed water
 * level where the station has a sensor, interpolated predictions otherwise).
 */
export const useTideRecent = (stationId: string | undefined) => {
  return useQuery({
    queryKey: [QUERY_KEYS.TIDE_EXPLORER_RECENT, stationId],
    queryFn: () => getTideRecent({ station: stationId! }),
    enabled: !!stationId,
    staleTime: QUERY_CONFIG.STALE_TIME.SHORT,
    gcTime: QUERY_CONFIG.GC_TIME.SHORT,
  });
};

/**
 * Hook for fetching multi-day hi/lo tide predictions for a station.
 * Powers the 5-day forecast cards, the "current tide" inline readout, and the
 * SpotMetricBar tide tile.
 */
export const useTideHiLo = (stationId: string | undefined, timezone: string, days = 5) => {
  return useQuery({
    queryKey: [QUERY_KEYS.TIDE_EXPLORER_HILO, stationId, timezone, days],
    queryFn: () =>
      getTidePredictions({
        station: stationId!,
        begin_date: toNoaaDate(timezone, 0),
        end_date: toNoaaDate(timezone, days),
      }),
    enabled: !!stationId,
    staleTime: QUERY_CONFIG.STALE_TIME.MEDIUM,
    gcTime: QUERY_CONFIG.GC_TIME.MEDIUM,
  });
};

/**
 * Hook for fetching an hourly tide curve for a station (server-interpolated for
 * subordinate/hilo-only stations). Powers the chart tide sparkline.
 */
export const useTideChart = (stationId: string | undefined, timezone: string, days = 3) => {
  return useQuery({
    queryKey: [QUERY_KEYS.TIDE_EXPLORER_CHART, stationId, timezone, days],
    queryFn: () =>
      getTidePredictionsChart({
        station: stationId!,
        begin_date: toNoaaDate(timezone, 0),
        end_date: toNoaaDate(timezone, days),
      }),
    enabled: !!stationId,
    staleTime: QUERY_CONFIG.STALE_TIME.MEDIUM,
    gcTime: QUERY_CONFIG.GC_TIME.MEDIUM,
  });
};

export interface UseTideDataOptions {
  hiLoDays?: number;
  chartDays?: number;
  /** Spot's IANA timezone (e.g. "America/Los_Angeles") — used to read NOAA's
   * station-local prediction timestamps correctly regardless of the viewer's
   * own timezone. See calculateCurrentTideState in utils/tides.ts. */
  timezone?: string;
}

/**
 * Composite hook for the spot page: resolves the nearest tide station, applies
 * the distance guard (§3.F1), and fetches hi/lo + hourly-chart predictions.
 *
 * `tideAvailable` is `undefined` while the station lookup is in flight, and a
 * real boolean once resolved — consumers should treat `undefined` as "loading",
 * not "unavailable".
 */
export const useTideData = (
  latitude: number | undefined,
  longitude: number | undefined,
  options?: UseTideDataOptions
) => {
  const { hiLoDays = 5, chartDays = 3, timezone } = options || {};

  const station = useNearbyTideStation(latitude, longitude);

  const tideAvailable = station.isLoading
    ? undefined
    : !!station.data && station.data.distance <= TIDE_STATION_MAX_MILES;

  const stationId = tideAvailable ? station.data?.station_id : undefined;

  const hiLo = useTideHiLo(stationId, timezone ?? DEFAULT_TIMEZONE, hiLoDays);
  const chart = useTideChart(stationId, timezone ?? DEFAULT_TIMEZONE, chartDays);

  const currentState: TideState | null =
    hiLo.data && hiLo.data.predictions.length > 0
      ? calculateCurrentTideState({ predictions: hiLo.data.predictions }, new Date(), timezone)
      : null;

  return {
    station,
    hiLo,
    chart,
    tideAvailable,
    currentState,
    isLoading: station.isLoading || (tideAvailable === true && (hiLo.isLoading || chart.isLoading)),
  };
};
