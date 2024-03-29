import { API_ROUTES } from 'utils/routing';
import {axios} from '../../../lib/axios';
import { WeatherDataProps, WeatherParams, WeatherTimeProps } from '../types';

// TODO: type for the response, add to types/index.ts
// the Record<string, T>[] is a placeholder for now and kinda just generic and better than using 'any'
type WeatherResponse = {
  time: WeatherTimeProps;
  data: WeatherDataProps;
};

export const getCurrentWeather = (params: WeatherParams): Promise<WeatherResponse> => {
  return axios.get(API_ROUTES.WEATHER, {
    params: params
  }).then((response) => {
    return response.data;
  })
}