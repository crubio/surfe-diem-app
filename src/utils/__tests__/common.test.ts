import { it, expect } from 'vitest';
import * as common from '../common';

// formatLatLong
it('formatLatLong parses lat/long string', () => {
  expect(common.formatLatLong('36.934 N 122.034 W (36°56\'4" N 122°2\'2" W)')).toEqual([36.934, -122.034]);
});