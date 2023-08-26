import {axios} from '../../../../lib/axios';
import {API_ROUTES} from '../../../../utils/routing'
import { Location, LocationLatestObservation} from '../types';

type QueryParams = {
  limit?: number;
  search?: string;
}

export const getLocations = (params?: QueryParams): Promise<Location[]> => {
  return axios.get(API_ROUTES.LOCATIONS, {
    params: params
  }).then((response) => {
    return response.data;
  })
} 

export const getLocation = (id: string): Promise<Location> => {
  return axios.get(`${API_ROUTES.LOCATIONS}/${id}`);
}

export const getLatestObservations = (): Promise<LocationLatestObservation[]> => {
  return axios.get(`${API_ROUTES.LATEST_OBSERVATIONS}`);
}

export const getLatestObservation = (id: string): Promise<LocationLatestObservation> => {
  return axios.get(`${API_ROUTES.LOCATIONS}/${id}/latest-observation`).then((response) => {
    return response.data;
  })
}