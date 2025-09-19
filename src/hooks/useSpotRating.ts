import { useMutation } from '@tanstack/react-query';
import { 
  submitForecastRating, 
  ForecastRating, 
  ForecastRatingResponse,
  ForecastRatingValue 
} from '@features/locations/api/forecast-rating';
import { ApiResponse } from '../types/api';
import { getSessionId, trackInteraction } from 'utils/analytics';

interface UseSpotRatingParams {
  spotId: number;
  spotSlug: string;
  spotName: string;
  currentDate?: string;
}

interface SubmitRatingParams {
  rating: ForecastRatingValue;
  forecastData: Record<string, unknown>;
  onSuccess?: (response: ApiResponse<ForecastRatingResponse>) => void;
  onError?: (error: any) => void;
}

export const useSpotRating = ({ 
  spotId, 
  spotSlug, 
  spotName, 
  currentDate 
}: UseSpotRatingParams) => {

  const submitRatingMutation = useMutation({
    mutationFn: async ({ rating, forecastData }: Pick<SubmitRatingParams, 'rating' | 'forecastData'>) => {
      // Track the rating submission
      trackInteraction('forecast-rating', 'rating_submitted', {
        spot_id: spotId,
        spot_slug: spotSlug,
        spot_name: spotName,
        rating: rating,
        date: currentDate,
        session_id: getSessionId(),
        forecast_data: forecastData
      });

      const ratingData: ForecastRating = {
        rating,
        forecast_json: forecastData
      };

      const response = await submitForecastRating(spotId, ratingData);
      
      // Check if the response indicates an error and throw to trigger React Query's error handling
      if (response.status === 'error') {
        const error = new Error(response.error.message);
        (error as any).code = response.error.code;
        throw error;
      }
      
      return response;
    },
    onSuccess: (response, variables) => {
      // Track successful submission
      trackInteraction('forecast-rating', 'rating_success', {
        spot_id: spotId,
        spot_slug: spotSlug,
        spot_name: spotName,
        rating: variables.rating,
        date: currentDate,
        message: response.data?.message
      });
    },
    onError: (error: any, variables) => {
      // Track failed submission
      trackInteraction('forecast-rating', 'rating_error', {
        spot_id: spotId,
        spot_slug: spotSlug,
        spot_name: spotName,
        rating: variables.rating,
        date: currentDate,
        error: error.message || 'Unknown error',
        error_code: error.code,
      });
    }
  });

  const submitRating = (params: SubmitRatingParams) => {
    // Track button click before submission
    trackInteraction('forecast-rating', 'rating_button_clicked', {
      spot_id: spotId,
      spot_slug: spotSlug,
      spot_name: spotName,
      rating: params.rating,
      date: currentDate
    });

    submitRatingMutation.mutate(
      { 
        rating: params.rating, 
        forecastData: params.forecastData 
      },
      {
        onSuccess: params.onSuccess,
        onError: params.onError
      }
    );
  };

  return {
    submitRating,
    isLoading: submitRatingMutation.isPending,
    isError: submitRatingMutation.isError,
    error: submitRatingMutation.error,
    data: submitRatingMutation.data,
    isSuccess: submitRatingMutation.isSuccess,
    reset: submitRatingMutation.reset
  };
};
