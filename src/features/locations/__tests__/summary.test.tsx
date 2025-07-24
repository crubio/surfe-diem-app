import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import LocationSummary from '../summary';
import * as api from '../api/locations';

vi.mock('../api/locations');

describe('<LocationSummary />', () => {
  it('renders location summary and latest observation', async () => {
    const mockObservation = [
      {
        wave_height: '3.6 ft',
        peak_period: '18 sec',
        water_temp: '68.9 °F',
      },
    ];
    vi.mocked(api.getLatestObservation).mockResolvedValueOnce(mockObservation);
    const queryClient = new QueryClient();
    const buoy = {
      name: 'Test Buoy',
      url: '',
      active: true,
      description: 'A test buoy',
      location: '0,0',
      location_id: 'loc1',
      id: 1,
      date_created: '',
      date_updated: '',
    };
    render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <LocationSummary locationSummary={buoy} />
        </QueryClientProvider>
      </MemoryRouter>
    );
    expect((await screen.findAllByText(/Test Buoy/i)).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/A test buoy/i)).toBeInTheDocument();
    expect(screen.getByText(/3.6 ft/i)).toBeInTheDocument();
    expect(screen.getByText(/18 sec/i)).toBeInTheDocument();
    expect(screen.getByText(/68.9 °F/i)).toBeInTheDocument();
  });
}); 