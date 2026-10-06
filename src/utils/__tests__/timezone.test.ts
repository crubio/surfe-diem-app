import { vi } from 'vitest';
import { DateTime } from 'luxon';
import { getZoneAbbreviation, formatLocationTime } from '../timezone';
import { toNoaaDate } from '@features/tides/api/tide-explorer';

describe('Location-local time', () => {
  // 2026-07-15 21:06 UTC = 2:06 PM PDT = 5:06 PM EDT = 11:06 AM HST
  const summerInstant = '2026-07-15T21:06:00Z';

  describe('getZoneAbbreviation', () => {
    it('should give DST-aware US abbreviations', () => {
      expect(getZoneAbbreviation('America/Los_Angeles', new Date(summerInstant))).toBe('PDT');
      expect(getZoneAbbreviation('America/Los_Angeles', new Date('2026-01-15T21:06:00Z'))).toBe('PST');
      expect(getZoneAbbreviation('America/New_York', new Date(summerInstant))).toBe('EDT');
      expect(getZoneAbbreviation('Pacific/Honolulu', new Date(summerInstant))).toBe('HST');
    });

    it('should accept a Luxon DateTime', () => {
      expect(getZoneAbbreviation('America/New_York', DateTime.fromISO(summerInstant))).toBe('EDT');
    });
  });

  describe('formatLocationTime', () => {
    it('should show the location\'s wall clock, not the viewer\'s', () => {
      expect(formatLocationTime(summerInstant, 'America/Los_Angeles')).toBe('2:06 PM PDT');
      expect(formatLocationTime(summerInstant, 'America/New_York')).toBe('5:06 PM EDT');
      expect(formatLocationTime(new Date(summerInstant), 'Pacific/Honolulu')).toBe('11:06 AM HST');
    });

    it('should honor an explicit offset in the ISO string', () => {
      expect(formatLocationTime('2026-10-06T00:40:00+00:00', 'America/Los_Angeles')).toBe('5:40 PM PDT');
    });

    it('should return empty string for missing or invalid input', () => {
      expect(formatLocationTime(undefined, 'America/Los_Angeles')).toBe('');
      expect(formatLocationTime('not a date', 'America/Los_Angeles')).toBe('');
    });
  });

  describe('toNoaaDate', () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it('should use the location\'s calendar day, not the viewer\'s', () => {
      // 05:00 UTC = 1 AM EDT on the 16th, but still 7 PM HST on the 15th
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-07-16T05:00:00Z'));
      expect(toNoaaDate('America/New_York')).toBe('20260716');
      expect(toNoaaDate('Pacific/Honolulu')).toBe('20260715');
      expect(toNoaaDate('Pacific/Honolulu', 5)).toBe('20260720');
    });
  });
});
