import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NDBCObservationCard } from '../components/ndbc-observation-card';

describe('<NDBCObservationCard /> reading time', () => {
  it('shows a fresh reading as current, with its local time', () => {
    render(
      <NDBCObservationCard
        stationId="46284"
        timezone="America/Los_Angeles"
        observation={{ observed_at: '2026-10-12T16:12:00+00:00', is_stale: false, wave_height: '4.6 ft' }}
      />
    );
    expect(screen.getByText('As of 9:12 AM PDT')).toBeInTheDocument();
  });

  it('labels a stale reading with its date and that the buoy may be offline', () => {
    render(
      <NDBCObservationCard
        stationId="41069"
        timezone="America/New_York"
        observation={{ observed_at: '2026-09-09T14:00:00+00:00', is_stale: true, wave_height: '2.0 ft' }}
      />
    );
    expect(screen.getByText('Last reading Sep 9, 10:00 AM EDT · buoy may be offline')).toBeInTheDocument();
  });
});
