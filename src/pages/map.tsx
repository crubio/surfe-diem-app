import { getGeoJsonLocations } from "@features/locations/api/locations"
import { MapBox } from "@features/maps"
import { useQuery } from "@tanstack/react-query"
import PageContainer from "components/common/container"
import { isEmpty } from "lodash"
import { useEffect, useState } from "react"

const MapPage = () => {
  const [coords, setCoords] = useState<[number, number] | null>(null) // [lat, lng]
  const {data, isFetched, isError} = useQuery(['locations/geojson'], () => getGeoJsonLocations())

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      setCoords([position.coords.latitude, position.coords.longitude])
      return true
    })
  }, [])

  return (
    <>
      <PageContainer >
        <h1>Buoys and spots</h1>
        {!isEmpty(data) && isFetched && <MapBox geoJson={data} lat={coords && coords[0] || undefined} lng={coords && coords[1]|| undefined} />}
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