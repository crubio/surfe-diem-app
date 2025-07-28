import { Helmet } from 'react-helmet-async';

interface SurfSpotStructuredDataProps {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  subregion: string;
  timezone: string;
  url: string;
}

interface BuoyStructuredDataProps {
  name: string;
  description: string;
  location: string;
  url: string;
  buoyUrl?: string;
}

export const SurfSpotStructuredData = ({ 
  name, 
  description, 
  latitude, 
  longitude, 
  subregion, 
  timezone, 
  url 
}: SurfSpotStructuredDataProps) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Place",
    "name": name,
    "description": description,
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": latitude,
      "longitude": longitude
    },
    "address": {
      "@type": "PostalAddress",
      "addressRegion": subregion,
      "addressCountry": "US"
    },
    "url": url,
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "Timezone",
        "value": timezone
      },
      {
        "@type": "PropertyValue", 
        "name": "Surf Spot Type",
        "value": "Ocean Surf Spot"
      }
    ]
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export const BuoyStructuredData = ({ 
  name, 
  description, 
  location, 
  url, 
  buoyUrl 
}: BuoyStructuredDataProps) => {
  const structuredData: any = {
    "@context": "https://schema.org",
    "@type": "Place",
    "name": `${name} Buoy`,
    "description": description,
    "url": url,
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "Buoy Type",
        "value": "NOAA Weather Buoy"
      },
      {
        "@type": "PropertyValue",
        "name": "Location",
        "value": location
      }
    ]
  };

  if (buoyUrl) {
    structuredData["sameAs"] = buoyUrl;
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
}; 