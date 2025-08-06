import { useQuery } from '@tanstack/react-query';
import { getCurrentWeather } from '@features/weather/api';
import { QUERY_KEYS, QUERY_CONFIG } from '../config/query-config';

/**
 * Hook for fetching current weather data for a location
 */
export const useCurrentWeather = (latitude: number | undefined, longitude: number | undefined) => {
  return useQuery({
    queryKey: [QUERY_KEYS.CURRENT_WEATHER, latitude, longitude],
    queryFn: () => getCurrentWeather({ lat: latitude!, lng: longitude! }),
    enabled: !!latitude && !!longitude,
    staleTime: QUERY_CONFIG.STALE_TIME.SHORT,
  });
}; 