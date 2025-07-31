import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FavoritesProvider } from '../../providers/favorites-provider';

const buoys = [
  { location_id: 'loc1', name: 'Buoy 1', url: '', active: true, id: 1, date_created: '', date_updated: '' },
];
const spots = [
  { id: 1, name: 'Manresa', latitude: 0, longitude: 0, active: true, subregion_name: 'Region', timezone: 'PST' },
  { id: 2, name: 'Pismo', latitude: 1, longitude: 1, active: true, subregion_name: 'Region', timezone: 'PST' },
];
const geolocation = { latitude: 36, longitude: -122 };

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.doMock('utils/geolocation', () => ({
    getGeolocation: () => Promise.resolve(geolocation),
  }));
});

describe('<Home />', () => {
  // TODO: Fix test setup issues with FavoritesProvider and Router context
  it.skip('renders main sections and featured spots', async () => {
    const { default: Home } = await import('../home');
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    
    render(
      <QueryClientProvider client={queryClient}>
        <FavoritesProvider>
          <MemoryRouter>
            <Home />
          </MemoryRouter>
        </FavoritesProvider>
      </QueryClientProvider>
    );
    
    expect(screen.getAllByText(/surfe diem/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/get the latest surf forecasts near you/i)).toBeInTheDocument();
    expect(screen.getByText(/Buoys/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^Spots$/i })).toBeInTheDocument();
    expect(screen.getByText(/Featured spots/i)).toBeInTheDocument();
  });

  // TODO: Fix this test - it needs better mocking of the geolocation and favorites data
  it.skip('shows no data available if no spots', async () => {
    const mockedUseQuery = vi.fn()
      .mockReturnValueOnce({ data: buoys }) // buoys
      .mockReturnValueOnce({ data: null }) // spots - null to trigger no data
      .mockReturnValueOnce({ data: geolocation }); // geolocation
    vi.doMock('@tanstack/react-query', () => ({
      useQuery: mockedUseQuery,
    }));
    const mockNavigate = vi.fn();
    vi.doMock('react-router-dom', async () => {
      const actual = await import('react-router-dom');
      return {
        ...actual,
        useNavigate: () => mockNavigate,
      };
    });
    vi.doMock('components/common/basic-select', () => ({
      default: (props: any) => <div data-testid="basic-select">BasicSelect {props.label}</div>,
    }));
    vi.doMock('@features/locations/spot-glance', () => ({
      __esModule: true,
      default: () => <div data-testid="spot-glance">SpotGlance</div>,
    }));
    vi.doMock('@features/locations/spot-summary', () => ({
      __esModule: true,
      default: (props: any) => <div data-testid="spot-summary">SpotSummary {props.name}</div>,
    }));
    const { default: Home } = await import('../home');
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    
    render(
      <QueryClientProvider client={queryClient}>
        <FavoritesProvider>
          <MemoryRouter>
            <Home />
          </MemoryRouter>
        </FavoritesProvider>
      </QueryClientProvider>
    );
    expect(screen.getByText(/No data available/i)).toBeInTheDocument();
  });
}); 