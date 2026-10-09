import { useQuery } from '@tanstack/react-query';
import { getSurfSpot, getSurfSpotBySlug } from '@features/locations/api/locations';
import { QUERY_KEYS } from '../config/query-config';

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

