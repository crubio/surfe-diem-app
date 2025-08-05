import { API_ROUTES } from 'utils/routing';
import {axios} from '../../../lib/axios';
import { WeatherDataProps, WeatherParams, WeatherTimeProps } from '../types';

// Response type will be added to types/index.ts when API is finalized
// the Record<string, T>[] is a placeholder for now and kinda just generic and better than using 'any'
import { WeatherResponse } from '../types';

export const getCurrentWeather = (params: WeatherParams): Promise<WeatherResponse> => {
  return axios.get(API_ROUTES.WEATHER, {
    params: params
  }).then((response) => {
    return response.data;
  })
}