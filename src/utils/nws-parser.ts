/**
 * NWS Forecast Parser Utilities
 *
 * Handles parsing of NWS API ISO 8601 duration format and time-series data.
 * The NWS API returns time intervals in the format:
 * "2025-12-29T08:00:00+00:00/PT4H" where:
 * - Before the slash: ISO 8601 datetime (in UTC)
 * - After the slash: ISO 8601 duration (PT4H = 4 hours, P1D = 1 day, P1DT6H = 1 day 6 hours)
 *
 * Luxon handles both parsing and timezone conversions seamlessly.
 */

import { DateTime, Duration, Interval } from 'luxon';
import type { NWSDataPoint } from '@/types';
import { METERS_TO_FEET } from './constants/unit-conversions';

/**
 * Parses an ISO 8601 interval string (validTime format from NWS)
 * 
 * @param validTime - ISO interval string like "2025-12-29T08:00:00+00:00/PT4H"
 * @param timezone - Target timezone (e.g., "America/Los_Angeles")
 * @returns Object with start, end times and duration in local timezone
 * 
 * @example
 * const parsed = parseNWSValidTime("2025-12-29T08:00:00+00:00/PT4H", "America/Los_Angeles");
 * // {
 * //   start: DateTime in PT,
 * //   end: DateTime in PT,
 * //   duration: Duration object,
 * //   hours: 4
 * // }
 */
export const parseNWSValidTime = (
  validTime: string,
  timezone: string
) => {
  const interval = Interval.fromISO(validTime);
  const startInLocal = interval.start?.setZone(timezone) || null;
  const endInLocal = interval.end?.setZone(timezone) || null;
  const duration = interval.toDuration();

  return {
    start: startInLocal,
    end: endInLocal,
    duration,
    hours: duration.as('hours'),
    minutes: duration.as('minutes'),
    seconds: duration.as('seconds'),
  };
};

/**
 * Parses just the duration component of validTime
 * Useful when you only need the duration, not the time bounds
 * 
 * @param validTime - ISO interval string like "2025-12-29T08:00:00+00:00/PT4H"
 * @returns Duration object with helper methods
 * 
 * @example
 * const duration = parseNWSDuration("2025-12-29T08:00:00+00:00/PT4H");
 * console.log(duration.as('hours')); // 4
 * console.log(duration.toISO()); // "PT4H"
 */
export const parseNWSDuration = (validTime: string): Duration => {
  const durationPart = validTime.split('/')[1];
  return Duration.fromISO(durationPart);
};

/**
 * Converts meters to feet
 * NWS returns all wave height in meters, app displays in feet
 * 
 * @param meters - Value in meters
 * @returns Value in feet
 */
export const metersToFeet = (meters: number): number => {
  return meters * METERS_TO_FEET;
};

/**
 * Finds the most recent data point from NWS time-series data
 * NWS returns multiple data points, each with a validTime interval.
 * This function finds the one closest to "now" in the target timezone.
 * 
 * @param dataPoints - Array of NWSDataPoint objects
 * @param timezone - Target timezone for comparison
 * @returns The most recent data point, or undefined if array is empty
 * 
 * @example
 * const current = findCurrentDataPoint(waveData.wave_height, "America/Los_Angeles");
 * console.log(current?.value); // 0.3048 (in meters)
 */
export const findCurrentDataPoint = (
  dataPoints: NWSDataPoint[],
  timezone: string
): NWSDataPoint | undefined => {
  if (!dataPoints || dataPoints.length === 0) return undefined;

  const now = DateTime.now().setZone(timezone);

  // Find the point whose interval contains "now"
  let closest: NWSDataPoint | undefined;
  let closestDistance = Infinity;

  for (const point of dataPoints) {
    const parsed = parseNWSValidTime(point.validTime, timezone);
    
    // Skip if we couldn't parse valid times
    if (!parsed.start || !parsed.end) continue;
    
    const distanceToStart = Math.abs(now.diff(parsed.start).toMillis());

    // Prefer points that contain "now"
    if (parsed.start <= now && now < parsed.end) {
      return point;
    }

    // Otherwise, return the closest to now
    if (distanceToStart < closestDistance) {
      closestDistance = distanceToStart;
      closest = point;
    }
  }

  return closest;
};

/**
 * Groups NWS data points by hour (for hourly forecasts)
 * Returns an array of hourly data points, with null values where data is missing
 * 
 * @param dataPoints - Array of NWSDataPoint objects
 * @param timezone - Target timezone
 * @param hours - Number of hours to include in forecast
 * @returns Array of hourly data points
 * 
 * @example
 * const hourlyData = groupNWSDataByHour(waveData.wave_height, "America/Los_Angeles", 24);
 * // [
 * //   { hour: 0, validTime: "...", value: 0.5 },
 * //   { hour: 1, validTime: "...", value: null },
 * //   ...
 * // ]
 */
