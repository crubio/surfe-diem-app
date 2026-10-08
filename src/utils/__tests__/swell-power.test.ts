import { getSwellPowerBand, formatSwellPower, waveEnergyFluxKwPerMeter, getDisplaySwell, SWELL_POWER_BANDS } from '../swell-power';
import type { CurrentConditions } from '@/types/conditions';

describe('swell power bands', () => {
  it('should pick the band by inclusive lower / exclusive upper edge', () => {
    expect(getSwellPowerBand(0)?.label).toBe('Minimal');
    expect(getSwellPowerBand(99.9)?.label).toBe('Minimal');
    expect(getSwellPowerBand(100)?.label).toBe('Light');
    expect(getSwellPowerBand(461)?.label).toBe('Moderate'); // archive median
    expect(getSwellPowerBand(2000)?.label).toBe('Powerful');
    expect(getSwellPowerBand(50000)?.label).toBe('Heavy');
  });

  it('should return null for no reading', () => {
    expect(getSwellPowerBand(null)).toBeNull();
    expect(getSwellPowerBand(undefined)).toBeNull();
    expect(getSwellPowerBand(-1)).toBeNull();
    expect(formatSwellPower(null)).toBeNull();
  });

  it('should treat a real zero as Minimal, not missing', () => {
    expect(formatSwellPower(0)).toBe('Minimal · 0');
  });

  it('should format label and rounded value', () => {
    expect(formatSwellPower(1300.6)).toBe('Solid · 1,301');
  });

  it('should have contiguous bands from 0 to Infinity', () => {
    SWELL_POWER_BANDS.forEach((band, i) => {
      if (i > 0) expect(band.min).toBe(SWELL_POWER_BANDS[i - 1].max);
    });
    expect(SWELL_POWER_BANDS[0].min).toBe(0);
    expect(SWELL_POWER_BANDS[SWELL_POWER_BANDS.length - 1].max).toBe(Infinity);
  });
});

describe('waveEnergyFluxKwPerMeter', () => {
  it('should apply 0.49 · H² · 0.9 · T', () => {
    expect(waveEnergyFluxKwPerMeter(1, 10)).toBeCloseTo(4.41, 2);
  });
});

describe('getDisplaySwell', () => {
  const base = {
    primary_swell_height: null,
    primary_swell_period: null,
    primary_swell_direction: null,
    buoy_swell_height: null,
    buoy_swell_period: null,
    buoy_swell_direction: null,
    buoy_wave_height: null,
    buoy_wave_period: null,
    buoy_wave_direction: null,
    buoy_wave_station: null,
    buoy_observed_at: null,
    swell_power_source: null,
  } as unknown as CurrentConditions;

  it('should follow swell_power_source: buoy_bulk', () => {
    const swell = getDisplaySwell({
      ...base,
      swell_power_source: 'buoy_bulk',
      buoy_wave_height: 1.2,
      buoy_wave_period: 11,
      buoy_wave_station: '44085',
      buoy_observed_at: '2026-10-07T19:30:00Z',
    });
    expect(swell).toMatchObject({ heightM: 1.2, periodS: 11, source: 'buoy_bulk', station: '44085' });
  });

  it('should use NWS primary when the source is nws', () => {
    const swell = getDisplaySwell({ ...base, swell_power_source: 'nws', primary_swell_height: 0.6, primary_swell_period: 14 });
    expect(swell).toMatchObject({ heightM: 0.6, periodS: 14, source: 'nws', station: null });
  });

  it('should fall back to an NWS height with no power source (no period)', () => {
    expect(getDisplaySwell({ ...base, primary_swell_height: 0.3 })?.source).toBe('nws');
  });

  it('should return null with nothing to show', () => {
    expect(getDisplaySwell(base)).toBeNull();
  });
});
