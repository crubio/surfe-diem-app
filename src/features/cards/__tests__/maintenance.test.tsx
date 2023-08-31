import { describe, it, expect } from 'vitest';
import { screen, render } from '@testing-library/react';
import { MaintenanceCard } from '../maintenance_card';

describe('<MaintenanceCard />', () => {
  it('should render the component', () => {
    render(
      <MaintenanceCard />
    );
    expect(screen.getByText(/this site is under construction/i)).toBeInTheDocument();
  });
});