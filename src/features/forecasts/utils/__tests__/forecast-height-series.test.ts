import { getForecastHeightSeries } from '../forecast-height-series';
import type { NWSHourlyPoint } from 'utils/nws-parser';

const point = (primary: number | null, combined: number | null): NWSHourlyPoint =>
  ({
    hour: '',
    validTime: '',
    waveHeightFt: combined,
    waveDirection: null,
    primarySwellHeightFt: primary,
    primarySwellPeriod: null,
    primarySwellDirection: null,
    secondarySwellHeightFt: null,
    windSpeed: null,
  }) as unknown as NWSHourlyPoint;

describe('getForecastHeightSeries', () => {
  it('should chart primary swell when any hour has it', () => {
    expect(getForecastHeightSeries([point(null, 3), point(2, 3)])).toBe('primary');
  });

  it('should chart combined wave height on a grid with no swell breakdown', () => {
    // Bradley Beach NJ (PHI): wave height only
    expect(getForecastHeightSeries([point(null, 1), point(null, 2)])).toBe('combined');
  });

  it('should chart nothing for an all-zero placeholder grid', () => {
    // Westport WA (SEW): one 0 wave height spanning the whole week
    expect(getForecastHeightSeries([point(null, 0), point(null, 0)])).toBe('none');
  });

  it('should chart nothing with no hours', () => {
    expect(getForecastHeightSeries([])).toBe('none');
    expect(getForecastHeightSeries(undefined)).toBe('none');
  });
});
