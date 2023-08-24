import {axios} from '../../../../lib/axios';
import {API_ROUTES} from '../../../../utils/routing'
import { Location, LocationLatestObservation} from '../types';

export const getLocations = (): Promise<Location[]> => {
  return axios.get(API_ROUTES.LOCATIONS).then((response) => {
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