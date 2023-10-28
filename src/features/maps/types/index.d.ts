export type GeoJSONProperties = {
  id: number;
  name: string;
  description: string;
};

export type GeoJSON = {
  type: string;
  features: [
    {
      type: string;
      geometry: {
        type: string;
        coordinates: [number, number];
      };
      properties: GeoJSONProperties;
    }
  ];
};