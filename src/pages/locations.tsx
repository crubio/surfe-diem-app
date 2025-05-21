import { NoData } from "@features/cards/no_data"
import { DailyForecast, getOpenMeteoForecastDaily, getOpenMeteoForecastHourly } from "@features/forecasts"
import { CurrentHourForecast } from "@features/forecasts/components/current_hour_forecast"
import { LatestReportedForecast } from "@features/forecasts/components/latest_reported_forecast"
import { getLatestObservation, getLocation } from "@features/locations/api/locations"
import { getDailyTides } from "@features/tides"
import { DailyTide } from "@features/tides/components/daily_tide"
import { Box, Container, Grid, Link, Stack} from "@mui/material"
import { useQuery } from "@tanstack/react-query"
import { Item, Loading } from "components"
import { isEmpty } from "lodash"
import { useParams } from "react-router-dom"
import { formatIsoNearestHour, formatLatLong, getTodaysDate } from "utils/common"
import ErrorPage from "./error"
import WaveChart from "@features/charts/wave-height"
import MapBoxSingle from "@features/maps/mapbox/single-instance"

const LocationsPage = () => {
  const params = useParams()
  const { locationId } = params

  const { data: locationData, isError: isLocationError, error } = useQuery(
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
    forecast_days: 1,
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
      {isLocationError ? <ErrorPage error={error} /> : (
        <Container sx={{marginBottom: "20px"}}>
          <h1>{locationData?.name}</h1>
          <Stack direction={{ xs: 'column', sm: 'row' }} marginBottom={'20px'} spacing={2}>
            <Item>{locationData?.description}</Item>
            <Item>{locationData?.location?.split("(")[0]}</Item>
            <Item><Link href={locationData?.url} target="_blank">more info</Link></Item>
          </Stack>
          { locationData?.location && latLong[0] && (
            <>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={6} lg={6}>
                  <MapBoxSingle lat={latLong[0]} lng={latLong[1]} zoom={8} />
                </Grid>
              </Grid>
            </>
          )}
        <Box>
          {latestReported ? (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={12} md={3} lg={3}>
                <h2>Current conditions</h2>
                { isLatestObsvLoading ? (
                  <Loading />
                ) : (
                  <LatestReportedForecast {...latestReported} />
                )}
              </Grid>
              <Grid item xs={12} sm={12} md={3} lg={3}>
                <h2>Next hour forecast</h2>
                { isHourlyForecastLoading ? (
                  <Loading />
                ) : (
                  <CurrentHourForecast forecast={forecastDataHourly} idx={forecastStartingIndex} />
                )}
              </Grid>
              {(location as { station_id?: string })?.station_id && (
                <Grid item xs={12} sm={12} md={3} lg={3}>
                  <h2>Tide</h2>
                  {isTideDataLoading ? (
                    <Loading />
                  ) : tideData && (
                    <DailyTide {...tideData} />
                  )}
                </Grid>
              )}
            </Grid>
          ) : isLatestObsvLoading ? (
            <Item><Loading /></Item>
          ) : (
            <Item><p>No current data</p></Item>
          )}
        </Box>
        {forecastDataHourly?.hourly &&
          <Box sx={{marginTop: "20px"}}>
            <WaveChart waveHeightData={forecastDataHourly?.hourly.swell_wave_height} wavePeriodData={forecastDataHourly?.hourly.swell_wave_period} timeData={forecastDataHourly?.hourly.time} />
          </Box>
        }
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
      )}
    </div>
  )
}

export default LocationsPage