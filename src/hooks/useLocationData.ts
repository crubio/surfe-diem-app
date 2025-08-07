import { useQuery } from '@tanstack/react-query';
import { getLocations, getLocation, getLatestObservation, getLocationBuoyNearby, getGeoJsonLocations, getSurfSpotsGeoJson } from '@features/locations/api/locations';
import { QUERY_KEYS, QUERY_CONFIG } from '../config/query-config';

/**
 * Hook for fetching all locations/buoys
 */
export const useLocations = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.LOCATIONS],
    queryFn: () => getLocations(),
  });
};

/**
 * Hook for fetching a single location by ID
 */
export const useLocation = (locationId: string | undefined) => {
  return useQuery({
    queryKey: [QUERY_KEYS.LOCATION, locationId],
    queryFn: () => getLocation(locationId!),
    enabled: !!locationId,
  });
};

/**
 * Hook for fetching latest observation for a location
 */
export const useLatestObservation = (locationId: string | undefined) => {
  return useQuery({
    queryKey: [QUERY_KEYS.LATEST_OBSERVATION, locationId],
    queryFn: () => getLatestObservation(locationId!),
    enabled: !!locationId,
  });
};

/**
 * Hook for fetching nearby buoys to a location
 */
export const useNearbyBuoys = (latitude: number | undefined, longitude: number | undefined) => {
  return useQuery({
    queryKey: [QUERY_KEYS.NEARBY_BUOYS, latitude, longitude],
    queryFn: () => getLocationBuoyNearby(longitude!, latitude!),
    enabled: !!latitude && !!longitude,
    staleTime: QUERY_CONFIG.STALE_TIME.SHORT,
  });
};

/**
 * Hook for fetching GeoJSON data for locations
 */
export const useLocationsGeoJson = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.LOCATIONS_GEOJSON],
    queryFn: () => getGeoJsonLocations(),
  });
};

/**
 * Hook for fetching GeoJSON data for surf spots
 */
export const useSpotsGeoJson = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.SPOTS_GEOJSON],
    queryFn: () => getSurfSpotsGeoJson(),
  });
};

/**
 * Hook for fetching all location data for a specific location
 */
export const useLocationData = (locationId: string | undefined) => {
  const location = useLocation(locationId);
  const latestObservation = useLatestObservation(locationId);

  return {
    location,
    latestObservation,
    isLoading: location.isPending || latestObservation.isPending,
    isError: location.isError || latestObservation.isError,
  };
}; 