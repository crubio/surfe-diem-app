import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CurrentHourForecast } from '../current_hour_forecast';

const mockForecast = {
  hourly: {
    time: ['2023-01-01T00:00:00Z'],
    swell_wave_height: [2.1],
    swell_wave_period: [10],
    swell_wave_direction: [270],
  },
  hourly_units: { wave_direction: 'deg' },
};

describe('<CurrentHourForecast />', () => {
  it('renders hourly forecast data', () => {
    render(<CurrentHourForecast forecast={mockForecast} />);
    expect(screen.getByText(/swell height/i)).toBeInTheDocument();
    expect(screen.getByText(/2.1 ft/i)).toBeInTheDocument();
    expect(screen.getByText(/270deg/i)).toBeInTheDocument();
    expect(screen.getByText(/10/i)).toBeInTheDocument();
  });
}); 