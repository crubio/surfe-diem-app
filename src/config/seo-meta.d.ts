export interface PageMeta {
  /** Path without a leading slash; '' for the home page */
  path: string;
  title: string;
  description: string;
}

export declare const SITE_URL: string;
export declare const SITE_NAME: string;
export declare const DEFAULT_OG_IMAGE: string;
export declare const STATIC_PAGES: Record<'home' | 'about' | 'map' | 'spots', PageMeta>;

export declare const cleanName: (name: string | null | undefined) => string;
export declare const spotPath: (spot: { slug?: string | null; id: number }) => string;
export declare const buoyPath: (buoy: { location_id: string }) => string;
export declare const spotMeta: (spot: { name: string; slug?: string | null; id: number }) => PageMeta;
export declare const buoyMeta: (buoy: { name?: string | null; location_id: string }) => PageMeta;
export declare const canonicalUrl: (path: string) => string;
