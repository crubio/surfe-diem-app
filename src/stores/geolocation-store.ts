// src/stores/geolocationStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { LocationStore, LocationData, LocationSource, GeolocationCoordinates } from '../types/geolocation';
import { formatGeolocationAddress, getGeolocation } from '../utils/geolocation';
import { getReverseGeoCode } from '@features/geocoding/api/geocoding';

const initialState = {
  location: null,
  source: null,
  isLoading: false,
  error: null,
  hasPermission: false,
  lastUpdated: null,
};

export const useGeolocationStore = create<LocationStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setLocation: (location: LocationData, source: LocationSource) => {
        set({
          location,
          source,
          error: null,
          lastUpdated: new Date().toISOString(),
          isLoading: false,
        });
      },

      requestGeolocation: async () => {
        set({ isLoading: true, error: null });

        try {
          // Use the existing utility function
          const coords = await getGeolocation();
          const reverseGeocodedData = await getReverseGeoCode({latitude: coords.latitude, longitude: coords.longitude});
          const formattedReverseGeocodedData = reverseGeocodedData.data ? formatGeolocationAddress(reverseGeocodedData.data) : '';

          const locationData: LocationData = {
            coordinates: {
              latitude: coords.latitude,
              longitude: coords.longitude,
              accuracy: coords.accuracy,
            },
            address: formattedReverseGeocodedData,
            timestamp: new Date().toISOString(),
          };

          set({
            location: locationData,
            source: 'auto',
            hasPermission: true,
            error: null,
            isLoading: false,
            lastUpdated: new Date().toISOString(),
          });
        } catch (error) {
          const errorMessage = error instanceof GeolocationPositionError
            ? getGeolocationErrorMessage(error.code)
            : error instanceof Error 
            ? error.message
            : 'Failed to get location';

          set({
            error: errorMessage,
            isLoading: false,
            hasPermission: error instanceof GeolocationPositionError && error.code !== 1,
          });
        }
      },

      setManualLocation: (coordinates: GeolocationCoordinates, address = '') => {
        const locationData: LocationData = {
          coordinates,
          address,
          timestamp: new Date().toISOString(),
        };

        set({
          location: locationData,
          source: 'manual',
          error: null,
          isLoading: false,
          lastUpdated: new Date().toISOString(),
        });
      },

      clearLocation: () => {
        set(initialState);
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      setError: (error: string | null) => {
        set({ error, isLoading: false });
      },

      setPermission: (hasPermission: boolean) => {
        set({ hasPermission });
      },
    }),
    {
      name: 'surfe-diem-geolocation',
      storage: createJSONStorage(() => localStorage),
      // Only persist certain fields (not loading states)
      partialize: (state) => ({
        location: state.location,
        source: state.source,
        hasPermission: state.hasPermission,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);

// Helper function for geolocation errors
const getGeolocationErrorMessage = (code: number): string => {
  switch (code) {
    case 1:
      return 'Location access denied by user';
    case 2:
      return 'Location information unavailable';
    case 3:
      return 'Location request timed out';
    default:
      return 'An unknown error occurred while getting location';
  }
};

// Helper hook for easy consumption
export const useUserLocation = () => {
  const { location, source, isLoading, error, hasPermission } = useGeolocationStore();
  
  return {
    location,
    source,
    isLoading,
    error,
    hasPermission,
    coordinates: location?.coordinates,
    address: location?.address,
  };
};