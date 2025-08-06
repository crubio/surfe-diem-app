import { useQuery } from '@tanstack/react-query';
import { getClostestTideStation, getDailyTides, getCurrentTides } from '@features/tides/api/tides';
import { QUERY_KEYS, QUERY_CONFIG } from '../config/query-config';

/**
 * Hook for fetching the closest tide station to a location
 */
export const useClosestTideStation = (latitude: number | undefined, longitude: number | undefined) => {
  return useQuery({
    queryKey: [QUERY_KEYS.TIDE_STATION, latitude, longitude],
    queryFn: () => getClostestTideStation({ lat: latitude!, lng: longitude! }),
    enabled: !!latitude && !!longitude,
  });
};

/**
 * Hook for fetching daily tide data for a station
 */
export const useDailyTides = (stationId: string | undefined) => {
  return useQuery({
    queryKey: [QUERY_KEYS.DAILY_TIDES, stationId],
    queryFn: () => getDailyTides({ station: stationId! }),
    enabled: !!stationId,
  });
};

/**
 * Hook for fetching current tide data for a station
 */
export const useCurrentTides = (stationId: string | undefined) => {
  return useQuery({
    queryKey: [QUERY_KEYS.CURRENT_TIDES, stationId],
    queryFn: () => getCurrentTides({ station: stationId! }),
    enabled: !!stationId,
    staleTime: QUERY_CONFIG.STALE_TIME.SHORT,
    gcTime: QUERY_CONFIG.GC_TIME.SHORT,
  });
};

/**
 * Hook for fetching all tide data for a location (station + tides)
 */
export const useTideData = (latitude: number | undefined, longitude: number | undefined) => {
  const station = useClosestTideStation(latitude, longitude);
  const dailyTides = useDailyTides(station.data?.station_id);
  const currentTides = useCurrentTides(station.data?.station_id);

  return {
    station,
    dailyTides,
    currentTides,
    isLoading: station.isPending || dailyTides.isPending || currentTides.isPending,
    isError: station.isError || dailyTides.isError || currentTides.isError,
  };
}; 