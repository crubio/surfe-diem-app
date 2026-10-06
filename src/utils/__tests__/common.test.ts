import { it, expect } from 'vitest';
import * as common from '../common';

// formatNumber
it('formatNumber returns a string with n decimals', () => {
  expect(common.formatNumber(3.14159)).toBe('3.14');
  expect(common.formatNumber(3.1, 1)).toBe('3.1');
  expect(common.formatNumber(3, 0)).toBe('3');
});

// validateIsCurrent
it('validateIsCurrent returns false for undefined', () => {
  expect(common.validateIsCurrent(undefined)).toBe(false);
});

// formatLatLong
it('formatLatLong parses lat/long string', () => {
  expect(common.formatLatLong('36.934 N 122.034 W (36°56\'4" N 122°2\'2" W)')).toEqual([36.934, -122.034]);
});