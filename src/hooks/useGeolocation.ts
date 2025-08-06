import { useQuery } from '@tanstack/react-query';
import { getGeolocation } from 'utils/geolocation';
import { QUERY_KEYS, QUERY_CONFIG } from '../config/query-config';

/**
 * Hook for fetching user's geolocation
 */
export const useGeolocation = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GEOLOCATION],
    queryFn: () => getGeolocation(),
    staleTime: QUERY_CONFIG.STALE_TIME.MEDIUM,
    gcTime: QUERY_CONFIG.GC_TIME.MEDIUM,
  });
}; 