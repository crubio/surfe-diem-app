import { DateTime } from 'luxon';
import { buildDailyForecast } from '../build-daily-forecast';
import type { NWSHourlyPoint } from 'utils/nws-parser';
import type { TidePrediction } from '@features/tides/api/tide-explorer';

const TZ = 'America/Los_Angeles';

// Build an hourly point at a given spot-local hour offset from `start`.
const point = (
  start: DateTime,
  hourOffset: number,
  overrides: Partial<NWSHourlyPoint> = {}
): NWSHourlyPoint => ({
  hour: hourOffset,
  validTime: start.plus({ hours: hourOffset }).toISO() ?? '',
  waveHeightFt: 3,
  waveDirection: 270,
  primarySwellHeightFt: 2,
  primarySwellPeriod: 10,
  primarySwellDirection: 280,
  secondarySwellHeightFt: 1,
  windSpeed: 15,
  ...overrides,
});

describe('buildDailyForecast', () => {
  // Anchored to the real "now" (not a hardcoded date) so dayLabel reliably
  // reads "Today" for the first bucket regardless of when the suite runs.
  const start = DateTime.now().setZone(TZ).startOf('day').plus({ hours: 6 }); // "today", 6am local

  it('returns one day per calendar day and starts with today', () => {
    const hourly = Array.from({ length: 48 }, (_, i) => point(start, i));
    const days = buildDailyForecast(hourly, null, TZ, 5);

    expect(days.length).toBeGreaterThanOrEqual(2);
    expect(days[0].dayLabel).toBe('Today');
    expect(days[0].dateKey).toBe(start.toISODate());
  });

  it('reports the PEAK primary swell hour, not an average or midday value', () => {
    const hourly = [
      point(start, 0, { primarySwellHeightFt: 2 }),
      point(start, 1, { primarySwellHeightFt: 5, primarySwellPeriod: 14, primarySwellDirection: 300 }),
      point(start, 2, { primarySwellHeightFt: 3 }),
    ];
    const [today] = buildDailyForecast(hourly, null, TZ, 5);

    expect(today.primary.peakFt).toBe(5);
    expect(today.primary.periodS).toBe(14);
    expect(today.primary.directionDeg).toBe(300);
    expect(today.primary.minFt).toBe(2);
    expect(today.primary.maxFt).toBe(5);
    expect(today.primary.peakTime?.hour).toBe(start.plus({ hours: 1 }).hour);
  });

  it('caps output at `days` and skips days with no hourly data', () => {
    const hourly = Array.from({ length: 200 }, (_, i) => point(start, i)); // ~8 days
    const days = buildDailyForecast(hourly, null, TZ, 5);
    expect(days.length).toBe(5);
  });

  it('buckets tide hi/lo predictions by local day', () => {
    const hourly = Array.from({ length: 48 }, (_, i) => point(start, i));
    const todayKey = start.toISODate()!;
    const tomorrowKey = start.plus({ days: 1 }).toISODate()!;
    const tides: TidePrediction[] = [
      { t: `${todayKey} 09:03`, v: '1.20', type: 'L' },
      { t: `${todayKey} 16:12`, v: '4.10', type: 'H' },
      { t: `${tomorrowKey} 09:45`, v: '1.00', type: 'L' },
    ];

    const days = buildDailyForecast(hourly, tides, TZ, 5);
    expect(days[0].tides).toHaveLength(2);
    expect(days[0].tides[0]).toEqual({ type: 'L', ft: 1.2, time: `${todayKey} 09:03` });
    expect(days[1].tides).toHaveLength(1);
  });

  it('omits secondary swell / wvht when no data is present', () => {
    const hourly = [point(start, 0, { secondarySwellHeightFt: null, waveHeightFt: null })];
    const [today] = buildDailyForecast(hourly, null, TZ, 5);
    expect(today.secondaryMaxFt).toBeNull();
    expect(today.wvht.minFt).toBeNull();
    expect(today.wvht.maxFt).toBeNull();
  });

  it('returns an empty array for empty input', () => {
    expect(buildDailyForecast([], null, TZ, 5)).toEqual([]);
  });
});
