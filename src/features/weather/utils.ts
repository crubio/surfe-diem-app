/**
 * The weather.gov point/marine forecast (`GET /api/v1/weather`) packs wind and
 * sky condition into a narrative sentence per period rather than separate
 * fields — `data.weather[]` exists but is frequently blank on marine zones, so
 * it can't be relied on. See .docs/weather-endpoint.json and
 * .docs/forecast-spot-plan.md §2d for the full response shape.
 *
 * e.g. "W wind around 10 kt. Mostly cloudy. Mixed swell...WNW 2 ft at 6
 * seconds and SSW 2 ft at 13 seconds. Wind waves around 1 ft."
 *   -> wind: "W wind around 10 kt"
 *   -> sky:  "Mostly cloudy"
 */

export interface ParsedForecastNarrative {
  wind: string | null;
  sky: string | null;
}

export const parseForecastNarrative = (text: string | undefined | null): ParsedForecastNarrative => {
  if (!text) return { wind: null, sky: null };

  const sentences = text
    .split(/\.\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (!sentences.length) return { wind: null, sky: null };

  const wind = sentences.find((s) => /\bwind\b/i.test(s)) ?? null;
  // Sky is whichever sentence isn't the wind clause and doesn't read as a
  // swell/wave clause (works for both marine text, which leads with wind, and
  // land text, which usually leads with sky).
  const sky = sentences.find((s) => s !== wind && !/\b(wind|swell|seas?|waves?)\b/i.test(s)) ?? null;

  return { wind, sky };
};
