import type { CurrentConditions } from '@/types/conditions';

/** Minimal /conditions payload with NWS primary swell and its swell_power. */
export const swellPowerFixture = (heightM: number, periodS: number): CurrentConditions =>
  ({
    primary_swell_height: heightM,
    primary_swell_period: periodS,
    primary_swell_direction: 270,
    wind_wave_height: null,
    wind_speed: 10,
    swell_power: 2 * heightM * heightM * periodS * periodS,
    total_power: 2 * heightM * heightM * periodS * periodS,
    swell_power_source: 'nws',
  }) as unknown as CurrentConditions;
