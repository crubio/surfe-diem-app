/**
 * API response types and related interfaces
 */

import { Spot, Buoy } from './core';

/**
 * Base API response structure
 */
export interface BaseApiResponse<T> {
  data: T;
  status: 'success' | 'error';
  timestamp: string;
}

/**
 * Success API response
 */
export type SuccessResponse<T> = BaseApiResponse<T> & {
  status: 'success';
};

/**
 * Error API response
 */
export type ErrorResponse = BaseApiResponse<null> & {
  status: 'error';
  error: {
    code: string;
    message: string;
  };
};

/**
 * Union type for all API responses
 */
export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

/**
 * Batch forecast API response
 */
export interface BatchForecastResponse {
  buoys?: BuoyBatchData[];
  spots?: SpotBatchData[];
  errors?: string[];
}

/**
 * Buoy batch data for API responses
 */
export interface BuoyBatchData {
  id: string;
  name: string;
  observation: BuoyObservation[] | null;
  weather: BuoyWeather;
}

/**
 * Spot batch data for API responses
 */
export interface SpotBatchData {
  id: number;
  name: string;
  slug: string;
  weather: SpotWeather;
}

/**
 * Buoy observation data
 */
export interface BuoyObservation {
  swell_height?: string;
  period?: string;
  direction?: string;
}

/**
 * Buoy weather data
 */
export interface BuoyWeather {
  swell: any; // TODO: Replace with proper typing
  wind: any;  // TODO: Replace with proper typing
  current: any; // TODO: Replace with proper typing
}

/**
 * Spot weather data
 */
export interface SpotWeather {
  swell: SwellData | null;
  wind: any; // TODO: Replace with proper typing
  current: any; // TODO: Replace with proper typing
}

/**
 * Swell data structure
 */
export interface SwellData {
  height: number;
  direction: number;
  period: number;
}
