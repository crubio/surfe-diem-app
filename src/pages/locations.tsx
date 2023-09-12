import { DailyForecast, getOpenMeteoForecastDaily, getOpenMeteoForecastHourly } from "@features/forecasts"
import { CurrentHourForecast } from "@features/forecasts/components/current_hour_forecast"
import { LatestReportedForecast } from "@features/forecasts/components/latest_reported_forecast"
import { getLatestObservation, getLocation } from "@features/locations/api/locations"
import { Box, Container, Stack} from "@mui/material"
import { useQuery } from "@tanstack/react-query"
import { Item, Loading } from "components"
import { isEmpty } from "lodash"
import { useParams } from "react-router-dom"
import { formatIsoNearestHour, formatLatLong, getTodaysDate } from "utils/common"

const LocationsPage = () => {
  const params = useParams()
  const { locationId } = params

  const { data: locationData } = useQuery(
    ['location', locationId],
    () => getLocation(locationId)
  )

  const {data: latestObservationData, isLoading: isLatestObsvLoading} = useQuery(['latest_observation', params], () => getLatestObservation(locationId!), {
    enabled: !!locationData?.location_id
  })

  const latLong = formatLatLong(locationData?.location || "")

  const {data: forecastDataHourly } = useQuery(['forecast_hourly', locationData?.location_id], () => getOpenMeteoForecastHourly({
    latitude: latLong[0],
    longitude: latLong[1],
    start_date: getTodaysDate(),
    end_date: getTodaysDate(1)
  }), {
    enabled: !!locationData?.location_id
  })

  const {data: forecastDataDaily, isLoading: isForecastLoading } = useQuery(['forecast_daily', locationData?.location_id], () => getOpenMeteoForecastDaily({
    latitude: latLong[0],
    longitude: latLong[1],
    start_date: getTodaysDate(),
    end_date: getTodaysDate(5)
  }), {
    enabled: !!locationData?.location_id
  })

  const forecastStartingIndex = forecastDataHourly?.hourly.time.findIndex((item: string) => item === formatIsoNearestHour())

  const obsData = latestObservationData || []

  const latestReported = obsData[0] || {}
  
  return (
    <div>
      <Container>
        <h1>{locationData?.name}</h1>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Item>{locationData?.description}</Item>
          <Item>{locationData?.depth}</Item>
          <Item>{locationData?.location?.split("(")[0]}</Item>
        </Stack>
        <Box>
          {latestReported  && !isEmpty(latestReported) ? (
            <>
              <Stack
                direction="row"
                justifyContent="flex-start"
                alignItems="flex-start"
                spacing={4}
              >
                <Box>
                  <h2>Current conditions</h2>
                  <LatestReportedForecast forecast={latestReported} />
                </Box>
                <Box>
                  <h2>Next hour</h2>
                  <CurrentHourForecast forecast={forecastDataHourly} idx={forecastStartingIndex} />
                </Box>
              </Stack>
            </>
          ) : isLatestObsvLoading ? (
            <Item><Loading /></Item>
          ) : (
            <Item><p>No current data</p></Item>
          )}
          
        </Box>
        <Box>
          {/* Add tooltip for weekly height max definition */}
          <h2>Forecast</h2>
          { !isEmpty(forecastDataDaily) ? (
            <Stack direction={{ xs: 'column', sm: 'column', md: 'row' }} spacing={2}>
              <DailyForecast forecast={forecastDataDaily} />
            </Stack>
          ): isForecastLoading ? (
            <Item><Loading /></Item>
          ) : (
            <Item><p>No current data</p></Item>
          )}
        </Box>
      </Container>
    </div>
  )
}

export default LocationsPage