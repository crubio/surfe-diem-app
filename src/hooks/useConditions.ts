import { useQuery } from '@tanstack/react-query';
import { getConditions } from '@features/conditions';
import { QUERY_KEYS, QUERY_CONFIG } from '../config/query-config';

/**
 * Current conditions for one spot (GET /conditions): NWS swell where it has
 * it, buoy-measured swell otherwise, swell power and its source. Same data
 * the dashboard gets per spot from /batch-conditions.
 */
export const useConditions = (spotId: number | undefined, options?: { enabled?: boolean }) => {
  const { enabled = true } = options || {};
  return useQuery({
    queryKey: [QUERY_KEYS.CONDITIONS, spotId],
    queryFn: async () => (await getConditions({ spot_id: spotId! })).data,
    enabled: !!spotId && enabled,
    staleTime: QUERY_CONFIG.STALE_TIME.SHORT,
    // 404 = no buoy or NWS data for this spot; nothing to retry
    retry: false,
  });
};
