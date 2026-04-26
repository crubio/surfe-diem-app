import { useQuery } from '@tanstack/react-query';
import { getMLForecast } from '@features/forecasts';
import { QUERY_KEYS } from '../config/query-config';
import type { MLForecastResponse } from '@/types';

export const useMLForecast = (
  spotId: number | undefined,
  options?: { enabled?: boolean }
) => {
  const { enabled = true } = options || {};

  return useQuery<MLForecastResponse>({
    queryKey: [QUERY_KEYS.FORECAST_CURRENT, 'ml', spotId],
    queryFn: async () => {
      if (!spotId) throw new Error('spotId is required');
      const response = await getMLForecast({ spot_id: spotId });
      if (!response.data) throw new Error('Failed to fetch ML forecast');
      return response.data;
    },
    enabled: !!spotId && enabled,
  });
};
