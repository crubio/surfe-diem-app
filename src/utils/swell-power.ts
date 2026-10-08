/**
 * Swell power display helpers.
 *
 * swell_power is the API's surf-quality index, 2 × height(m)² × period(s)²:
 * unitless, groundswell-weighted. Band edges and the evidence behind them are
 * in surfe-diem-api docs/wave-math.md ("Swell power bands").
 */
import type { CurrentConditions } from '@/types/conditions';

export type SwellPowerSource = 'nws' | 'buoy_spec' | 'buoy_bulk';

export interface SwellPowerBand {
  label: string;
  /** Inclusive lower bound of the band's index range */
  min: number;
  /** Exclusive upper bound; Infinity for the top band */
  max: number;
  /** Rough surfer-recognizable equivalent, for the explainer's legend */
  example: string;
}

/** Judgment-chosen edges, checked against 19 years of CA buoy data (see docs). */
export const SWELL_POWER_BANDS: SwellPowerBand[] = [
  { label: 'Minimal', min: 0, max: 100, example: '2 ft @ 8 s' },
  { label: 'Light', min: 100, max: 300, example: '3 ft @ 10 s' },
  { label: 'Moderate', min: 300, max: 800, example: '3 ft @ 14 s' },
  { label: 'Solid', min: 800, max: 2000, example: '5 ft @ 14 s' },
  { label: 'Powerful', min: 2000, max: 5000, example: '8 ft @ 16 s' },
  { label: 'Heavy', min: 5000, max: Infinity, example: '12 ft @ 18 s' },
];

/** Band for a swell power value; null when there's no reading. */
export function getSwellPowerBand(power: number | null | undefined): SwellPowerBand | null {
  if (power == null || power < 0 || Number.isNaN(power)) return null;
  return SWELL_POWER_BANDS.find((band) => power >= band.min && power < band.max) ?? null;
}

/** "Moderate · 328", or null when there's no reading. */
export function formatSwellPower(power: number | null | undefined): string | null {
  const band = getSwellPowerBand(power);
  if (!band || power == null) return null;
  return `${band.label} · ${Math.round(power).toLocaleString('en-US')}`;
}

/**
 * Physics deep-water wave energy flux, kW per meter of wave crest:
 * 0.49 · H² · Te with Te ≈ 0.9 · T. For the explainer only, as grounding;
 * it ranks sea states like the index ~96% of the time but isn't the index.
 */
export function waveEnergyFluxKwPerMeter(heightM: number, periodS: number): number {
  return 0.49 * heightM * heightM * 0.9 * periodS;
}

/** The swell a card should show, matching the API's swell_power_source order. */
export interface DisplaySwell {
  heightM: number;
  periodS: number | null;
  direction: number | null; // degrees
  source: SwellPowerSource;
  /** Buoy that measured it; null for NWS (modeled at the spot) */
  station: string | null;
  /** ISO UTC time of the buoy reading; null for NWS */
  observedAt: string | null;
}

/**
 * NWS primary swell when the API used it for power, else the buoy's measured
 * swell split (.spec), else the buoy's combined reading. Same order as the
 * API, so the height/period shown always match the power number beside it.
 * Falls back to NWS primary height alone when there's no power source at all
 * (e.g. NWS gave a height but no period).
 */
export function getDisplaySwell(conditions: CurrentConditions): DisplaySwell | null {
  const nws = (): DisplaySwell | null =>
    conditions.primary_swell_height != null
      ? {
          heightM: conditions.primary_swell_height,
          periodS: conditions.primary_swell_period,
          direction: conditions.primary_swell_direction,
          source: 'nws',
          station: null,
          observedAt: null,
        }
      : null;

  switch (conditions.swell_power_source) {
    case 'buoy_spec':
      if (conditions.buoy_swell_height != null) {
        return {
          heightM: conditions.buoy_swell_height,
          periodS: conditions.buoy_swell_period,
          direction: conditions.buoy_swell_direction,
          source: 'buoy_spec',
          station: conditions.buoy_wave_station,
          observedAt: conditions.buoy_observed_at,
        };
      }
      return nws();
    case 'buoy_bulk':
      if (conditions.buoy_wave_height != null) {
        return {
          heightM: conditions.buoy_wave_height,
          periodS: conditions.buoy_wave_period,
          direction: conditions.buoy_wave_direction,
          source: 'buoy_bulk',
          station: conditions.buoy_wave_station,
          observedAt: conditions.buoy_observed_at,
        };
      }
      return nws();
    default:
      return nws();
  }
}
