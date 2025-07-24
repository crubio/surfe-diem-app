import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

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
});

describe('<Home />', () => {
  it('renders main sections and featured spots', async () => {
    const mockedUseQuery = vi.fn()
      .mockReturnValueOnce({ data: buoys }) // buoys
      .mockReturnValueOnce({ data: spots }) // spots
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
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    expect(screen.getByText(/surfe diem/i)).toBeInTheDocument();
    expect(screen.getByText(/get the latest surf forecasts near you/i)).toBeInTheDocument();
    expect(screen.getByText(/Buoys/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^Spots$/i })).toBeInTheDocument();
    const selects = screen.getAllByTestId('basic-select');
    expect(selects.length).toBe(2);
    expect(selects[0].textContent).toMatch(/select a buoy/i);
    expect(selects[1].textContent).toMatch(/select a surf spot/i);
    expect(screen.getByTestId('spot-glance')).toBeInTheDocument();
    expect(screen.getByText(/Featured spots/i)).toBeInTheDocument();
    expect(screen.getByTestId('spot-summary')).toBeInTheDocument();
  });

  it('shows no data available if no spots', async () => {
    const mockedUseQuery = vi.fn()
      .mockReturnValueOnce({ data: buoys }) // buoys
      .mockReturnValueOnce({ data: [] }) // spots
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
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    expect(screen.getByText(/No data available/i)).toBeInTheDocument();
  });
}); 