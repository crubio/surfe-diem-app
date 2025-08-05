import { getSurfSpot, getSurfSpotBySlug } from "@features/locations/api/locations"
import { Box, Container, Grid, Stack, Typography, Card, CardContent } from "@mui/material"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "react-router-dom"
import ErrorPage from "./error"
import { FavoriteButton, Item, Loading, SEO, SurfSpotStructuredData } from "components"
import { getClostestTideStation, getDailyTides, getCurrentTides } from "@features/tides"
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
import { formatCoordinates, formatTemperature, calculateTideStatus, formatDirection } from "utils/formatting"
import { getCurrentTideValue } from "utils/tides"


const SpotPage = () => {
  const params = useParams()
  const { spotId } = params

  // Determine if spotId is a slug (non-numeric) or ID (numeric)
  const isSlug = spotId && isNaN(Number(spotId))
  
  const {data: spot, isError, error} = useQuery({
    queryKey: ['spots', spotId, isSlug],
    queryFn: () => isSlug ? getSurfSpotBySlug(spotId) : getSurfSpot(spotId)
  });

  const {data: tideStationData} = useQuery({
    queryKey: ['tide_station'],
    queryFn: () => getClostestTideStation({lat: spot?.latitude, lng: spot?.longitude}),
    enabled: !!spot?.latitude
  });

  const {data: tideData, isPending: isTideDataLoading} = useQuery({
    queryKey: ['latest_tides', params],
    queryFn: () => getDailyTides({ station: tideStationData?.station_id}),
    enabled: !!tideStationData?.station_id
  });

  const {data: currentTides} = useQuery({
    queryKey: ['current_tides', tideStationData?.station_id],
    queryFn: () => getCurrentTides({ station: tideStationData!.station_id}),
    enabled: !!tideStationData?.station_id,
    staleTime: 5 * 60 * 1000, // 5 minutes (more frequent updates for current data)
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const {data: forecastDataHourly, isPending: isHourlyForecastLoading } = useQuery({
    queryKey: ['forecast_hourly'],
    queryFn: () => getForecastHourly({
      latitude: spot!.latitude,
      longitude: spot!.longitude,
      forecast_days: 1,
    }),
    enabled: !!spot?.name
  });

  const {data: forecastCurrent} = useQuery({
    queryKey: ['forecast_current'],
    queryFn: () => getForecastCurrent({
      latitude: spot!.latitude,
      longitude: spot!.longitude,
    }),
    enabled: !!spot?.name
  });

  const {data: currentWeather, isPending: isWeatherLoading} = useQuery({
    queryKey: ['current_weather'],
    queryFn: () => getCurrentWeather({lat: spot!.latitude, lng: spot!.longitude}),
    enabled: !!spot?.name
  });

  return (
    <>
      {spot && (
        <>
          <SEO 
            title={`${spot.name} Surf Spot - Surfe Diem`}
            description={`Get current surf conditions, forecasts, and tide information for ${spot.name} in ${spot.subregion_name}. Real-time surf data and weather.`}
            keywords={`${spot.name} surf spot, ${spot.subregion_name} surf, ${spot.name} surf conditions, ${spot.name} surf forecast, ${spot.subregion_name} surf spots`}
            url={`https://surfe-diem.com/spot/${spot.slug}`}
          />
          <SurfSpotStructuredData
            name={spot.name}
            description={`Surf spot in ${spot.subregion_name} with current conditions and forecasts`}
            latitude={spot.latitude}
            longitude={spot.longitude}
            subregion={spot.subregion_name}
            timezone={spot.timezone}
            url={`https://surfe-diem.com/spot/${spot.slug}`}
          />
        </>
      )}
      {isError && <ErrorPage error={error} />}
      {spot ? (
        <Container sx={{marginBottom: "20px"}}>
          {/* Hero Section */}
          <Box sx={{ mb: 4 }}>
            {/* Header with spot name and favorite button */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold' }}>
                {spot.name}
              </Typography>
              <Box sx={{ ml: 2.5 }}> {/* 20px margin left */}
                <FavoriteButton showTooltip={true} id={spot.id} type="spot" name={spot.name} subregion_name={spot.subregion_name} latitude={spot.latitude} longitude={spot.longitude} />
              </Box>
            </Box>

            {/* Location info */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
              <Item>
                <Typography variant="body2" color="text.secondary">
                  {formatCoordinates(spot.latitude, spot.longitude)}
                </Typography>
              </Item>
              <Item>
                <Typography variant="body2" color="text.secondary">
                  {spot.subregion_name}
                </Typography>
              </Item>
              <Item>
                <Typography variant="body2" color="text.secondary">
                  {spot.timezone}
                </Typography>
              </Item>
            </Stack>

            {/* Key Metrics Grid */}
            <Grid container spacing={2}>
              {/* Wave Height */}
              <Grid item xs={6} sm={4} md={2}>
                <Card sx={{ height: '100%', textAlign: 'center' }}>
                  <CardContent sx={{ py: 2 }}>
                    <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold', fontSize: '2.25rem' }}>
                      {forecastCurrent?.current?.swell_wave_height ? `${forecastCurrent.current.swell_wave_height.toFixed(1)}ft` : 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Wave Height
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Period */}
              <Grid item xs={6} sm={4} md={2}>
                <Card sx={{ height: '100%', textAlign: 'center' }}>
                  <CardContent sx={{ py: 2 }}>
                    <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold', fontSize: '2.25rem' }}>
                      {forecastCurrent?.current?.swell_wave_period ? `${forecastCurrent.current.swell_wave_period}s` : 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Period
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Direction */}
              <Grid item xs={6} sm={4} md={2}>
                <Card sx={{ height: '100%', textAlign: 'center' }}>
                  <CardContent sx={{ py: 2 }}>
                    <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold', fontSize: '2.25rem' }}>
                      {forecastCurrent?.current?.swell_wave_direction ? formatDirection(forecastCurrent.current.swell_wave_direction) : 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Direction
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Water Temp */}
              <Grid item xs={6} sm={4} md={2}>
                <Card sx={{ height: '100%', textAlign: 'center' }}>
                  <CardContent sx={{ py: 2 }}>
                    <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold', fontSize: '2.25rem' }}>
                      {forecastCurrent?.current?.sea_surface_temperature ? formatTemperature(forecastCurrent.current.sea_surface_temperature) : 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Water Temp
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Wind */}
              <Grid item xs={6} sm={4} md={2}>
                <Card sx={{ height: '100%', textAlign: 'center' }}>
                  <CardContent sx={{ py: 2 }}>
                    <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold', fontSize: '2.25rem' }}>
                      {forecastCurrent?.current?.wind_wave_direction ? formatDirection(forecastCurrent.current.wind_wave_direction) : 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Wind
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Current Tide */}
              <Grid item xs={6} sm={4} md={2}>
                <Card sx={{ height: '100%', textAlign: 'center' }}>
                  <CardContent sx={{ py: 2 }}>
                    <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold', fontSize: '2.25rem' }}>
                      {currentTides ? `${getCurrentTideValue(currentTides)?.toFixed(1)}ft` : 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Current Tide
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
          {currentWeather && (
            <CurrentWeather currentWeather={currentWeather} isLoading={isWeatherLoading}/>
          )}
          {/* Nearby Buoys - will be integrated into map later */}
          {/* {spot && spot.latitude && spot.longitude && (
            <NearbyBuoys latitude={spot.latitude} longitude={spot.longitude} />
          )} */}
          { !isEmpty(spot) && (
            <>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={6} lg={6} sx={{marginBottom: "20px"}}>
                  <MapBoxSingle lat={spot.latitude} lng={spot.longitude} zoom={8} />
                </Grid>
              </Grid>
            </>
          )}

          <Box sx={{marginBottom: "20px"}}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', mb: 3 }}>
                    Tide Status
                  </Typography>
                  {isTideDataLoading ? (
                    <Loading />
                  ) : tideData && currentTides ? (
                    <Grid container spacing={2}>
                      {/* Today's Range */}
                      <Grid item xs={12} sm={6}>
                        <Card sx={{ textAlign: 'center' }}>
                          <CardContent sx={{ py: 1, px: 2 }}>
                            <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold', fontSize: '2.25rem', mb: 0.5 }}>
                              {Math.min(...tideData.predictions.map(p => parseFloat(p.v))).toFixed(1)}-{Math.max(...tideData.predictions.map(p => parseFloat(p.v))).toFixed(1)}ft
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                              Today's Range
                            </Typography>
                            <Box sx={{ pt: 1, borderTop: 1, borderColor: 'divider' }}>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                High: {Math.max(...tideData.predictions.filter(p => p.type === 'H').map(p => parseFloat(p.v))).toFixed(1)}ft at {new Date(tideData.predictions.find(p => p.type === 'H' && parseFloat(p.v) === Math.max(...tideData.predictions.filter(p => p.type === 'H').map(p => parseFloat(p.v))))?.t || '').toLocaleTimeString('en-US', { 
                                  hour: 'numeric', 
                                  minute: '2-digit',
                                  hour12: true 
                                })}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Low: {Math.min(...tideData.predictions.filter(p => p.type === 'L').map(p => parseFloat(p.v))).toFixed(1)}ft at {new Date(tideData.predictions.find(p => p.type === 'L' && parseFloat(p.v) === Math.min(...tideData.predictions.filter(p => p.type === 'L').map(p => parseFloat(p.v))))?.t || '').toLocaleTimeString('en-US', { 
                                  hour: 'numeric', 
                                  minute: '2-digit',
                                  hour12: true 
                                })}
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  ) : (
                    <NoData />
                  )}
                </Box>
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