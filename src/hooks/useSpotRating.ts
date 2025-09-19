import { useMutation } from '@tanstack/react-query';
import { 
  submitForecastRating, 
  ForecastRating, 
  ForecastRatingResponse,
  ForecastRatingValue 
} from '@features/locations/api/forecast-rating';
import { ApiResponse } from '../types/api';
import { trackInteraction } from 'utils/analytics';

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
  
  // Generate session ID
  const getSessionId = () => {
    let sessionId = sessionStorage.getItem('forecast_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('forecast_session_id', sessionId);
    }
    return sessionId;
  };

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

      return submitForecastRating(spotId, ratingData);
    },
    onSuccess: (response, variables, context) => {
      if (response.status === 'success') {
        // Track successful submission
        trackInteraction('forecast-rating', 'rating_success', {
          spot_id: spotId,
          spot_slug: spotSlug,
          spot_name: spotName,
          rating: variables.rating,
          date: currentDate,
          message: response.data?.message
        });
      }
    },
    onError: (error: any, variables, context) => {
      // Track failed submission
      trackInteraction('forecast-rating', 'rating_error', {
        spot_id: spotId,
        spot_slug: spotSlug,
        spot_name: spotName,
        rating: variables.rating,
        date: currentDate,
        error: error instanceof Error ? error.message : 'Unknown error',
        status_code: error?.response?.status
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
