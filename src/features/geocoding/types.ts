export interface GeocodingRequest {
  query: string;
  limit?: number;
  types?: string[];
  country?: string;
  bbox?: [number, number, number, number];
}

export interface ReverseGeocodingRequest extends Omit<GeocodingRequest, 'query' | 'limit' | 'types' | 'country' | 'bbox'> {
  longitude: number;
  latitude: number;
  type?: 'country' | 'region' | 'postcode' | 'district' | 'place' | 'locality' | 'neighborhood' | 'address' | 'poi';
}

export interface GeocodingFeature {
  id: string;
  type: 'Feature';
  place_type: string[];
  relevance: number;
  properties: {
    accuracy?: string;
    address?: string;
    category?: string;
    maki?: string;
    landmark?: boolean;
    wikidata?: string;
    short_code?: string;
    place_formatted?: string;
    name_preferred?: string;
  };
  text: string;
  place_name: string;
  matching_text?: string;
  matching_place_name?: string;
  center: [number, number]; // [longitude, latitude]
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  context?: Array<{
    id: string;
    text: string;
    wikidata?: string;
    short_code?: string;
  }>;
  bbox?: [number, number, number, number];
}

export interface GeocodingResponse {
  type: 'FeatureCollection';
  query: string[];
  features: GeocodingFeature[];
  attribution: string;
}
