export interface PageMeta {
  /** Path without a leading slash; '' for the home page */
  path: string;
  title: string;
  description: string;
}

/** NWS forecast coverage from the API: 'full', 'partial' or null (none) */
export type ForecastCoverage = 'full' | 'partial' | null | undefined;

interface SpotLike {
  id: number;
  name: string;
  slug?: string | null;
  subregion_name?: string | null;
  forecast?: ForecastCoverage;
}

interface BuoyLike {
  name?: string | null;
  location_id: string;
}

export declare const SITE_URL: string;
export declare const SITE_NAME: string;
export declare const DEFAULT_OG_IMAGE: string;
export declare const NEARBY_RADIUS_MI: number;
export declare const NEARBY_SPOTS_LIMIT: number;
export declare const NEARBY_BUOYS_LIMIT: number;
export declare const NEARBY_TEXT: Record<'spotTitle' | 'buoyTitle' | 'subtitle' | 'buoys' | 'spots', string>;
export declare const STATIC_PAGES: Record<'home' | 'about' | 'map' | 'spots', PageMeta>;

export declare const cleanName: (name: string | null | undefined) => string;
export declare const spotPath: (spot: { slug?: string | null; id: number }) => string;
export declare const buoyPath: (buoy: { location_id: string }) => string;
export declare const canonicalUrl: (path: string) => string;
export declare const coverageText: (forecast: ForecastCoverage) => string;
export declare const spotMeta: (spot: SpotLike) => PageMeta;
export declare const buoyPlace: (buoy: BuoyLike) => string;
export declare const buoyLabel: (buoy: BuoyLike) => string;
export declare const buoyMeta: (buoy: BuoyLike) => PageMeta;
export declare const milesBetween: (lat1: number, lng1: number, lat2: number, lng2: number) => number;
export declare const formatMiles: (miles: number) => string;
export declare function nearestTo<T extends { latitude: number; longitude: number }>(
  items: T[],
  lat: number,
  lng: number,
  options?: { limit?: number; keyOf?: (item: T) => unknown; excludeKey?: unknown }
): (T & { distance: number })[];
