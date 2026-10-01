/**
 * Helpers for NOAA/Tide Explorer timestamps.
 *
 * NOAA returns tide prediction times as "YYYY-MM-DD HH:MM" in the *station's*
 * local time zone, with no timezone suffix. Routing that through `Date`/dayjs
 * (which assume either UTC or the viewer's browser zone) silently shifts the
 * displayed time by the UTC offset. Since we only ever need to display the
 * digits NOAA already gave us — not convert between zones — we parse and
 * format them directly as strings instead.
 */

const NOAA_TIME_RE = /^(\d{4}-\d{2}-\d{2}) (\d{2}):(\d{2})$/;

export interface ParsedNoaaTime {
  dateKey: string; // "YYYY-MM-DD", safe to use for local-day bucketing
  hour: number;
  minute: number;
}

export const parseNoaaLocalTime = (t: string | undefined | null): ParsedNoaaTime | null => {
  if (!t) return null;
  const match = NOAA_TIME_RE.exec(t);
  if (!match) return null;
  return { dateKey: match[1], hour: Number(match[2]), minute: Number(match[3]) };
};

/** "14:07" -> "2:07 PM", using the station-local digits as given (no timezone conversion). */
export const formatNoaaTime12h = (t: string | undefined | null): string => {
  const parsed = parseNoaaLocalTime(t);
  if (!parsed) return '';
  const period = parsed.hour >= 12 ? 'PM' : 'AM';
  const hour12 = parsed.hour % 12 === 0 ? 12 : parsed.hour % 12;
  return `${hour12}:${String(parsed.minute).padStart(2, '0')} ${period}`;
};

/** "YYYY-MM-DD" local-day key for bucketing predictions by calendar day. */
export const noaaDateKey = (t: string | undefined | null): string | null => {
  return parseNoaaLocalTime(t)?.dateKey ?? null;
};
