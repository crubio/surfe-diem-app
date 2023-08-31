import {axios} from '../../../lib/axios';
import {API_ROUTES} from '../../../utils/routing'
import { BuoyLocation, BuoyLocationLatestObservation} from '../types';

type QueryParams = {
  limit?: number;
  search?: string;
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

export const getLatestObservation = (id: string): Promise<BuoyLocationLatestObservation[]> => {
  return axios.get(`${API_ROUTES.LOCATIONS}/${id}/latest-observation`).then((response) => {
    return response.data;
  })
}