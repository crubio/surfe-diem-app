import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchResultsDialog } from '../search-results';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await import('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('SearchResultsDialog', () => {
  it('renders spot results', () => {
    const onClose = vi.fn();
    const results = [
      { id: 1, name: 'Spot 1', latitude: 0, longitude: 0, active: true, subregion_name: 'Region', timezone: 'PST' },
    ];
    render(
      <MemoryRouter>
        <SearchResultsDialog results={results} open={true} searchTerm="surf" onClose={onClose} />
      </MemoryRouter>
    );
    expect(screen.getByText(/Search results for "surf"/i)).toBeInTheDocument();
    expect(screen.getByText(/Spot 1/i)).toBeInTheDocument();
  });

  it('renders buoy location results', () => {
    const onClose = vi.fn();
    const results = [
      { location_id: 'loc1', name: 'Buoy 1', url: '', active: true, id: 1, date_created: '', date_updated: '' },
    ];
    render(
      <MemoryRouter>
        <SearchResultsDialog results={results} open={true} searchTerm="buoy" onClose={onClose} />
      </MemoryRouter>
    );
    expect(screen.getByText(/Search results for "buoy"/i)).toBeInTheDocument();
    expect(screen.getByText(/Buoy 1/i)).toBeInTheDocument();
  });

  it('calls onClose when dialog is closed', () => {
    const onClose = vi.fn();
    render(
      <MemoryRouter>
        <SearchResultsDialog results={[]} open={true} searchTerm="test" onClose={onClose} />
      </MemoryRouter>
    );
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    onClose();
    expect(onClose).toHaveBeenCalled();
  });

  it('navigates to spot or buoy on click', () => {
    const onClose = vi.fn();
    const spot = { id: 1, name: 'Spot 1', latitude: 0, longitude: 0, active: true, subregion_name: 'Region', timezone: 'PST' };
    const buoy = { location_id: 'loc1', name: 'Buoy 1', url: '', active: true, id: 2, date_created: '', date_updated: '' };
    const results = [spot, buoy];
    render(
      <MemoryRouter>
        <SearchResultsDialog results={results} open={true} searchTerm="all" onClose={onClose} />
      </MemoryRouter>
    );
    // Spot
    const buttons = screen.getAllByRole('button');
    const spotBtn = buttons.find(btn => btn.textContent?.includes('Spot 1'));
    expect(spotBtn).toBeDefined();
    fireEvent.click(spotBtn!);
    expect(mockNavigate).toHaveBeenCalledWith('/spot/1');
    // Buoy
    const buoyBtn = buttons.find(btn => btn.textContent?.includes('Buoy 1'));
    expect(buoyBtn).toBeDefined();
    fireEvent.click(buoyBtn!);
    expect(mockNavigate).toHaveBeenCalledWith('/location/loc1');
  });
}); 