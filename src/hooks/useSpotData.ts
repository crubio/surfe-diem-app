import { useQuery } from '@tanstack/react-query';
import { getSurfSpot, getSurfSpotBySlug, getSurfSpots, getSurfSpotClosest } from '@features/locations/api/locations';
import { QUERY_KEYS, QUERY_CONFIG } from '../config/query-config';

/**
 * Hook for fetching a single spot by ID or slug
 */
export const useSpotData = (spotId: string | undefined, isSlug = false) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SPOTS, spotId, isSlug],
    queryFn: () => isSlug ? getSurfSpotBySlug(spotId!) : getSurfSpot(spotId!),
    enabled: !!spotId,
  });
};

/**
 * Hook for fetching all surf spots
 */
export const useSurfSpots = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.SURF_SPOTS],
    queryFn: () => getSurfSpots(),
  });
};

/**
 * Hook for fetching closest spots to a location
 */
export const useClosestSpots = (latitude: number | undefined, longitude: number | undefined) => {
  return useQuery({
    queryKey: [QUERY_KEYS.CLOSEST_SPOTS, latitude, longitude],
    queryFn: () => getSurfSpotClosest(latitude!, longitude!),
    enabled: !!latitude && !!longitude,
    staleTime: QUERY_CONFIG.STALE_TIME.SHORT,
  });
};

/**
 * Hook for fetching spot data with automatic slug/ID detection
 */
export const useSpotDataAuto = (spotId: string | undefined) => {
  const isSlug = spotId ? isNaN(Number(spotId)) : false;
  return useSpotData(spotId, isSlug);
}; 