// src/stores/geolocationStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { LocationStore, LocationData, LocationSource, GeolocationCoordinates, SetGeolocationData } from '../types/geolocation';
import { getGeolocation } from '../utils/geolocation';
import { getGeoCode, getReverseGeoCode } from '@features/geocoding/api/geocoding';

const initialState = {
  location: undefined,
  source: undefined,
  isLoading: false,
  error: undefined,
  hasPermission: false,
  lastUpdated: undefined,
};

export const useGeolocationStore = create<LocationStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      getStorage: () => {
        if (typeof localStorage === 'undefined') {
          throw new Error('Local storage is not available');
        }
        return localStorage;
      },

      setLocation: (location: LocationData, source: LocationSource) => {
        set({
          location,
          source,
          error: undefined,
          lastUpdated: new Date().toISOString(),
          isLoading: false,
        });
      },

      requestGeolocation: async () => {
        set({ isLoading: true, error: undefined });

        try {
          const coords = await getGeolocation();
          const reverseGeocodedData = await getReverseGeoCode({latitude: coords.latitude, longitude: coords.longitude});

          const locationData: LocationData = {
            coordinates: {
              latitude: coords.latitude,
              longitude: coords.longitude,
              accuracy: coords.accuracy,
            },
            address: reverseGeocodedData.data?.features?.[0]?.properties?.full_address || '',
            timestamp: new Date().toISOString(),
          };

          set({
            location: locationData,
            source: 'auto',
            hasPermission: true,
            error: undefined,
            isLoading: false,
            lastUpdated: new Date().toISOString(),
          });
        } catch (error) {
          const errAny = error as any;
          const isGeoErr = typeof errAny?.code === 'number';
          const errorMessage = isGeoErr 
            ? getGeolocationErrorMessage(errAny.code)
            : error instanceof Error ? error.message : 'Failed to get location';

          set({
            error: errorMessage,
            isLoading: false,
            hasPermission: error instanceof GeolocationPositionError && error.code !== 1,
          });
        }
      },

      setManualLocation: (coordinates: SetGeolocationData, address?: string) => {
        const locationData: LocationData = {
          coordinates: {
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            accuracy: coordinates.accuracy,
          },
          address: address || '',
          timestamp: new Date().toISOString(),
        };

        set({
          location: locationData,
          source: 'manual',
          error: undefined,
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

      setError: (error: string | undefined) => {
        set({ error, isLoading: false });
      },

      setPermission: (hasPermission: boolean) => {
        set({ hasPermission });
      },
    }),
    {
      name: 'surfe-diem-geolocation',
      storage: createJSONStorage(() => localStorage),
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
export const useUserLocation = (): {
  location: LocationData | undefined;
  source: LocationSource | undefined;
  isLoading: boolean | undefined;
  error: string | undefined;
  hasPermission: boolean | undefined;
  coordinates?: GeolocationCoordinates;
  address?: string;
} => {
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