// Some string constants used in the app. e.g., tooltips, labels, etc.

export const DEFAULT_CENTER = [-122.4376, 37.7577]
export const DEFAULT_TIMEZONE = "America/Los_Angeles"
// Beyond this distance to the nearest Tide Explorer station, treat tide data as unavailable
// rather than showing a misleading reading from a far-away station. See forecast-spot-plan.md §3.F1.
export const TIDE_STATION_MAX_MILES = 50