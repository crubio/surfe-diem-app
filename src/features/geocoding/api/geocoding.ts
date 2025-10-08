import { ApiResponse } from '../../../types/api';
import { axios } from '../../../lib/axios';
import { GeocodingRequest, GeocodingResponse, ReverseGeocodingRequest } from '../types';
import { MAPBOX_API_KEY } from '../../../config';

// Mapbox Geocoding API v6
const MAPBOX_GEOCODING_URL = 'https://api.mapbox.com/search/geocode/v6/forward';
const REVERSE_GEOCODING_URL = 'https://api.mapbox.com/search/geocode/v6/reverse';

enum GeocodeType {
  Country = 'country',
  Region = 'region',
  Postcode = 'postcode',
  District = 'district'
}

export const getGeoCode = async (request: GeocodingRequest): Promise<ApiResponse<GeocodingResponse>> => {
  return axios.get(MAPBOX_GEOCODING_URL, {
    params: {
      q: request.query, // v6 uses 'q' parameter instead of embedding in URL
      access_token: MAPBOX_API_KEY,
      limit: request.limit || 1,
      ...(request.types && { types: request.types.join(',') })
    }
  }).then((response): ApiResponse<GeocodingResponse> => {
    const successResponse: ApiResponse<GeocodingResponse> = {
      status: 'success' as const,
      data: response.data,
      timestamp: new Date().toISOString()
    };
    return successResponse;
  }).catch((error): ApiResponse<GeocodingResponse> => {
    const errorResponse: ApiResponse<GeocodingResponse> = {
      status: 'error' as const,
      data: null,
      timestamp: new Date().toISOString(),
      error: {
        code: 'GEOCODING_ERROR',
        message: error instanceof Error ? error.message : 'Failed to fetch geocoding data'
      }
    };
    return errorResponse;
  });
}

export const getReverseGeoCode = async (request: ReverseGeocodingRequest): Promise<ApiResponse<GeocodingResponse>> => {
  return axios.get(REVERSE_GEOCODING_URL, {
    params: {
      longitude: request.longitude,
      latitude: request.latitude,
      access_token: MAPBOX_API_KEY,
      limit: 1,
      types: request.type || GeocodeType.Postcode
    }
  }).then((response): ApiResponse<GeocodingResponse> => {
    const successResponse: ApiResponse<GeocodingResponse> = {
      status: 'success' as const,
      data: response.data,
      timestamp: new Date().toISOString()
    };
    return successResponse;
  }).catch((error): ApiResponse<GeocodingResponse> => {
    const errorResponse: ApiResponse<GeocodingResponse> = {
      status: 'error' as const,
      data: null,
      timestamp: new Date().toISOString(),
      error: {
        code: 'GEOCODING_ERROR',
        message: error instanceof Error ? error.message : 'Failed to fetch reverse geocoding data'
      }
    };
    return errorResponse;
  });
}