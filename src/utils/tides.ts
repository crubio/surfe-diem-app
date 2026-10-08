/**
 * Tide data processing utilities
 */

import { DateTime } from "luxon";
import type { TideChartPoint, TidePrediction } from "@features/tides/api/tide-explorer";

export interface TideState {
  currentHeight: number;
  direction: 'rising' | 'falling';
  rateOfChange: number; // ft/hr
  timeToNext: number; // minutes
  nextType: 'H' | 'L';
  nextHeight: number;
  nextTime: string;
}

const NOAA_TIME_RE = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/;

/**
 * Parses a NOAA prediction timestamp ("YYYY-MM-DD HH:MM", station-local, no
 * timezone suffix) into a number that can be diffed against `nowInStationFrame`
 * below. We deliberately treat the wall-clock digits as UTC (via `Date.UTC`)
 * rather than running them through plain `new Date(t)`, which browsers parse
 * in the *viewer's* local timezone — silently corrupting the bracket/diff math
 * for any viewer not in the station's zone. Since both sides of every diff use
 * this same "pretend UTC" convention, the real UTC offset cancels out and
 * doesn't need to be known.
 */
function parsePredictionTime(t: string): number {
  const match = NOAA_TIME_RE.exec(t);
  if (!match) return new Date(t).getTime(); // best-effort fallback for unexpected formats
  const [, y, mo, d, h, mi] = match;
  return Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi));
}

/**
 * Expresses `currentTime` as the equivalent "pretend UTC" value used by
 * `parsePredictionTime`, so the two are comparable. Without a `timezone`, we
 * fall back to the real instant — matching this function's pre-existing
 * (browser-timezone-dependent) behavior for callers that don't supply one.
 */
function nowInStationFrame(currentTime: Date, timezone?: string): number {
  if (!timezone) return currentTime.getTime();
  const local = DateTime.fromJSDate(currentTime).setZone(timezone);
  return Date.UTC(local.year, local.month - 1, local.day, local.hour, local.minute);
}

/**
 * Calculate current tide state from predictions
 * @param tidesData Tide predictions data
 * @param currentTime Current timestamp (defaults to now)
 * @param timezone Station/spot IANA timezone (e.g. "America/Los_Angeles"). When
 *   supplied, predictions and `currentTime` are compared in that zone's wall
 *   clock, matching how NOAA's station-local timestamps are meant to be read.
 *   When omitted, falls back to the legacy (viewer-timezone-dependent) behavior.
 * @returns TideState with current conditions
 */
export function calculateCurrentTideState(
  tidesData: { predictions: TidePrediction[] },
  currentTime: Date = new Date(),
  timezone?: string
): TideState | null {
  if (!tidesData.predictions || tidesData.predictions.length === 0) {
    return null;
  }

  const predictions = tidesData.predictions;
  const now = timezone ? nowInStationFrame(currentTime, timezone) : currentTime.getTime();
  const parseTime = (t: string) => (timezone ? parsePredictionTime(t) : new Date(t).getTime());

  // Find the two predictions that bracket the current time
  let beforePrediction = null;
  let afterPrediction = null;

  for (let i = 0; i < predictions.length; i++) {
    const predTime = parseTime(predictions[i].t);

    if (predTime <= now) {
      beforePrediction = predictions[i];
    } else {
      afterPrediction = predictions[i];
      break;
    }
  }

  // If we're at the end of the day, wrap around to first prediction of next day
  if (!afterPrediction && predictions.length > 0) {
    afterPrediction = predictions[0];
  }

  if (!beforePrediction || !afterPrediction) {
    return null;
  }

  const beforeTime = parseTime(beforePrediction.t);
  const afterTime = parseTime(afterPrediction.t);
  const beforeHeight = parseFloat(beforePrediction.v);
  const afterHeight = parseFloat(afterPrediction.v);

  // Calculate current height by linear interpolation
  const timeDiff = afterTime - beforeTime;
  const heightDiff = afterHeight - beforeHeight;
  const elapsed = now - beforeTime;
  const currentHeight = beforeHeight + (heightDiff * elapsed / timeDiff);

  // Determine direction
  const direction = heightDiff > 0 ? 'rising' : 'falling';

  // Calculate rate of change (ft/hr)
  const rateOfChange = Math.abs(heightDiff) / (timeDiff / (1000 * 60 * 60));

  // Calculate time to next change
  const timeToNext = Math.round((afterTime - now) / (1000 * 60));

  return {
    currentHeight,
    direction,
    rateOfChange,
    timeToNext,
    nextType: afterPrediction.type as 'H' | 'L',
    nextHeight: afterHeight,
    nextTime: afterPrediction.t
  };
}

/**
 * Latest tide reading at or before `currentTime` from a Tide Explorer
 * /tides/recent series. Not simply the last element: for stations without a
 * water-level sensor the series is an interpolated prediction curve running to
 * the end of today, so it includes future points.
 * @param series 6-minute points with station-local "YYYY-MM-DD HH:MM" times
 * @param currentTime Current timestamp (defaults to now)
 * @param timezone Station IANA timezone — see calculateCurrentTideState
 * @returns Height (ft) and its station-local timestamp, or null if none qualify
 */
export function getLatestTideReading(
  series: TideChartPoint[] | undefined,
  currentTime: Date = new Date(),
  timezone?: string
): { height: number; t: string } | null {
  if (!series || series.length === 0) return null;

  const now = timezone ? nowInStationFrame(currentTime, timezone) : currentTime.getTime();
  const parseTime = (t: string) => (timezone ? parsePredictionTime(t) : new Date(t).getTime());

  for (let i = series.length - 1; i >= 0; i--) {
    const point = series[i];
    if (parseTime(point.t) > now) continue;
    const height = parseFloat(point.v);
    if (!isNaN(height)) return { height, t: point.t };
  }
  return null;
}

/**
 * Get tide direction description
 * @param direction Rising or falling
 * @returns User-friendly description
 */
export function getTideDirectionDescription(direction: 'rising' | 'falling'): string {
  return direction === 'rising' ? 'Rising' : 'Falling';
}

