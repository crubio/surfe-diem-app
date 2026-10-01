/**
 * Derives the 5-day text forecast from the same hourly NWS data that feeds the
 * chart, plus Tide Explorer hi/lo predictions. Pure/client-side — no extra
 * network calls beyond what the page already fetches.
 *
 * Primary swell is reported PEAK-first (locked decision, see
 * .docs/forecast-spot-plan.md §5.1/§5.2): the day's max height + the time it
 * occurs, with period/direction read from that same peak hour. The daily
 * min/max range is still computed and returned in case the card design has
 * room for it later — it's just not the headline number.
 */
import { DateTime } from 'luxon';
import type { NWSHourlyPoint } from 'utils/nws-parser';
import type { TidePrediction } from '@features/tides/api/tide-explorer';
import { parseNoaaLocalTime } from '@features/tides/utils';

export interface DailyForecastTide {
  type: 'H' | 'L';
  ft: number;
  time: string; // raw NOAA "YYYY-MM-DD HH:MM" — format with formatNoaaTime12h
}

export interface DailyForecastDay {
  dateKey: string;   // YYYY-MM-DD (spot-local)
  dayLabel: string;  // "Today" | "Wed"
  shortDate: string; // "Sep 12"
  primary: {
    peakFt: number | null;
    peakTime: DateTime | null;
    periodS: number | null;
    directionDeg: number | null;
    minFt: number | null;
    maxFt: number | null;
  };
  secondaryMaxFt: number | null;
  wvht: { minFt: number | null; maxFt: number | null };
  tides: DailyForecastTide[];
}

const definedValues = <T,>(points: NWSHourlyPoint[], getter: (p: NWSHourlyPoint) => T | null): T[] =>
  points.map(getter).filter((v): v is T => v !== null && v !== undefined);

export const buildDailyForecast = (
  hourly: NWSHourlyPoint[],
  tidePredictions: TidePrediction[] | null | undefined,
  timezone: string,
  days = 5
): DailyForecastDay[] => {
  if (!hourly.length) return [];

  // Bucket hourly NWS points by spot-local calendar day, preserving first-seen order
  // (hourly already starts at "now", so today — partial — comes first naturally).
  const byDay = new Map<string, NWSHourlyPoint[]>();
  const order: string[] = [];
  for (const point of hourly) {
    if (!point.validTime) continue;
    const dt = DateTime.fromISO(point.validTime, { zone: timezone });
    const key = dt.isValid ? dt.toISODate() : null;
    if (!key) continue;
    if (!byDay.has(key)) {
      byDay.set(key, []);
      order.push(key);
    }
    byDay.get(key)!.push(point);
  }

  // Bucket tide hi/lo events by the same local-day key (NOAA local-time string, no conversion needed).
  const tidesByDay = new Map<string, DailyForecastTide[]>();
  for (const p of tidePredictions ?? []) {
    const parsed = parseNoaaLocalTime(p.t);
    if (!parsed) continue;
    const ft = parseFloat(p.v);
    if (Number.isNaN(ft)) continue;
    const list = tidesByDay.get(parsed.dateKey) ?? [];
    list.push({ type: p.type, ft, time: p.t });
    tidesByDay.set(parsed.dateKey, list);
  }

  const todayKey = DateTime.now().setZone(timezone).toISODate();

  return order.slice(0, days).map((dateKey) => {
    const points = byDay.get(dateKey)!;
    const dt = DateTime.fromISO(dateKey, { zone: timezone });

    const primaryHeights = definedValues(points, (p) => p.primarySwellHeightFt);
    let peakFt: number | null = null;
    let peakTime: DateTime | null = null;
    let periodS: number | null = null;
    let directionDeg: number | null = null;

    if (primaryHeights.length) {
      const peakPoint = points.reduce((best, p) =>
        (p.primarySwellHeightFt ?? -Infinity) > (best.primarySwellHeightFt ?? -Infinity) ? p : best
      );
      peakFt = peakPoint.primarySwellHeightFt;
      peakTime = DateTime.fromISO(peakPoint.validTime, { zone: timezone });
      periodS = peakPoint.primarySwellPeriod;
      directionDeg = peakPoint.primarySwellDirection;
    }

    const secondaryHeights = definedValues(points, (p) => p.secondarySwellHeightFt);
    const wvhtHeights = definedValues(points, (p) => p.waveHeightFt);

    return {
      dateKey,
      dayLabel: dateKey === todayKey ? 'Today' : dt.toFormat('ccc'),
      shortDate: dt.toFormat('LLL d'),
      primary: {
        peakFt,
        peakTime,
        periodS,
        directionDeg,
        minFt: primaryHeights.length ? Math.min(...primaryHeights) : null,
        maxFt: primaryHeights.length ? Math.max(...primaryHeights) : null,
      },
      secondaryMaxFt: secondaryHeights.length ? Math.max(...secondaryHeights) : null,
      wvht: {
        minFt: wvhtHeights.length ? Math.min(...wvhtHeights) : null,
        maxFt: wvhtHeights.length ? Math.max(...wvhtHeights) : null,
      },
      tides: (tidesByDay.get(dateKey) ?? []).sort((a, b) => a.time.localeCompare(b.time)),
    };
  });
};
