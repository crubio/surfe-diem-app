import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import SpotGlance from '../spot-glance';
import * as api from '../api/locations';

vi.mock('../api/locations');

describe('<SpotGlance />', () => {
  it('renders closest spots', async () => {
    const mockSpots = [
      {
        id: 1,
        name: 'Test Spot',
        slug: 'test-spot',
        latitude: 0,
        longitude: 0,
        active: true,
        subregion_name: 'Region',
        timezone: 'PST',
      },
      {
        id: 2,
        name: 'Second Spot',
        slug: 'second-spot',
        latitude: 1,
        longitude: 1,
        active: true,
        subregion_name: 'Other Region',
        timezone: 'PST',
      },
    ];
    vi.mocked(api.getSurfSpotClosest).mockResolvedValueOnce(mockSpots);
    const queryClient = new QueryClient();
    render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <SpotGlance latitude={0} longitude={0} renderNumber={2} />
        </QueryClientProvider>
      </MemoryRouter>
    );
    expect(await screen.findByText(/Test Spot/i)).toBeInTheDocument();
    expect(screen.getByText(/Second Spot/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Region/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Other Region/i).length).toBeGreaterThanOrEqual(1);
  });
}); 