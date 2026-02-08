import { useQuery } from '@tanstack/react-query';
import { getNWSForecast } from '@features/forecasts';
import { QUERY_KEYS } from '../config/query-config';
import {
  buildCurrentForecast,
  groupNWSDataByHour,
  type ParsedNWSCurrent,
} from '../utils/nws-parser';
import type { NWSForecastResponse } from '@/types';

/**
 * Transformed NWS forecast data ready for UI consumption
 */
export interface TransformedNWSForecast {
  current: ParsedNWSCurrent | null;
  hourly: Array<{ hour: number; validTime: string | null; value: number | null }>;
  raw: NWSForecastResponse;
}

/**
 * Hook for fetching and transforming NWS forecast data
 *
 * @param spotId - Spot ID to fetch forecast for
 * @param options - Optional configuration
 * @returns Query object with transformed NWS data
 *
 * @example
 * const { data, isLoading, error } = useNWSForecast(123);
 * if (data) {
 *   console.log(data.current.swell_wave_height); // In feet
 * }
 */
export const useNWSForecast = (
  spotId: number | undefined,
  options?: {
    enabled?: boolean;
    hourlyForecastHours?: number;
  }
) => {
  const { enabled = true, hourlyForecastHours = 168 } = options || {};

  return useQuery({
    queryKey: [QUERY_KEYS.FORECAST_CURRENT, 'nws', spotId],
    queryFn: async () => {
      if (!spotId) throw new Error('spotId is required');

      const response = await getNWSForecast({ spot_id: spotId });

      // Check if response is successful
      if (!response.data) {
        throw new Error('Failed to fetch NWS forecast');
      }

      const nwsData = response.data;

      // Transform raw NWS data to UI format
      const current = buildCurrentForecast(nwsData.wave_data, nwsData.timezone);
      const hourly = groupNWSDataByHour(
        nwsData.wave_data.wave_height || [],
        nwsData.timezone,
        hourlyForecastHours
      );

      return {
        current,
        hourly,
        raw: nwsData,
      } as TransformedNWSForecast;
    },
    enabled: !!spotId && enabled,
  });
};

/**
 * Hook for fetching NWS forecast by spot slug
 *
 * @param spotSlug - Spot slug to fetch forecast for
 * @param options - Optional configuration
 * @returns Query object with transformed NWS data
 *
 * @example
 * const { data, isLoading, error } = useNWSForecastBySlug("steamer-lane");
 */
export const useNWSForecastBySlug = (
  spotSlug: string | undefined,
  options?: {
    enabled?: boolean;
    hourlyForecastHours?: number;
  }
) => {
  const { enabled = true, hourlyForecastHours = 168 } = options || {};

  return useQuery({
    queryKey: [QUERY_KEYS.FORECAST_CURRENT, 'nws', spotSlug],
    queryFn: async () => {
      if (!spotSlug) throw new Error('spotSlug is required');

      const response = await getNWSForecast({ spot_slug: spotSlug });

      if (!response.data) {
        throw new Error('Failed to fetch NWS forecast');
      }

      const nwsData = response.data;

      const current = buildCurrentForecast(nwsData.wave_data, nwsData.timezone);
      const hourly = groupNWSDataByHour(
        nwsData.wave_data.wave_height || [],
        nwsData.timezone,
        hourlyForecastHours
      );

      return {
        current,
        hourly,
        raw: nwsData,
      } as TransformedNWSForecast;
    },
    enabled: !!spotSlug && enabled,
  });
};
