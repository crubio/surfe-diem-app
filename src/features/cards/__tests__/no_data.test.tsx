import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../test/test-utils';
import { NoData } from '../no_data';

describe('<NoData />', () => {
  it('renders the warning icon and message', () => {
    render(<NoData />);
    expect(screen.getByText(/No data available/i)).toBeInTheDocument();
    // Check for the SVG icon in the document
    const icon = document.querySelector('svg');
    expect(icon).toBeTruthy();
  });
}); 