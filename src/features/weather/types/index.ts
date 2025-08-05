export type WeatherParams = {
  lat: number;
  lng: number;
}

export type WeatherTimeProps = {
  startPeriodName: string[];
  startValidTime: string[];
  tempLabel: string[];
};

export type WeatherDataProps = {
  temperature: string[];
  weather: string[];
  text: string[];
  hazard: string[];
  hazardUrl: string[];
  iconLink: string[];
  pop: (string | null)[];
}

export interface WeatherResponse {
  operationalMode: string;
  creationDate: string;
  creationDateLocal: string;
  productionCenter: string;
  credit: string;
  moreInformation: string;
  location: {
    region: string;
    latitude: string;
    longitude: string;
    elevation: string;
    wfo: string;
    timezone: string;
    areaDescription: string;
    radar: string;
    zone: string;
    county: string;
    firezone: string;
    metar: string;
  };
  time: WeatherTimeProps;
  data: WeatherDataProps;
  currentobservation: {
    id: string;
    name: string;
    elev: string;
    latitude: string;
    longitude: string;
    Date: string;
    datetime: string;
    Temp: string;
    AirTemp: string;
    WaterTemp: string;
    Dewp: string;
    Winds: string;
    Windd: string;
    Gust: string;
    Weather: string;
    WaveHeight: string;
    Visibility: string;
    Pressure: string;
    timezone: string;
    state: string;
    DomWavePeriod: string;
  };
}

export interface CurrentWeatherProps {
  currentWeather: WeatherResponse;
  isLoading: boolean;
  numItems?: number;
}