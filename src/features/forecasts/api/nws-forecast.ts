import { ApiResponse, NWSForecastParams, NWSForecastResponse } from '@/types';
import {axios} from '../../../lib/axios';
import {API_ROUTES} from '../../../utils/routing'

export const getNWSForecast = (params: NWSForecastParams): Promise<ApiResponse<NWSForecastResponse>> => {
  return axios.get(API_ROUTES.NWS_FORECAST, { params });
}