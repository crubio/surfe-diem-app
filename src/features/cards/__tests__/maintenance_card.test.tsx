import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MaintenanceCard } from '../maintenance_card';

describe('<MaintenanceCard />', () => {
  it('renders the under construction message', () => {
    render(<MaintenanceCard />);
    expect(screen.getByText(/this site is under construction/i)).toBeInTheDocument();
  });
}); 