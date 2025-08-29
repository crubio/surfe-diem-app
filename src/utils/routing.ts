import { useNavigate } from "react-router-dom";
import { trackInteraction } from "./analytics";

// Use with base url environment variable to make a request url
export const API_PREFIX = "/api/v1";
export const WEATHER_GOV_API_PREFIX = "https://api.weather.gov";
export const OPEN_METEO_API_PREFIX = "https://marine-api.open-meteo.com/v1/marine";
export const API_ROUTES = {
  LOCATIONS: `${API_PREFIX}/locations`,
  SUMMARIES: `${API_PREFIX}/locations/summary`,
  LATEST_OBSERVATIONS: `${API_PREFIX}/locations/latest-observations`,
  POINTS_URL: `/points`,
  FORECAST_URL: `${API_PREFIX}/forecast`,
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
}


// Helpers
export const goToBuoyPage = (location_id: string) => {return `/location/${location_id}`}

export const goToSpotPage = (spot_id: string | number, slug?: string) => { 
  return `/spot/${slug || spot_id}`
}
