export type GeoJSONProperties = {
  id: number | string;
  name: string;
  description?: string;
  type: string;
  url?: string;
  location?: string;
  timezone?: string;
  subregion_name?: string;
  slug?: string;
};

export type GeoJSON = {
  type: string;
  features: Array<{
    type: string;
    geometry: {
      type: string;
      coordinates: [number, number];
    };
    properties: GeoJSONProperties;
  }>;
};