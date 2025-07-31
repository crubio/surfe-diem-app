import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import matchers from '@testing-library/jest-dom/matchers';
import '@testing-library/jest-dom';

expect.extend(matchers);

// Mock mapbox-gl for all tests (with default export)
vi.mock('mapbox-gl', () => ({
  __esModule: true,
  default: {
    Map: class {},
    NavigationControl: class {},
    Marker: class {},
    Popup: class {},
    accessToken: '',
  },
  Map: class {},
  NavigationControl: class {},
  Marker: class {},
  Popup: class {},
}));

afterEach(() => {
  cleanup();
});