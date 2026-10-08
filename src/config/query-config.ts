/**
 * Centralized configuration for React Query settings
 */

export const QUERY_CONFIG = {
  // Common stale times
  STALE_TIME: {
    SHORT: 5 * 60 * 1000,    // 5 minutes
    MEDIUM: 10 * 60 * 1000,  // 10 minutes
    LONG: 30 * 60 * 1000,    // 30 minutes
  },
  
  // Common garbage collection times
  GC_TIME: {
    SHORT: 10 * 60 * 1000,   // 10 minutes
    MEDIUM: 30 * 60 * 1000,  // 30 minutes
    LONG: 60 * 60 * 1000,    // 1 hour
  },
  
  // Retry settings
  RETRY: {
    DEFAULT: 3,
    FORECAST: 2,
    GEOLOCATION: 1,
  },
  
  // Timeout settings
  TIMEOUT: {
    DEFAULT: 30000,          // 30 seconds
    FORECAST: 45000,         // 45 seconds
    GEOLOCATION: 15000,      // 15 seconds
  },
} as const;

/**
 * Common query keys for consistency
 */
export const QUERY_KEYS = {
  // Spot-related
  SPOTS: 'spots',
  SURF_SPOTS: 'surf_spots',
  CLOSEST_SPOTS: 'closest_spots',
  
  // Location/Buoy-related
  LOCATIONS: 'locations',
  LOCATION: 'location',
  LATEST_OBSERVATION: 'latest_observation',
  NEARBY_BUOYS: 'nearby_buoys',
  LOCATIONS_GEOJSON: 'locations/geojson',
  SPOTS_GEOJSON: 'spots/geojson',
  
  // Forecast-related
  FORECAST_CURRENT: 'forecast_current',
  CONDITIONS: 'conditions',
  FORECAST_HOURLY: 'forecast_hourly',
  FORECAST_DAILY: 'forecast_daily',
  
  // Tide-related (legacy /api/v1/tides/*, still used by spots.tsx)
  TIDE_STATION: 'tide_station',
  DAILY_TIDES: 'daily_tides',
  CURRENT_TIDES: 'current_tides',

  // Tide Explorer (spot page + dashboard — see useTideData.ts)
  TIDE_EXPLORER_STATION: 'tide_explorer_station',
  TIDE_EXPLORER_RECENT: 'tide_explorer_recent',
  TIDE_EXPLORER_HILO: 'tide_explorer_hilo',
  TIDE_EXPLORER_CHART: 'tide_explorer_chart',
  
  // Other
  GEOLOCATION: 'geolocation',
  FAVORITES_BATCH_DATA: 'favorites-batch-data',
  BATCH_RECOMMENDATIONS: 'batch_recommendations',
  SEARCH: 'search',
} as const;

