export type WeatherParams = {
  lat: number;
  lng: number;
}

export type WeatherTimeProps = {
  startPeriodName: string[];
  validStartTime: string[];
};

export type WeatherDataProps = {
  temperature: number[];
  text: string[];
}

export interface CurrentWeatherProps {
  currentWeather: {
    time: WeatherTimeProps;
    data: WeatherDataProps;
  }
  isLoading: boolean;
  numItems?: number;
}