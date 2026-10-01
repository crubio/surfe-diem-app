/**
 * Tide data processing utilities
 */

import { DateTime } from "luxon";
import { TidesDataDaily, TidesDataCurrent } from "@features/tides/api/tides";

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
  tidesData: TidesDataDaily,
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
 * Format time to next tide change
 * @param minutes Minutes until next change
 * @returns Formatted string
 */
export function formatTimeToNext(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minutes`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Get tide direction description
 * @param direction Rising or falling
 * @returns User-friendly description
 */
export function getTideDirectionDescription(direction: 'rising' | 'falling'): string {
  return direction === 'rising' ? 'Rising' : 'Falling';
}

/**
 * Get tide quality indicator based on rate of change
 * @param rateOfChange Rate of change in ft/hr
 * @returns Quality description
 */
export function getTideQualityDescription(rateOfChange: number): string {
  if (rateOfChange < 0.5) {
    return 'Slow change';
  } else if (rateOfChange < 1.0) {
    return 'Moderate change';
  } else {
    return 'Fast change';
  }
}

/**
 * Get current tide value from current tide data
 * @param currentTideData Current tide data from API
 * @returns Current tide height in feet, or null if data is invalid
 */
export function getCurrentTideValue(currentTideData: TidesDataCurrent): number | null {
  if (!currentTideData?.data || currentTideData.data.length === 0 ) {
    return null;
  }
  
  // Get the most recent tide reading (last index)
  const latestReading = currentTideData.data[currentTideData.data.length - 1];
  if (!latestReading?.v) {
    return null;
  }
  
  const tideValue = parseFloat(latestReading.v);
  return isNaN(tideValue) ? null : tideValue;
}

/**
 * Get current tide time from current tide data (converted from GMT to local)
 * @param currentTideData Current tide data from API
 * @returns Formatted local time string, or null if data is invalid
 */
export function getCurrentTideTime(currentTideData: TidesDataCurrent): string | null {
  if (!currentTideData?.data || currentTideData.data.length === 0) {
    return null;
  }
  
  // Get the most recent tide reading (last index)
  const latestReading = currentTideData.data[currentTideData.data.length - 1];
  if (!latestReading?.t) {
    return null;
  }
  
  try {
    // Parse GMT time and convert to local timezone
    const gmtTime = new Date(latestReading.t);
    // Check if the date is valid
    if (isNaN(gmtTime.getTime())) {
      return null;
    }
    
    return gmtTime.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  } catch (error) {
    return null;
  }
} 