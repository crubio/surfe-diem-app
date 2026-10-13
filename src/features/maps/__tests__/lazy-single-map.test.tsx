import { describe, it, expect, vi, afterEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { LazySingleMap } from '../lazy-single-map';

// The real map needs WebGL; a stand-in shows whether it was loaded
vi.mock('../mapbox/single-instance', () => ({
  default: ({ lat, lng }: { lat: number; lng: number }) => <div>map at {lat},{lng}</div>,
}));

type Callback = (entries: { isIntersecting: boolean }[]) => void;
let trigger: Callback = vi.fn();

class FakeIntersectionObserver {
  constructor(callback: Callback) {
    trigger = callback;
  }
  observe = vi.fn();
  disconnect = vi.fn();
}

describe('<LazySingleMap />', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('holds the space with a placeholder until the map nears the viewport', async () => {
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
    const { container } = render(<LazySingleMap lat={36.95} lng={-122.03} zoom={8} />);

    expect(container.querySelector('.map-container')).toBeInTheDocument();
    expect(screen.queryByText(/map at/)).not.toBeInTheDocument();

    await act(async () => trigger([{ isIntersecting: true }]));
    expect(await screen.findByText('map at 36.95,-122.03')).toBeInTheDocument();
  });

  it('loads right away where IntersectionObserver is missing', async () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    render(<LazySingleMap lat={1} lng={2} />);
    expect(await screen.findByText('map at 1,2')).toBeInTheDocument();
  });
});
