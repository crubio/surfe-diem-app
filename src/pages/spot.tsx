import { getSurfSpot } from "@features/locations/api/locations"
import { Box, Container, Grid, Stack } from "@mui/material"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "react-router-dom"
import ErrorPage from "./error"
import { FavoriteButton, Item, Loading } from "components"
import { getClostestTideStation, getDailyTides } from "@features/tides"
import { getForecastCurrent, getForecastHourly } from "@features/forecasts"
import { DailyTide } from "@features/tides/components/daily_tide"
import { isEmpty } from "lodash"
import WaveChart from "@features/charts/wave-height"
import MapBoxSingle from "@features/maps/mapbox/single-instance"
import { CurrentWeather } from "@features/weather/components/current_weather"
import { getCurrentWeather } from "@features/weather/api"
import { NearbyBuoys } from "@features/locations/nearby-buoys"
import { NoData } from "@features/cards/no_data"
import { CurrentForecast } from "@features/forecasts/components/current_forecast"

const SpotPage = () => {
  const params = useParams()
  const { spotId } = params

  const {data: spot, isError, error} = useQuery(
    ['spots', spotId],
    () => getSurfSpot(spotId)
  )

  const {data: tideStationData} = useQuery(['tide_station'], () => getClostestTideStation({lat: spot?.latitude, lng: spot?.longitude}), {
    enabled: !!spot?.latitude
  })

  const {data: tideData, isLoading: isTideDataLoading} = useQuery(['latest_tides', params], () => getDailyTides({ station: tideStationData?.station_id}), {
    enabled: !!tideStationData?.station_id
  })

  const {data: forecastDataHourly, isLoading: isHourlyForecastLoading } = useQuery(['forecast_hourly'], () => getForecastHourly({
    latitude: spot!.latitude,
    longitude: spot!.longitude,
    forecast_days: 1,
  }), {
    enabled: !!spot?.name
  })

  const {data: forecastCurrent} = useQuery(['forecast_current'], () => getForecastCurrent({
    latitude: spot!.latitude,
    longitude: spot!.longitude,
  }), {
    enabled: !!spot?.name
  })

  const {data: currentWeather, isLoading: isWeatherLoading} = useQuery(['current_weather'], () => getCurrentWeather({lat: spot!.latitude, lng: spot!.longitude}), {
    enabled: !!spot?.name
  })

  return (
    <>
      {isError && <ErrorPage error={error} />}
      {spot ? (
        <Container sx={{marginBottom: "20px"}}>
          <h1>{spot.name} <FavoriteButton showTooltip={true} id={spot.id} type="spot" name={spot.name} subregion_name={spot.subregion_name} latitude={spot.latitude} longitude={spot.longitude} /></h1>
          <Stack direction={{ xs: 'column', sm: 'row' }} marginBottom={'20px'} spacing={2}>
            <Item>{spot.latitude.toFixed(2)}, {spot.longitude.toFixed(2)}</Item>
            <Item>{spot.subregion_name}</Item>
            <Item>{spot.timezone}</Item>
          </Stack>
          {currentWeather && (
            <CurrentWeather currentWeather={currentWeather} isLoading={isWeatherLoading}/>
          )}
          {spot && spot.latitude && spot.longitude && (
            <NearbyBuoys latitude={spot.latitude} longitude={spot.longitude} />
          )}
          { !isEmpty(spot) && (
            <>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={6} lg={6}>
                  <MapBoxSingle lat={spot.latitude} lng={spot.longitude} zoom={8} />
                </Grid>
              </Grid>
            </>
          )}

          <Box sx={{marginBottom: "20px"}}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={12} md={3} lg={3}>
                <h2>Current conditions</h2>
                { isHourlyForecastLoading && (<Loading />)}
                {forecastCurrent ? (<CurrentForecast forecast={forecastCurrent} />) : <NoData />}
              </Grid>

              <Grid item xs={12} sm={12} md={3} lg={3}>
                <h2>Tide</h2>
                {isTideDataLoading ? (
                  <Loading />
                ) : tideData && (
                  <DailyTide {...tideData} />
                )}
              </Grid>
            </Grid>
          </Box>
          {forecastDataHourly?.hourly && 
            <Box sx={{marginBottom: "20px"}}>
              <WaveChart waveHeightData={forecastDataHourly?.hourly.swell_wave_height} wavePeriodData={forecastDataHourly?.hourly.swell_wave_period} timeData={forecastDataHourly?.hourly.time} />
            </Box>
          }
        </Container>
      ): null}
    </>
  )
}

export default SpotPage