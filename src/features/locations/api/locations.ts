import { GeoJSON } from '@features/maps/types';
import {axios} from '../../../lib/axios';
import {API_ROUTES} from '../../../utils/routing'
import { BuoyLocation, BuoyLocationLatestObservation} from '../types';

type QueryParams = {
  limit?: number;
  search?: string;
}

/**
 * Type for observations
 * Sample response:
 * [
 * {
      "wave_height": "3.6 ft",
      "peak_period": "18 sec",
      "water_temp": "68.9 °F"
    }
 * ]
 */
type LatestObservationItem = {
  [key: string]: string
}

export const getGeoJsonLocations = (): Promise<GeoJSON> => {
  return axios.get(API_ROUTES.LOCATIONS_GEOJSON).then((response) => {
    return response.data;
  })
}

export const getLocations = (params?: QueryParams): Promise<BuoyLocation[]> => {
  return axios.get(API_ROUTES.LOCATIONS, {
    params: params
  }).then((response) => {
    return response.data;
  })
} 

export const getLocation = (id: string | undefined): Promise<BuoyLocation> => {
  return axios.get(`${API_ROUTES.LOCATIONS}/${id}`).then((response) => {
    return response.data;
  })
}

export const getLatestObservations = (): Promise<BuoyLocationLatestObservation[]> => {
  return axios.get(`${API_ROUTES.LATEST_OBSERVATIONS}`);
}

export const getLatestObservation = (id: string): Promise<LatestObservationItem[]> => {
  return axios.get(`${API_ROUTES.LOCATIONS}/${id}/latest-observation`).then((response) => {
    return response.data;
  })
}