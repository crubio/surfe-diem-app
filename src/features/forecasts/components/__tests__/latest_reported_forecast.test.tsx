import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LatestReportedForecast } from '../latest_reported_forecast';

describe('<LatestReportedForecast />', () => {
  it('renders reported forecast data', () => {
    const wave = { wave_height: '3.0 ft', peak_period: '14 sec', water_temp: '59.4 °F' };
    const swell = { swell_height: '1.6 ft', period: '14.3 sec', direction: 'SSW' };
    const wind = { wind_wave_height: '2.6 ft', period: '4.7 sec', direction: 'W' };
    render(<LatestReportedForecast {...[wave, swell, wind]} />);
    expect(screen.getByText(/overall height/i)).toBeInTheDocument();
    expect(screen.getByText(/3.0 ft/i)).toBeInTheDocument();
    expect(screen.getByText(/swell/i)).toBeInTheDocument();
    expect(screen.getByText(/1.6 ft/i)).toBeInTheDocument();
    expect(screen.getByText(/wind/i)).toBeInTheDocument();
    expect(screen.getByText(/2.6 ft/i)).toBeInTheDocument();
  });
}); 