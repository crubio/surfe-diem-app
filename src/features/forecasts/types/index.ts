export interface ForecastDataHourly {
  hourly: {
    time: string[],
    wave_height: number[],
    wave_period: number[],
    wave_direction: number[]
  }
}

export interface ForecastDataDaily {
  daily: {
    time: string[],
    wave_height_max: number[]
  }
}
