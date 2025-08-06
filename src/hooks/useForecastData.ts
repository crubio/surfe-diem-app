import { useQuery } from '@tanstack/react-query';
import { getForecastCurrent, getForecastHourly, getForecastDaily } from '@features/forecasts';
import { QUERY_KEYS } from '../config/query-config';

/**
 * Hook for fetching current forecast data
 */
export const useForecastCurrent = (latitude: number | undefined, longitude: number | undefined) => {
  return useQuery({
    queryKey: [QUERY_KEYS.FORECAST_CURRENT, latitude, longitude],
    queryFn: () => getForecastCurrent({ latitude: latitude!, longitude: longitude! }),
    enabled: !!latitude && !!longitude,
  });
};

/**
 * Hook for fetching hourly forecast data
 */
export const useForecastHourly = (
  latitude: number | undefined, 
  longitude: number | undefined, 
  forecastDays = 1
) => {
  return useQuery({
    queryKey: [QUERY_KEYS.FORECAST_HOURLY, latitude, longitude, forecastDays],
    queryFn: () => getForecastHourly({ 
      latitude: latitude!, 
      longitude: longitude!, 
      forecast_days: forecastDays 
    }),
    enabled: !!latitude && !!longitude,
  });
};

/**
 * Hook for fetching daily forecast data
 */
export const useForecastDaily = (latitude: number | undefined, longitude: number | undefined) => {
  return useQuery({
    queryKey: [QUERY_KEYS.FORECAST_DAILY, latitude, longitude],
    queryFn: () => getForecastDaily({ latitude: latitude!, longitude: longitude! }),
    enabled: !!latitude && !!longitude,
  });
};

/**
 * Hook for fetching all forecast data types for a location
 */
export const useForecastData = (latitude: number | undefined, longitude: number | undefined) => {
  const current = useForecastCurrent(latitude, longitude);
  const hourly = useForecastHourly(latitude, longitude);
  const daily = useForecastDaily(latitude, longitude);

  return {
    current,
    hourly,
    daily,
    isLoading: current.isPending || hourly.isPending || daily.isPending,
    isError: current.isError || hourly.isError || daily.isError,
  };
}; 