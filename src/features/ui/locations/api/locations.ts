import {axios} from 'lib/axios';
import {API_ROUTES} from 'utils/routing'
import { Location, LocationLatestObservation, LocationLatestObservations } from '../types';

export const getLocations = (): Promise<Location[]> => {
  return axios.get(API_ROUTES.LOCATIONS);
} 

export const getLocation = (id: string): Promise<Location> => {
  return axios.get(`${API_ROUTES.LOCATIONS}/${id}`);
}

export const getLatestObservations = (): Promise<LocationLatestObservation> => {
  return axios.get(`${API_ROUTES.LATEST_OBSERVATIONS}`);
}

export const getLatestObservation = (id: string): Promise<LocationLatestObservations> => {
  return axios.get(`${API_ROUTES.LOCATIONS}/${id}/latest-observation`);
}