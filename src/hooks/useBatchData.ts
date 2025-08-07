import { useQuery } from '@tanstack/react-query';
import { getBatchForecast } from '@features/locations/api/locations';
import { getBatchRecommendationsFromAPI } from 'utils/conditions';
import { useFavorites } from '../providers/favorites-provider';
import { QUERY_KEYS, QUERY_CONFIG } from '../config/query-config';

/**
 * Hook for fetching batch forecast data for favorites
 */
export const useFavoritesBatchData = () => {
  const { favorites } = useFavorites();
  
  return useQuery({
    queryKey: [QUERY_KEYS.FAVORITES_BATCH_DATA, favorites.length > 0 ? favorites.map(f => `${f.type}-${f.id}`).join(',') : 'empty'],
    queryFn: () => {
      if (favorites.length === 0) return { buoys: [], spots: [] };
      
      const buoyIds = favorites.filter(f => f.type === 'buoy').map(f => f.id);
      const spotIds = favorites.filter(f => f.type === 'spot').map(f => Number(f.id));
      
      return getBatchForecast({
        buoy_ids: buoyIds.length > 0 ? buoyIds : undefined,
        spot_ids: spotIds.length > 0 ? spotIds : undefined,
      });
    },
    enabled: favorites.length > 0,
    staleTime: QUERY_CONFIG.STALE_TIME.SHORT,
    gcTime: QUERY_CONFIG.GC_TIME.SHORT,
  });
};

/**
 * Hook for fetching batch recommendations from nearby spots
 */
export const useBatchRecommendations = (spots: Array<{ id: number; name: string; slug: string; latitude: number; longitude: number; distance?: string }> | undefined) => {
  return useQuery({
    queryKey: [QUERY_KEYS.BATCH_RECOMMENDATIONS, spots?.map(s => s.id).join(',')],
    queryFn: () => getBatchRecommendationsFromAPI(spots!.map(spot => ({
      ...spot,
      distance: spot.distance ? `${spot.distance} miles` : undefined
    }))),
    enabled: !!spots && spots.length > 0,
    staleTime: QUERY_CONFIG.STALE_TIME.SHORT,
    gcTime: QUERY_CONFIG.GC_TIME.SHORT,
  });
}; 