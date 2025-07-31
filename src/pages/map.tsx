import { getGeoJsonLocations } from "@features/locations/api/locations"
import { useQuery } from "@tanstack/react-query"
import PageContainer from "components/common/container"
import { SEO } from "components"
import { isEmpty } from "lodash"
import { useEffect, useState, lazy, Suspense } from "react"

// Lazy load the map component to reduce initial bundle size
const MapBox = lazy(() => import("@features/maps").then(module => ({ default: module.MapBox })))

const MapPage = () => {
  const [coords, setCoords] = useState<[number, number] | null>(null) // [lat, lng]
  const {data, isFetched, isError} = useQuery({
    queryKey: ['locations/geojson'],
    queryFn: () => getGeoJsonLocations()
  });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      setCoords([position.coords.longitude, position.coords.latitude])
      return true
    })
  }, [])

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
        {!isEmpty(data) && isFetched && (
          <Suspense fallback={<div>Loading map...</div>}>
            <MapBox geoJson={data} lat={coords && coords[1] || undefined} lng={coords && coords[0] || undefined} />
          </Suspense>
        )}
        {isError && (
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