import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { NearbyBuoys } from '../nearby-buoys';
import * as api from '../api/locations';

vi.mock('../api/locations');

/**
 * This test requires a MemoryRouter to be able to use the useNavigate hook.
 * It also requires a QueryClientProvider to be able to use the useQuery hook.
 */
describe('<NearbyBuoys />', () => {
  // TODO: Fix test setup issues with React Query v5 and component rendering
  it.skip('renders nearby buoys', async () => {
    const mockBuoys = [
      {
        name: 'Test Buoy',
        url: '',
        active: true,
        location_id: 'loc1',
        id: 1,
        date_created: '',
        date_updated: '',
        description: '',
        distance: '1',
        latitude: '0',
        longitude: '0',
        location: '',
        latest_observation: [null, { swell_height: '2.0 ft', period: '10s', direction: 'NW' }],
      },
    ];
    
    vi.mocked(api.getLocationBuoyNearby).mockResolvedValueOnce(mockBuoys);
    
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    
    render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <NearbyBuoys latitude={0} longitude={0} numToRender={1} />
        </QueryClientProvider>
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Nearby Buoys/i)).toBeInTheDocument();
    });
    
    expect(screen.getByText(/Test Buoy/i)).toBeInTheDocument();
    expect(screen.getByText(/2.0 ft, 10s, NW/i)).toBeInTheDocument();
  });
}); 