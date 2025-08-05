import { getGeoJsonLocations, getSurfSpotsGeoJson } from "@features/locations/api/locations"
import { useQuery } from "@tanstack/react-query"
import PageContainer from "components/common/container"
import { SEO } from "components"
import { isEmpty } from "lodash"
import { useEffect, useState, lazy, Suspense, useMemo } from "react"

// Lazy load the map component to reduce initial bundle size
const MapBox = lazy(() => import("@features/maps").then(module => ({ default: module.MapBox })))

const MapPage = () => {
  const [coords, setCoords] = useState<[number, number] | null>(null) // [lat, lng]
  const {data: locationsGeoJson, isFetched: isLocationsFetched, isError: isLocationsError} = useQuery({
    queryKey: ['locations/geojson'],
    queryFn: () => getGeoJsonLocations()
  });

  const {data: spotsGeoJson} = useQuery({
    queryKey: ['spots/geojson'],
    queryFn: () => getSurfSpotsGeoJson()
  })

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      setCoords([position.coords.longitude, position.coords.latitude])
      return true
    })
  }, [])

  const geoJson = useMemo(() => {
    if (!locationsGeoJson || !spotsGeoJson) return undefined;
    // If both are FeatureCollections, merge their features arrays
    if (locationsGeoJson.type === "FeatureCollection" && spotsGeoJson.type === "FeatureCollection") {
      const combinedFeatures = [
        ...locationsGeoJson.features,
        ...spotsGeoJson.features
      ];
      
      // Debug: Check what types we're getting
      console.log('Sample buoy feature:', locationsGeoJson.features[0]?.properties);
      console.log('Sample spot feature:', spotsGeoJson.features[0]?.properties);
      console.log('Combined features count:', combinedFeatures.length);
      
      return {
        type: "FeatureCollection",
        features: combinedFeatures
      };
    }
    return undefined;
  }, [locationsGeoJson, spotsGeoJson]);

  return (
    <>
      <SEO 
        title="Surf Map - Surfe Diem"
        description="Interactive map showing surf spots and buoys. Find surf locations near you and get real-time conditions."
        keywords="surf map, interactive surf map, surf spots map, surf buoys map, find surf spots, surf location map"
        url="https://surfe-diem.com/map"
      />
      <PageContainer >
        <h1>Buoys and spots</h1>
        {geoJson && !isEmpty(locationsGeoJson) && isLocationsFetched && (
          <Suspense fallback={<div>Loading map...</div>}>
            <MapBox geoJson={geoJson} lat={coords && coords[1] || undefined} lng={coords && coords[0] || undefined} />
          </Suspense>
        )}
        {isLocationsError && (
          <div>
            <h3>Could not fetch locations</h3>
            <p>Try again later</p>
          </div>
        )}
      </PageContainer>
    </>
  )
}

export default MapPage