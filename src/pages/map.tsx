import { getGeoJsonLocations } from "@features/locations/api/locations"
import { MapBox } from "@features/maps"
import { useQuery } from "@tanstack/react-query"
import PageContainer from "components/common/container"
import { SEO } from "components"
import { isEmpty } from "lodash"
import { useEffect, useState } from "react"

const MapPage = () => {
  const [coords, setCoords] = useState<[number, number] | null>(null) // [lat, lng]
  const {data, isFetched, isError} = useQuery(['locations/geojson'], () => getGeoJsonLocations())

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
        {!isEmpty(data) && isFetched && <MapBox geoJson={data} lat={coords && coords[1] || undefined} lng={coords && coords[0] || undefined} />}
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