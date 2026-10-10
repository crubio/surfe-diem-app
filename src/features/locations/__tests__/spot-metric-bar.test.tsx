import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SpotMetricBar } from '../components/spot-metric-bar';
import type { CurrentConditions } from '@/types/conditions';
import type { ParsedNWSCurrent } from 'utils/nws-parser';

// Pipeline, 2026-10-10: NW swell leads with buoy 51201's measured period; NWS forecast said 17 s
const pipeline = (overrides: Partial<CurrentConditions> = {}): CurrentConditions =>
  ({
    primary_swell_height: 1.2192,
    primary_swell_period: 10.5,
    primary_swell_period_source: 'buoy',
    primary_swell_direction: 320,
    secondary_swell_height: 0.9144,
    secondary_swell_period: 16,
    secondary_swell_period_source: 'nws',
    secondary_swell_direction: 200,
    buoy_wave_station: '51201',
    swell_power: 327.8,
    total_power: 500,
    swell_power_source: 'nws',
    wind_speed: 10,
    ...overrides,
  }) as unknown as CurrentConditions;

const forecastNow = { primary_swell_height: 4, primary_swell_period: 17, primary_swell_direction: 320, wind_speed: 10 } as ParsedNWSCurrent;

const renderBar = (conditions: CurrentConditions | null) =>
  render(
    <SpotMetricBar
      current={forecastNow}
      tideHeightFt={null}
      isNWSLoading={false}
      isTideLoading={false}
      conditions={conditions}
    />
  );

describe('<SpotMetricBar /> swell tiles', () => {
  it('shows the measured buoy period from /conditions, not the forecast period', () => {
    renderBar(pipeline());
    expect(screen.getByText('11s')).toBeInTheDocument();      // 10.5 s rounded
    expect(screen.queryByText('17s')).not.toBeInTheDocument();
    expect(screen.getByText('Measured · buoy 51201')).toBeInTheDocument();
  });

  it('shows the second swell with its period and direction', () => {
    renderBar(pipeline());
    expect(screen.getByText('Second swell')).toBeInTheDocument();
    expect(screen.getByText('3.0ft')).toBeInTheDocument();
    expect(screen.getByText('16s · SSW')).toBeInTheDocument();
  });

  it('shows the second swell without a period when the API has none', () => {
    renderBar(pipeline({ secondary_swell_period: null, secondary_swell_period_source: null }));
    expect(screen.getByText('SSW')).toBeInTheDocument();
  });

  it('hides the second swell tile when it is under half a foot', () => {
    renderBar(pipeline({ secondary_swell_height: 0.1 }));
    expect(screen.queryByText('Second swell')).not.toBeInTheDocument();
  });

  it('falls back to the forecast while /conditions is not loaded', () => {
    renderBar(null);
    expect(screen.getByText('17s')).toBeInTheDocument();
    expect(screen.queryByText(/Measured/)).not.toBeInTheDocument();
  });
});
