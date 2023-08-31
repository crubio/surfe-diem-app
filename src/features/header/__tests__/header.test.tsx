import { describe, it, expect } from 'vitest';
import { screen, render } from '@testing-library/react';
import SearchAppBar from '..';

describe('<SearchAppBar />', () => {
  it('should render the component', () => {
    render(
      <SearchAppBar />
    );
    expect(screen.getByTestId('search-bar-header')).toBeInTheDocument();
  });
});