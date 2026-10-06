/**
 * Location-local time display.
 *
 * Every forecast, reading and prediction is shown in the *location's* local
 * time — never the viewer's — with a short zone label ("PDT", "EDT", "HST"),
 * so someone in New York looking at a California spot sees "2:06 PM PDT".
 * Pass the spot's IANA timezone (Spot.timezone) wherever a time is formatted.
 */
import { DateTime } from 'luxon';

/** Locale pinned so zone abbreviations come out as "PDT", not the viewer's locale's form. */
const LOCALE = 'en-US';

/**
 * Short zone abbreviation for `timezone` at `at` (DST-aware), e.g. "PDT" / "PST".
 * Some non-US zones have no common abbreviation and come out as "GMT-6".
 */
export const getZoneAbbreviation = (timezone: string, at: Date | DateTime = new Date()): string => {
  const dt = at instanceof Date ? DateTime.fromJSDate(at) : at;
  return dt.setZone(timezone).setLocale(LOCALE).toFormat('ZZZZ');
};

/**
 * Format an absolute instant (ISO string with offset/Z, Date, or DateTime) in
 * the location's zone with its abbreviation: "2:06 PM PDT".
 */
export const formatLocationTime = (
  value: string | Date | DateTime | null | undefined,
  timezone: string
): string => {
  if (!value) return '';
  const dt =
    value instanceof Date
      ? DateTime.fromJSDate(value)
      : typeof value === 'string'
        ? DateTime.fromISO(value, { setZone: true })
        : value;
  if (!dt.isValid) return '';
  return dt.setZone(timezone).setLocale(LOCALE).toFormat('h:mm a ZZZZ');
};
