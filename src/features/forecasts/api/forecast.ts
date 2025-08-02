import { ForecastDataCurrent, ForecastDataDaily, ForecastDataHourly } from '..';
import {axios} from '../../../lib/axios';
import {API_ROUTES} from '../../../utils/routing'

export enum ForecastTypesCurrent {
  SWELL_WAVE_HEIGHT = "swell_wave_height",
  SWELL_WAVE_DIRECTION = "swell_wave_direction",
  SWELL_WAVE_PERIOD = "swell_wave_period",
  WIND_WAVE_HEIGHT = "wind_wave_height",
  WIND_WAVE_DIRECTION = "wind_wave_direction",
  WIND_WAVE_PERIOD = "wind_wave_period",
  SEA_SURFACE_TEMPERATURE = "sea_surface_temperature",
}

export enum ForecastTypesHourly {
  WAVE_HEIGHT = "wave_height",
  WAVE_PERIOD = "wave_period",
  WAVE_DIRECTION = "wave_direction",
  SWELL_WAVE_HEIGHT = "swell_wave_height",
  SWELL_WAVE_DIRECTION = "swell_wave_direction",
  SWELL_WAVE_PERIOD = "swell_wave_period",
}

enum ForecastTypesDaily {
  SWELL_WAVE_HEIGHT = "swell_wave_height_max",
  SWELL_WAVE_DIRECTION = "swell_wave_direction_dominant",
  SWELL_WAVE_PERIOD = "swell_wave_period_max",
  WAVE_HEIGHT = "wave_height_max",
  WAVE_PERIOD = "wave_period_max",
  WAVE_DIRECTION = "wave_direction_dominant",
}

type ForecastQueryParams = {
  latitude: number;
  longitude: number;
  hourly?: string,
  daily?: string,
  current?: string,
  forecast_days?: number,
  start_date?: string, // e.g., YYYY-MM-DD (2021-01-01)
  end_date?: string,  // e.g., YYYY-MM-DD (2021-01-01)
}

const hourlyParams = Object.values(ForecastTypesHourly).join(",")

const dailyParams = Object.values(ForecastTypesDaily).join(",")

const currentParams = Object.values(ForecastTypesCurrent).join(",")

export const getForecastHourly = (params: ForecastQueryParams): Promise<ForecastDataHourly> => {
  params['hourly'] = hourlyParams
  return axios.get(API_ROUTES.FORECAST_URL, {
    params: params
  }).then((response) => {
    return response.data;
  })
}

export const getForecastDaily = (params: ForecastQueryParams): Promise<ForecastDataDaily> => {
  params['daily'] = dailyParams
  return axios.get(API_ROUTES.FORECAST_URL, {
    params: params
  }).then((response) => {
    return response.data;
  })
}

export const getForecastCurrent = (params: ForecastQueryParams): Promise<ForecastDataCurrent> => {
  params['current'] = currentParams
  return axios.get(API_ROUTES.FORECAST_URL, {
    params: params
  }).then((response) => {
    return response.data
  })
}

