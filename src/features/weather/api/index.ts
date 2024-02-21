import { API_ROUTES } from 'utils/routing';
import {axios} from '../../../lib/axios';
import { WeatherParams } from '../types';

// TODO: type for the response, add to types/index.ts
// the Record<string, T>[] is a placeholder for now and kinda just generic and better than using 'any'

export const getCurrentWeather = <T>(params: WeatherParams): Promise<Record<string, T>[]> => {
  return axios.get(API_ROUTES.WEATHER, {
    params: params
  }).then((response) => {
    return response.data;
  })
}