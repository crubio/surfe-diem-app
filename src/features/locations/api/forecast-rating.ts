import { axios } from '../../../lib/axios';
import { ApiResponse } from '../../../types/api';

export type ForecastRatingValue = 'accurate' | 'not_accurate';

export interface ForecastRating {
  rating: ForecastRatingValue;
  forecast_json: Record<string, unknown>;
}

export interface ForecastRatingResponse {
  message: string;
  rating: ForecastRatingValue;
  [key: string]: unknown;
}

export const submitForecastRating = async (
  spotId: number,
  ratingData: ForecastRating
): Promise<ApiResponse<ForecastRatingResponse>> => {
  try {
    const response = await axios.post(`/api/v1/spots/${spotId}/rating`, ratingData);
    const successResponse: ApiResponse<ForecastRatingResponse> = {
      status: 'success' as const,
      data: response.data,
      timestamp: new Date().toISOString()
    };
    return successResponse;
  } catch (error: unknown) {
    const isAxiosError = error && typeof error === 'object' && 'response' in error;
    const status = isAxiosError ? (error as any).response?.status : undefined;
    
    const errorResponse: ApiResponse<ForecastRatingResponse> = {
      status: 'error' as const,
      data: null,
      timestamp: new Date().toISOString(),
      error: {
        code: status === 409 ? 'ALREADY_RATED' : 'RATING_SUBMISSION_ERROR',
        message: error instanceof Error ? error.message : 'Failed to submit rating'
      }
    };
    console.error('submitForecastRating error response:', errorResponse);
    return errorResponse;
  }
};
