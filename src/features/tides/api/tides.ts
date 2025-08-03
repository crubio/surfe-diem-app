import { axios } from "lib/axios";
import { API_ROUTES } from "utils/routing";

// Additional query parameters will be added as needed
interface TidesQueryParams {
  station?: string;
  lat?: number;
  lng?: number;
}

export interface TidesDataDaily {
  predictions: {
    t: string;
    v: string;
    type: string;
  }[];
}

export interface TidesDataCurrent {
  metadata: {
    id: string;
    name: string;
    lat: string;
    lon: string;
  }
  data: {
    t: string; // Time: Date and time of the observation
    v: string; // Value: Water level height
    s: string; // Sigma: Standard deviation of 1 second samples used to compute the water level height
    f: string; // Flag: Quality flag
    q: string; // Quality: Quality flag
  }[]
}

export interface TideStationMeta {
  station_id: string;
  distance: number;
  latitude: number;
  longitude: number;
}

export const getClostestTideStation = (params: TidesQueryParams): Promise<TideStationMeta> => {
  return axios.get(API_ROUTES.TIDES_CLOSEST_STATION_URL, {
    params: params
  }).then((response) => {
    return response.data;
  })
}

export const getDailyTides = (params: TidesQueryParams): Promise<TidesDataDaily> => {
  return axios.get(API_ROUTES.TIDES_URL, {
    params: params
  }).then((response) => {
    return response.data;
  })
}

export const getCurrentTides = (params: TidesQueryParams): Promise<TidesDataCurrent> => {
  return axios.get(API_ROUTES.TIDES_CURRENT_URL, {
    params: params
  }).then((response) => {
    return response.data;
  })
}