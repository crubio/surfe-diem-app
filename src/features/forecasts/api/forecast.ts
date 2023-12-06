import { ForecastDataDaily, ForecastDataHourly } from '..';
import {axios} from '../../../lib/axios';
import {API_ROUTES} from '../../../utils/routing'

export enum ForecastTypesHourly {
  WAVE_HEIGHT = "wave_height",
  WAVE_PERIOD = "wave_period",
  WAVE_DIRECTION = "wave_direction",
}

enum ForecastTypesDaily {
  SWELL_WAVE_HEIGHT = "swell_wave_height_max",
  WAVE_HEIGHT = "wave_height_max",
  WAVE_PERIOD = "wave_period_max",
  WAVE_DIRECTION = "wave_direction_dominant",
}

type ForecastQueryParams = {
  latitude: number;
  longitude: number;
  hourly?: string,
  daily?: string,
  forecast_days?: number,
  start_date?: string, // e.g., YYYY-MM-DD (2021-01-01)
  end_date?: string,  // e.g., YYYY-MM-DD (2021-01-01)
}

const hourlyParams = ForecastTypesHourly.WAVE_HEIGHT + "," + ForecastTypesHourly.WAVE_DIRECTION + "," + ForecastTypesHourly.WAVE_PERIOD

const dailyParams = ForecastTypesDaily.WAVE_HEIGHT + "," + ForecastTypesDaily.SWELL_WAVE_HEIGHT + "," + ForecastTypesDaily.WAVE_DIRECTION + "," + ForecastTypesDaily.WAVE_PERIOD

export const getOpenMeteoForecastHourly = (params: ForecastQueryParams): Promise<ForecastDataHourly> => {
  params['hourly'] = hourlyParams
  return axios.get(API_ROUTES.FORECAST_URL, {
    params: params
  }).then((response) => {
    return response.data;
  })
}

export const getOpenMeteoForecastDaily = (params: ForecastQueryParams): Promise<ForecastDataDaily> => {
  params['daily'] = dailyParams
  return axios.get(API_ROUTES.FORECAST_URL, {
    params: params
  }).then((response) => {
    return response.data;
  })
}

