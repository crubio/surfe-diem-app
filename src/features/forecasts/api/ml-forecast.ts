import { MLForecastParams, MLForecastResponse } from '@/types';
import { axios } from '../../../lib/axios';
import { API_ROUTES } from '../../../utils/routing';

export const getMLForecast = (params: MLForecastParams): Promise<{ data: MLForecastResponse }> => {
  return axios.get(API_ROUTES.ML_FORECAST, { params });
}
