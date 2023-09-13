import { describe, it, expect } from 'vitest';
import { screen, render } from '@testing-library/react';
import LocationSummary from '../summary';

import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { LOCATION_1 } from 'test/mocks/location';
import { queryClient } from 'lib/react-query';


const props = LOCATION_1

// TODO: setup axios mock assertions
describe('<Summary />', () => {
  it('should render the component', async () => {
    render(
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <LocationSummary locationSummary={props}/>
        </QueryClientProvider>
      </BrowserRouter>
    );
    expect(screen.getByTestId("location-summary-card")).toBeInTheDocument();
    expect(screen.getByText(/Point Santa Cruz/i)).toBeInTheDocument();
  });
});