export const groupNWSDataByHour = (
  dataPoints: NWSDataPoint[],
  timezone: string,
  hours: number = 168 // Default 7 days
): Array<{ hour: number; validTime: string | null; value: number | null }> => {
  const result: Array<{ hour: number; validTime: string | null; value: number | null }> = [];
  const now = DateTime.now().setZone(timezone).startOf('hour');

  for (let i = 0; i < hours; i++) {
    const targetHour = now.plus({ hours: i });
    const targetEnd = targetHour.plus({ hours: 1 });

    // Find data point that covers this hour
    const matchingPoint = dataPoints.find((point) => {
      const parsed = parseNWSValidTime(point.validTime, timezone);
      // Skip if we couldn't parse valid times
      if (!parsed.start || !parsed.end) return false;
      // Check if this interval overlaps with our target hour
      return parsed.start < targetEnd && parsed.end > targetHour;
    });

    result.push({
      hour: i,
      validTime: targetHour.toISO(),
      value: matchingPoint?.value ?? null,
    });
  }

  return result;
};

/**
 * Calculates combined swell height from primary + secondary swells
 * NWS provides both separately; users typically care about total
 * 
 * @param primaryHeight - Primary swell height value (meters)
 * @param secondaryHeight - Secondary swell height value (meters)
 * @returns Combined swell height in feet
 * 
 * @example
 * const totalSwell = calculateTotalSwell(0.6096, 0.3048);
 * console.log(totalSwell); // 3.0 (feet)
 */
export const calculateTotalSwell = (
  primaryHeight: number | null | undefined,
  secondaryHeight: number | null | undefined
): number => {
  const primary = primaryHeight ?? 0;
  const secondary = secondaryHeight ?? 0;
  return metersToFeet(primary + secondary);
};

/**
 * Determines dominant swell direction when both primary and secondary exist
 * Weighted by height (taller swell gets priority)
 * 
 * @param primaryDir - Primary swell direction (degrees 0-360)
 * @param primaryHeight - Primary swell height (any units)
 * @param secondaryDir - Secondary swell direction (degrees 0-360)
 * @param secondaryHeight - Secondary swell height (any units)
 * @returns Dominant direction (degrees)
 * 
 * @example
 * const dir = getDominantSwellDirection(280, 0.5, 200, 0.3);
 * console.log(dir); // 280 (primary is taller)
 */
export const getDominantSwellDirection = (
  primaryDir: number | null | undefined,
  primaryHeight: number | null | undefined,
  secondaryDir: number | null | undefined,
  secondaryHeight: number | null | undefined
): number | null => {
  const primary = primaryHeight ?? 0;
  const secondary = secondaryHeight ?? 0;

  if (primary === 0 && secondary === 0) return null;
  if (primary >= secondary) return primaryDir ?? null;
  return secondaryDir ?? null;
};

/**
 * Type for parsed "current" forecast data
 * Converts NWS data to the format your components expect
 */
export interface ParsedNWSCurrent {
  timestamp: DateTime;
  swell_wave_height: number; // feet
  swell_wave_period: number; // seconds
  swell_wave_direction: number; // degrees
  primary_swell_height: number; // feet
  secondary_swell_height: number; // feet
  wind_wave_height: number; // feet
  wind_wave_period?: number; // seconds
}

/**
 * Converts NWS raw data to a "current" forecast object
 * Finds the current values for all metrics and converts units
 * 
 * @param nwsData - Raw NWSWaveData object from API
 * @param timezone - Target timezone
 * @returns ParsedNWSCurrent object ready for UI
 */
export const buildCurrentForecast = (
  nwsData: {
    wave_height?: NWSDataPoint[];
    wave_period?: NWSDataPoint[];
    wave_direction?: NWSDataPoint[];
    primary_swell_height?: NWSDataPoint[];
    primary_swell_direction?: NWSDataPoint[];
    primary_swell_period?: NWSDataPoint[];
    secondary_swell_height?: NWSDataPoint[];
    secondary_swell_direction?: NWSDataPoint[];
    wind_wave_height?: NWSDataPoint[];
  },
  timezone: string
): ParsedNWSCurrent => {
  const primaryHeight = findCurrentDataPoint(nwsData.primary_swell_height || [], timezone)?.value;
  const secondaryHeight = findCurrentDataPoint(nwsData.secondary_swell_height || [], timezone)?.value;
  const primaryDir = findCurrentDataPoint(nwsData.primary_swell_direction || [], timezone)?.value;
  const secondaryDir = findCurrentDataPoint(nwsData.secondary_swell_direction || [], timezone)?.value;
  const primaryPeriod = findCurrentDataPoint(nwsData.primary_swell_period || [], timezone)?.value;
  const windHeight = findCurrentDataPoint(nwsData.wind_wave_height || [], timezone)?.value;

  return {
    timestamp: DateTime.now().setZone(timezone),
    swell_wave_height: calculateTotalSwell(primaryHeight, secondaryHeight),
    swell_wave_period: primaryPeriod ?? 0,
    swell_wave_direction: getDominantSwellDirection(
      primaryDir,
      primaryHeight,
      secondaryDir,
      secondaryHeight
    ) ?? 0,
    primary_swell_height: metersToFeet(primaryHeight ?? 0),
    secondary_swell_height: metersToFeet(secondaryHeight ?? 0),
    wind_wave_height: metersToFeet(windHeight ?? 0),
  };
};
