// Use with base url environment variable to make a request url
export const API_PREFIX = "/api/v1";
// Tide Explorer is a separate feature surface on the same API host — richer tide
// data (multi-day hi/lo, hourly chart predictions, subordinate-station fallback)
// than the legacy /api/v1/tides/* routes below. See .docs/forecast-spot-plan.md §2b/§3.F.
export const TIDE_EXPLORER_PREFIX = "/tide-explorer-api/v1";
export const API_ROUTES = {
  LOCATIONS: `${API_PREFIX}/locations`,
  SUMMARIES: `${API_PREFIX}/locations/summary`,
  LATEST_OBSERVATIONS: `${API_PREFIX}/locations/latest-observations`,
  POINTS_URL: `/points`,
  TIDES_URL: `${API_PREFIX}/tides`,
  TIDES_CURRENT_URL: `${API_PREFIX}/tides/current`,
  TIDES_CLOSEST_STATION_URL: `${API_PREFIX}/tides/find_closest`,
  LOCATIONS_GEOJSON: `${API_PREFIX}/locations/geojson`,
  SURF_SPOTS: `${API_PREFIX}/spots`,
  SURF_SPOTS_SLUG: `${API_PREFIX}/spots/slug`,
  SURF_SPOTS_GEOJSON: `${API_PREFIX}/spots/geojson`,
  SEARCH: `${API_PREFIX}/search`,
  WEATHER: `${API_PREFIX}/weather`,
  BATCH_FORECAST: `${API_PREFIX}/batch-forecast`,
  CONDITIONS: `${API_PREFIX}/conditions`,
  BATCH_CONDITIONS: `${API_PREFIX}/batch-conditions`,
  NWS_FORECAST: `${API_PREFIX}/nws/forecast`,
  ML_FORECAST: `${API_PREFIX}/forecast/ml`,
  // Tide Explorer
  TIDE_EXPLORER_STATIONS_NEARBY: `${TIDE_EXPLORER_PREFIX}/stations/nearby`,
  TIDE_EXPLORER_PREDICTIONS: `${TIDE_EXPLORER_PREFIX}/tides/predictions`,
  TIDE_EXPLORER_PREDICTIONS_CHART: `${TIDE_EXPLORER_PREFIX}/tides/predictions/chart`,
  TIDE_EXPLORER_TODAY: `${TIDE_EXPLORER_PREFIX}/tides/today`,
  TIDE_EXPLORER_RECENT: `${TIDE_EXPLORER_PREFIX}/tides/recent`,
}

// Helpers
export const goToBuoyPage = (location_id: string) => {return `/location/${location_id}`}

export const goToSpotPage = (spot_id: string | number, slug?: string) => { 
  return `/spot/${slug || spot_id}`
}
