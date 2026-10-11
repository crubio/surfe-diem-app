import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NearbyPlaces } from '../components/nearby-places';

const renderSection = (props: Parameters<typeof NearbyPlaces>[0]) =>
  render(
    <MemoryRouter>
      <NearbyPlaces {...props} />
    </MemoryRouter>
  );

describe('<NearbyPlaces />', () => {
  it('renders each place as a link with its distance', () => {
    renderSection({
      title: 'Around this spot',
      intro: 'Hourly forecast of swell height, period and direction, and wind, from the National Weather Service (NOAA).',
      groups: [
        { heading: 'Nearest NOAA buoys', places: [{ key: '51201', label: 'Buoy 51201 – Waimea Bay, HI', to: '/location/51201', distance: 2.4 }] },
        { heading: 'Nearby surf spots', places: [{ key: 1, label: 'Backdoor', to: '/spot/backdoor', distance: 0.1 }] },
      ],
    });
    expect(screen.getByRole('heading', { level: 2, name: 'Around this spot' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Buoy 51201 – Waimea Bay, HI' })).toHaveAttribute('href', '/location/51201');
    expect(screen.getByRole('link', { name: 'Backdoor' })).toHaveAttribute('href', '/spot/backdoor');
    expect(screen.getByText('2 mi')).toBeInTheDocument();
    expect(screen.getByText('<1 mi')).toBeInTheDocument();
  });

  it('leaves out empty groups', () => {
    renderSection({
      title: 'Around this spot',
      intro: 'No National Weather Service wave forecast covers this spot.',
      groups: [{ heading: 'Nearest NOAA buoys', places: [] }],
    });
    expect(screen.queryByText('Nearest NOAA buoys')).not.toBeInTheDocument();
    expect(screen.getByText(/No National Weather Service/)).toBeInTheDocument();
  });

  it('renders nothing with no intro and no places', () => {
    const { container } = renderSection({ title: 'Around this buoy', groups: [{ heading: 'Nearby surf spots', places: [] }] });
    expect(container).toBeEmptyDOMElement();
  });
});
