import { it, expect } from 'vitest';
import * as common from '../common';

// formatNumber
it('formatNumber returns a string with n decimals', () => {
  expect(common.formatNumber(3.14159)).toBe('3.14');
  expect(common.formatNumber(3.1, 1)).toBe('3.1');
  expect(common.formatNumber(3, 0)).toBe('3');
});

// formatIsoNearestHour
it('formatIsoNearestHour returns a string in the correct format', () => {
  const result = common.formatIsoNearestHour();
  expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:00$/);
});

// formatDateTime
it('formatDateTime returns formatted date or empty string', () => {
  expect(common.formatDateTime(undefined)).toBe('');
  expect(common.formatDateTime('2023-01-01T12:34:56Z')).toMatch(/\d{2}\/\d{2}\/\d{4}, \d{2}/);
});

// formatDateShortWeekday
it('formatDateShortWeekday returns short weekday format', () => {
  expect(common.formatDateShortWeekday('2023-01-01')).toMatch(/Sun, Jan 1/);
});

// getTodaysDate
it('getTodaysDate returns today and offset days', () => {
  const today = common.getTodaysDate();
  expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  const tomorrow = common.getTodaysDate(1);
  expect(tomorrow > today).toBe(true);
});

// formatDateWeekday
it('formatDateWeekday returns formatted weekday', () => {
  expect(common.formatDateWeekday('2023-01-01T12:00:00Z')).toMatch(/January 1, 4:00 AM/);
});

// formatDateHour
it('formatDateHour returns formatted hour', () => {
  expect(common.formatDateHour('2023-01-01T12:00:00Z')).toMatch(/4:00 AM/);
});

// formatDate
it('formatDate returns formatted date', () => {
  expect(common.formatDate('2023-01-01T12:00:00Z')).toMatch(/January 1, 2023/);
});

// validateIsCurrent
it('validateIsCurrent returns false for undefined', () => {
  expect(common.validateIsCurrent(undefined)).toBe(false);
});

// formatLatLong
it('formatLatLong parses lat/long string', () => {
  expect(common.formatLatLong('36.934 N 122.034 W (36°56\'4" N 122°2\'2" W)')).toEqual([36.934, -122.034]);
});