import { axios } from "lib/axios";
import { API_ROUTES } from "utils/routing";

// TODO: TBD params for more specific queries
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