import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ForecastRatingComponent } from '../forecast-rating';

// Mock the analytics utility
jest.mock('../../../../utils/analytics', () => ({
  trackInteraction: jest.fn(),
}));

// Mock the API
jest.mock('../../api/forecast-rating', () => ({
  submitForecastRating: jest.fn(),
}));

const theme = createTheme();

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        {component}
      </ThemeProvider>
    </QueryClientProvider>
  );
};

const mockProps = {
  spotId: 123,
  spotSlug: 'test-spot',
  spotName: 'Test Spot',
  forecastData: {
    swell_wave_height: 3.5,
    swell_wave_period: 12,
    timestamp: '2024-01-01T12:00:00Z',
  },
};

describe('ForecastRatingComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the rating question and buttons', () => {
    renderWithProviders(<ForecastRatingComponent {...mockProps} />);
    
    expect(screen.getByText('How accurate was this forecast?')).toBeInTheDocument();
    expect(screen.getByText('Help us improve our forecasts by rating their accuracy')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /accurate/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /not accurate/i })).toBeInTheDocument();
  });

  it('shows loading state when submitting rating', async () => {
    const { submitForecastRating } = require('../../api/forecast-rating');
    submitForecastRating.mockImplementation(() => new Promise(() => {})); // Never resolves

    renderWithProviders(<ForecastRatingComponent {...mockProps} />);
    
    const accurateButton = screen.getByRole('button', { name: /accurate/i });
    fireEvent.click(accurateButton);

    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  it('shows thank you message after successful rating submission', async () => {
    const { submitForecastRating } = require('../../api/forecast-rating');
    submitForecastRating.mockResolvedValue({
      status: 'success',
      data: { message: 'Rating submitted', rating: 'accurate' },
    });

    renderWithProviders(<ForecastRatingComponent {...mockProps} />);
    
    const accurateButton = screen.getByRole('button', { name: /accurate/i });
    fireEvent.click(accurateButton);

    await waitFor(() => {
      expect(screen.getByText(/thank you for your feedback/i)).toBeInTheDocument();
    });
  });

  it('prevents multiple ratings', async () => {
    const { submitForecastRating } = require('../../api/forecast-rating');
    submitForecastRating.mockResolvedValue({
      status: 'success',
      data: { message: 'Rating submitted', rating: 'accurate' },
    });

    renderWithProviders(<ForecastRatingComponent {...mockProps} />);
    
    const accurateButton = screen.getByRole('button', { name: /accurate/i });
    fireEvent.click(accurateButton);

    await waitFor(() => {
      expect(screen.getByText(/you've already rated this forecast/i)).toBeInTheDocument();
    });

    // Buttons should be gone
    expect(screen.queryByRole('button', { name: /accurate/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /not accurate/i })).not.toBeInTheDocument();
  });

  it('shows error message on rating submission failure', async () => {
    const { submitForecastRating } = require('../../api/forecast-rating');
    submitForecastRating.mockRejectedValue(new Error('Network error'));

    renderWithProviders(<ForecastRatingComponent {...mockProps} />);
    
    const accurateButton = screen.getByRole('button', { name: /accurate/i });
    fireEvent.click(accurateButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to submit rating/i)).toBeInTheDocument();
    });
  });
});
