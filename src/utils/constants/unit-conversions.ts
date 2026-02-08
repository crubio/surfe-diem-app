/**
 * Standard unit conversion constants
 */

// Length conversions
export const METERS_TO_FEET = 3.28084;
export const FEET_TO_METERS = 1 / METERS_TO_FEET;

// Temperature conversions
export const CELSIUS_TO_FAHRENHEIT = (celsius: number) => (celsius * 9) / 5 + 32;
export const FAHRENHEIT_TO_CELSIUS = (fahrenheit: number) => ((fahrenheit - 32) * 5) / 9;

// Speed conversions
export const METERS_PER_SECOND_TO_KNOTS = 1.94384;
export const KNOTS_TO_METERS_PER_SECOND = 1 / METERS_PER_SECOND_TO_KNOTS;
