import { GeoJSON } from '@features/maps/types';
import {axios} from '../../../lib/axios';
import {API_ROUTES} from '../../../utils/routing'
import { BuoyLocation, BuoyLocationLatestObservation, BuoyNearestType, Spot} from '../types';

type QueryParams = {
  limit?: number;
  search?: string;
}

type SearchParams = {
  q: string;
  limit?: number;
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

export const getSearchResults = async <T>(params: SearchParams): Promise<Record<string, T>[]> => {
  return axios.get(API_ROUTES.SEARCH, {
    params: params
  }).then((response) => {
    return response.data;
  }).catch(() => {
    // If the search fails, return an empty array
    return [];
  })
}

export const getSurfSpots = async (params?: QueryParams): Promise<Spot[]> => {
  return axios.get(API_ROUTES.SURF_SPOTS, {
    params: params
  }).then((response) => {
    return response.data;
  })
}

export const getSurfSpot = async (id: string | number | undefined): Promise<Spot> => {
  return axios.get(`${API_ROUTES.SURF_SPOTS}/${id}`)
    .then((response) => {
      return response.data
    })
  
}

export const getSurfSpotClosest = async (lat: number, lng: number): Promise<Spot[]> => {
  return axios.get(`${API_ROUTES.SURF_SPOTS}/find_closest`, {
    params: {
      lat: lat,
      lng: lng
    }
  })
    .then((response) => {
      return response.data
    })
  
}

export const getSurfSpotsGeoJson = async (): Promise<GeoJSON> => {
  const response = await axios.get(API_ROUTES.SURF_SPOTS_GEOJSON);
  return response.data;
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

export const getLocationBuoyNearby = (lat: number, lng: number): Promise<BuoyNearestType[]> => {
  return axios.get(`${API_ROUTES.LOCATIONS}/find_closest`, {
    params: {
      lat: lat,
      lng: lng
    }
  }).then((response) =>{
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