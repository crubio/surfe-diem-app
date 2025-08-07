import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CurrentForecast } from '../current_forecast';

const mockForecast = {
  current: {
    time: '2023-01-01T00:00:00Z',
    interval: 1,
    swell_wave_height: 4.2,
    swell_wave_direction: 270,
    swell_wave_period: 12,
    wind_wave_height: 2.1,
    wind_wave_direction: 180,
    wind_wave_period: 8,
    sea_surface_temperature: 65,
  },
  current_units: {
    swell_wave_height: 'ft',
    swell_wave_direction: 'deg',
    swell_wave_period: 's',
    wind_wave_height: 'ft',
    wind_wave_direction: 'deg',
    wind_wave_period: 's',
    sea_surface_temperature: 'f',
  },
};

describe('<CurrentForecast />', () => {
  it('renders forecast data', () => {
    render(<CurrentForecast forecast={mockForecast} />);
    expect(screen.getByText(/swell height/i)).toBeInTheDocument();
    expect(screen.getByText(/4.2ft/i)).toBeInTheDocument();
    expect(screen.getByText(/270deg/i)).toBeInTheDocument();
    expect(screen.getByText(/12s/i)).toBeInTheDocument();
  });
}); 