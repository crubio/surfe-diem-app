export interface ForecastDataHourly {
  hourly: {
    time: string[],
    wave_height: number[],
    wave_period: number[],
    wave_direction: number[]
  },
  hourly_units: {
    [key: string]: string
  }
}

export interface ForecastDataDaily {
  daily: {
    time: string[],
    wave_height_max?: number[]
    swell_wave_height_max?: number[]
    wave_direction_dominant?: number[]
    wave_period_max?: number[]
  }
}
