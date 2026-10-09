import type { NWSHourlyPoint } from 'utils/nws-parser';

/**
 * Which height series an NWS hourly forecast can actually chart:
 * - "primary": any hour has primary swell (normal full grid)
 * - "combined": no swell breakdown, but wave height has real values
 *   (wave-height-only grids, e.g. US East Coast)
 * - "none": nothing positive to chart. Some grids return a placeholder, e.g.
 *   SEW/61,47 (Westport WA) sent one wave height of 0 spanning 7 days.
 */
export type ForecastHeightSeries = 'primary' | 'combined' | 'none';

export const getForecastHeightSeries = (hourly: NWSHourlyPoint[] | null | undefined): ForecastHeightSeries => {
  if (!hourly?.length) return 'none';
  if (hourly.some((p) => (p.primarySwellHeightFt ?? 0) > 0)) return 'primary';
  if (hourly.some((p) => (p.waveHeightFt ?? 0) > 0)) return 'combined';
  return 'none';
};
