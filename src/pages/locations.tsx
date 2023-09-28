import { NoData } from "@features/cards/no_data"
import { DailyForecast, getOpenMeteoForecastDaily, getOpenMeteoForecastHourly } from "@features/forecasts"
import { CurrentHourForecast } from "@features/forecasts/components/current_hour_forecast"
import { LatestReportedForecast } from "@features/forecasts/components/latest_reported_forecast"
import { getLatestObservation, getLocation } from "@features/locations/api/locations"
import { getDailyTides } from "@features/tides"
import { DailyTide } from "@features/tides/components/daily_tide"
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

  const {data: tideData, isLoading: isTideDataLoading} = useQuery(['latest_tides', params], () => getDailyTides({ station: locationData?.station_id}), {
    enabled: !!locationData?.station_id
  })

  const {data: forecastDataHourly, isLoading: isHourlyForecastLoading } = useQuery(['forecast_hourly', locationData?.location_id], () => getOpenMeteoForecastHourly({
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

  const latestReported = obsData || []
  
  return (
    <div>
      <Container>
        <h1>{locationData?.name}</h1>
        <Stack direction={{ xs: 'column', sm: 'row' }} marginBottom={'20px'} spacing={2}>
          <Item>{locationData?.description}</Item>
          <Item>{locationData?.location?.split("(")[0]}</Item>
        </Stack>
        <Box>
          {latestReported ? (
            <>
              <Stack
                direction={{ xs: 'column', sm: 'column', md: 'row' }}
                justifyContent="flex-start"
                alignItems="flex-start"
                spacing={4}
              >
                <Box>
                  <h2>Current conditions</h2>
                  { isLatestObsvLoading ? (
                    <Loading />
                  ) : (
                    <LatestReportedForecast {...latestReported} />
                  )}
                </Box>
                <Box>
                  <h2>Next hour</h2>
                  { isHourlyForecastLoading ? (
                    <Loading />
                  ) : (
                    <CurrentHourForecast forecast={forecastDataHourly} idx={forecastStartingIndex} />
                  )}
                </Box>
                <Box>
                  <h2>Tide</h2>
                  {isTideDataLoading ? (
                    <Loading />
                  ) : tideData && (
                    <DailyTide {...tideData} />
                  )}
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
          <h2>Forecast</h2>
          { !isEmpty(forecastDataDaily) ? (
            <Stack direction={{ xs: 'column', sm: 'column', md: 'row' }} spacing={2}>
              <DailyForecast forecast={forecastDataDaily} />
            </Stack>
          ): isForecastLoading ? (
            <Item><Loading /></Item>
          ) : (
            <NoData />
          )}
        </Box>
      </Container>
    </div>
  )
}

export default LocationsPage