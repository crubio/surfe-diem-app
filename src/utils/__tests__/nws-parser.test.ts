/**
 * NWS parser utilities against a real /nws/forecast response shape.
 */
import { vi } from 'vitest';
import { buildCurrentForecast, parseNWSValidTime, groupNWSDataByHour, metersToFeet } from '../nws-parser';

// Shape of a real /nws/forecast response (spot 51, MTR grid)
const exampleNWSData = {
  spot_id: 51,
  latitude: 36.971492,
  longitude: -121.9486,
  grid_id: 'MTR',
  grid_x: 93,
  grid_y: 66,
  timezone: 'America/Los_Angeles',
  wave_data: {
    wave_height: [
      {
        validTime: '2025-12-29T08:00:00+00:00/P3DT4H',
        value: 0.3048,
      },
      {
        validTime: '2026-01-01T12:00:00+00:00/P2D',
        value: 0.6096,
      },
      {
        validTime: '2026-01-03T12:00:00+00:00/P1DT6H',
        value: 0.9144,
      },
    ],
    wave_period: [
      {
        validTime: '2025-12-29T08:00:00+00:00/PT22H',
        value: 7,
      },
      {
        validTime: '2025-12-30T06:00:00+00:00/PT6H',
        value: 8,
      },
    ],
    primary_swell_height: [
      {
        validTime: '2025-12-29T08:00:00+00:00/PT4H',
        value: 0.6096,
      },
      {
        validTime: '2025-12-29T12:00:00+00:00/PT12H',
        value: 0.3048,
      },
    ],
    primary_swell_direction: [
      {
        validTime: '2025-12-29T08:00:00+00:00/PT4H',
        value: 320,
      },
    ],
    primary_swell_period: [
      {
        validTime: '2025-12-29T08:00:00+00:00/PT4H',
        value: 10,
      },
    ],
    secondary_swell_height: [
      {
        validTime: '2025-12-29T08:00:00+00:00/PT22H',
        value: 0.3048,
      },
    ],
    wind_wave_height: [
      {
        validTime: '2025-12-29T08:00:00+00:00/P4DT10H',
        value: 0,
      },
    ],
  },
};

describe('NWS parser', () => {
  beforeEach(() => {
    // Inside the sample's first primary swell interval (08:00-12:00 UTC)
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-12-29T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('parseNWSValidTime', () => {
    it('should parse start, end and duration in the given timezone', () => {
      const parsed = parseNWSValidTime('2025-12-29T08:00:00+00:00/PT4H', 'America/Los_Angeles');
      expect(parsed.start!.toISO()).toBe('2025-12-29T00:00:00.000-08:00');
      expect(parsed.end!.toISO()).toBe('2025-12-29T04:00:00.000-08:00');
      expect(parsed.hours).toBe(4);
    });
  });

  describe('buildCurrentForecast', () => {
    it('should pick the values valid now and convert heights to feet', () => {
      const current = buildCurrentForecast(exampleNWSData.wave_data, exampleNWSData.timezone);
      expect(current.wave_height).toBeCloseTo(metersToFeet(0.3048), 5);
      expect(current.primary_swell_height).toBeCloseTo(metersToFeet(0.6096), 5);
      expect(current.primary_swell_period).toBe(10);
      expect(current.primary_swell_direction).toBe(320);
      expect(current.secondary_swell_height).toBeCloseTo(metersToFeet(0.3048), 5);
      expect(current.wind_wave_height).toBe(0);
    });
  });

  describe('groupNWSDataByHour', () => {
    it('should expand multi-hour intervals into hourly slots', () => {
      const hourly = groupNWSDataByHour(exampleNWSData.wave_data.wave_height, exampleNWSData.timezone, 24);
      expect(hourly).toHaveLength(24);
      // The first wave_height interval (P3DT4H) covers the whole 24 h window
      expect(hourly.every((slot) => slot.value === 0.3048)).toBe(true);
    });
  });
});
