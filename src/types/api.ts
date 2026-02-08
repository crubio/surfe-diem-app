/**
 * Axios response wrapper structure
 */
export interface AxiosResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

/**
 * Wrapped API response structure with custom status indicator
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
  status: 'success' | 200;
  statusText?: string;
  statusCode?: number;
};

/**
 * Error API response
 */
export type ErrorResponse = BaseApiResponse<null> & {
  status: 'error';
  statusText?: string;
  statusCode?: number;
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

// ========================================
// UTILITY TYPES FOR API OPERATIONS
// ========================================

/**
 * Batch data for updates (all fields optional except id)
 */
export type BuoyBatchDataUpdate = Partial<Omit<BuoyBatchData, 'id'>> & { id: string };
export type SpotBatchDataUpdate = Partial<Omit<SpotBatchData, 'id'>> & { id: number };

/**
 * Batch data for creation (required fields only)
 */
export type BuoyBatchDataCreate = Pick<BuoyBatchData, 'name'> & 
  Partial<Omit<BuoyBatchData, 'name'>>;
export type SpotBatchDataCreate = Pick<SpotBatchData, 'name' | 'slug'> & 
  Partial<Omit<SpotBatchData, 'name' | 'slug'>>;

/**
 * Batch data for display (readonly)
 */
export type BuoyBatchDataDisplay = Readonly<BuoyBatchData>;
export type SpotBatchDataDisplay = Readonly<SpotBatchData>;

/**
 * Weather data for updates
 */
export type BuoyWeatherUpdate = Partial<BuoyWeather>;
export type SpotWeatherUpdate = Partial<SpotWeather>;

/**
 * Observation data for updates
 */
export type BuoyObservationUpdate = Partial<BuoyObservation>;

/**
 * Swell data for updates
 */
export type SwellDataUpdate = Partial<SwellData>;

// ========================================
// UTILITY TYPES FOR API RESPONSES
// ========================================

/**
 * API response with metadata
 */
export type ApiResponseWithMeta<T> = ApiResponse<T> & {
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
  };
};

/**
 * Paginated API response
 */
export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
};

/**
 * Batch API response with utility types
 */
export type BatchForecastResponseUpdate = Partial<BatchForecastResponse>;
export type BatchForecastResponseDisplay = Readonly<BatchForecastResponse>;
