import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DailyForecast } from '../daily_forecast';

const mockForecast = {
  daily: {
    time: ['2023-01-01'],
    wave_height_max: [5.0],
    swell_wave_height_max: [4.2],
    swell_wave_direction_dominant: [270],
    swell_wave_period_max: [12],
  },
};

describe('<DailyForecast />', () => {
  it('renders daily forecast data', () => {
    render(<DailyForecast forecast={mockForecast} />);
    expect(screen.getByText(/swell height/i)).toBeInTheDocument();
    expect(screen.getByText(/4.2 ft/i)).toBeInTheDocument();
  });
}); 