import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorPage from '../error';

describe('<ErrorPage />', () => {
  it('renders error statusText', () => {
    render(<ErrorPage error={{ statusText: 'Not Found' }} />);
    expect(screen.getByRole('heading', { name: /Error/i })).toBeInTheDocument();
    expect(screen.getByText(/The following error has occurred/i)).toBeInTheDocument();
    expect(screen.getByText(/Not Found/i)).toBeInTheDocument();
    // Check for the error icon
    const icon = document.querySelector('svg');
    expect(icon).toBeTruthy();
  });

  it('renders error message if no statusText', () => {
    render(<ErrorPage error={{ message: 'Something went wrong' }} />);
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
  });
}); 