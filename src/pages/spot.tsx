import { Box, Grid, Stack, Typography, Card, CardContent } from "@mui/material"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "react-router-dom"
import ErrorPage from "./error"
import { FavoriteButton, Item, Loading, SEO, SurfSpotStructuredData, PageContainer, SectionContainer } from "components"
import { isEmpty } from "lodash"
import WaveChart from "@features/charts/wave-height"
import MapBoxSingle from "@features/maps/mapbox/single-instance"
import { WeatherWind } from "@features/weather/components/weather-wind"
import { getCurrentWeather } from "@features/weather/api"
import { NoData } from "@features/cards/no_data"
import { ForecastRatingComponent } from "@features/locations/components"
import { formatCoordinates, formatTemperature, formatDirection } from "utils/formatting"
import { getCurrentTideValue } from "utils/tides"
import { useTideData, useForecastData, useSpotData, useNearbyBuoys} from "hooks"

const SpotPage = () => {
  const params = useParams()
  const { spotId } = params

  // Determine if spotId is a slug (non-numeric) or ID (numeric)
  const isSlug = spotId ? isNaN(Number(spotId)) : false

  const {data: spotData, isError, error} = useSpotData(spotId, isSlug)

  const {dailyTides, currentTides, isLoading: isTideDataLoading} = useTideData(spotData?.latitude, spotData?.longitude)

  const {hourly: forecastDataHourly, current: forecastCurrent, isLoading: isWeatherLoading} = useForecastData(spotData?.latitude, spotData?.longitude)
  
  // TODO: create hook for current weather if thats needed in the future.
  const {data: currentWeather} = useQuery({
    queryKey: ['current_weather', spotData?.id],
    queryFn: () => getCurrentWeather({lat: spotData!.latitude, lng: spotData!.longitude}),
    enabled: !!spotData?.name
  });

  const {data: nearbyBuoys} = useNearbyBuoys(spotData?.latitude, spotData?.longitude)

  return (
    <>
      {spotData && (
        <>
          <SEO 
            title={`${spotData.name} Surf Spot - Surfe Diem`}
            description={`Get current surf conditions, forecasts, and tide information for ${spotData.name} in ${spotData.subregion_name}. Real-time surf data and weather.`}
            keywords={`${spotData.name} surf spot, ${spotData.subregion_name} surf, ${spotData.name} surf conditions, ${spotData.name} surf forecast, ${spotData.subregion_name} surf spots`}
            url={`https://surfe-diem.com/spot/${spotData.slug}`}
          />
          <SurfSpotStructuredData
            name={spotData.name}
            description={`Surf spot in ${spotData.subregion_name} with current conditions and forecasts`}
            latitude={spotData.latitude}
            longitude={spotData.longitude}
            subregion={spotData.subregion_name}
            timezone={spotData.timezone}
            url={`https://surfe-diem.com/spot/${spotData.slug}`}
          />
        </>
      )}
      {isError && <ErrorPage error={error} />}
      {spotData ? (
        <PageContainer maxWidth="XL" padding="MEDIUM" marginBottom={20}>
          {/* Hero Section */}
          <SectionContainer 
            background="DEFAULT"
            spacing="NORMAL"
            marginBottom="LARGE"
          >
            {/* Header with spot name and favorite button */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold' }}>
                {spotData.name}
              </Typography>
              <Box sx={{ ml: 2.5 }}> {/* 20px margin left */}
                <FavoriteButton showTooltip={true} id={spotData.id} type="spot" name={spotData.name} subregion_name={spotData.subregion_name} latitude={spotData.latitude} longitude={spotData.longitude} />
              </Box>
            </Box>

            {/* Location info */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
              <Item>
                <Typography variant="body2" color="text.secondary">
                  {formatCoordinates(spotData.latitude, spotData.longitude)}
                </Typography>
              </Item>
              <Item>
                <Typography variant="body2" color="text.secondary">
                  {spotData.subregion_name}
                </Typography>
              </Item>
              <Item>
                <Typography variant="body2" color="text.secondary">
                  {spotData.timezone}
                </Typography>
              </Item>
            </Stack>

            {/* Key Metrics Grid */}
            <Grid container spacing={2}>
              {/* Wave Height */}
              <Grid item xs={6} sm={4} md={2}>
              <Card sx={{ height: '100%', textAlign: 'center' }}>
                <CardContent sx={{ py: 2 }}>
                  {isWeatherLoading ? (
                    <Loading />
                  ) : forecastCurrent?.data?.current?.swell_wave_height ? (
                    <>
                      <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold', fontSize: '2.25rem' }}>
                        {`${forecastCurrent.data.current.swell_wave_height.toFixed(1)}ft`}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Wave Height
                      </Typography>
                    </>
                  ) : (
                    <NoData />
                  )}
                </CardContent>
              </Card>
              </Grid>

              {/* Period */}
              <Grid item xs={6} sm={4} md={2}>
                <Card sx={{ height: '100%', textAlign: 'center' }}>
                  <CardContent sx={{ py: 2 }}>
                    {isWeatherLoading ? (
                      <Loading />
                    ) : forecastCurrent?.data?.current?.swell_wave_period ? (
                      <>
                        <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold', fontSize: '2.25rem' }}>
                          {`${forecastCurrent.data.current.swell_wave_period}s`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Period
                        </Typography>
                      </>
                    ) : (
                      <NoData />
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Direction */}
              <Grid item xs={6} sm={4} md={2}>
                <Card sx={{ height: '100%', textAlign: 'center' }}>
                  <CardContent sx={{ py: 2 }}>
                    {isWeatherLoading ? (
                      <Loading />
                    ) : forecastCurrent?.data?.current?.swell_wave_direction ? (
                      <>
                        <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold', fontSize: '2.25rem' }}>
                          {formatDirection(forecastCurrent.data.current.swell_wave_direction)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Direction
                        </Typography>
                      </>
                    ) : (
                      <NoData />
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Water Temp */}
              <Grid item xs={6} sm={4} md={2}>
                <Card sx={{ height: '100%', textAlign: 'center' }}>
                  <CardContent sx={{ py: 2 }}>
                    {isWeatherLoading ? (
                      <Loading />
                    ) : forecastCurrent?.data?.current?.sea_surface_temperature ? (
                      <>
                        <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold', fontSize: '2.25rem' }}>
                          {formatTemperature(forecastCurrent.data.current.sea_surface_temperature)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Water Temp
                        </Typography>
                      </>
                    ) : (
                      <NoData />
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Wind */}
              <Grid item xs={6} sm={4} md={2}>
                <Card sx={{ height: '100%', textAlign: 'center' }}>
                  <CardContent sx={{ py: 2 }}>
                    {isWeatherLoading ? (
                      <Loading />
                    ) : forecastCurrent?.data?.current?.wind_wave_direction ? (
                      <>
                        <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold', fontSize: '2.25rem' }}>
                          {formatDirection(forecastCurrent.data.current.wind_wave_direction)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Wind
                        </Typography>
                      </>
                    ) : (
                      <NoData />
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Current Tide */}
              <Grid item xs={6} sm={4} md={2}>
                <Card sx={{ height: '100%', textAlign: 'center' }}>
                  <CardContent sx={{ py: 2 }}>
                    {isTideDataLoading ? (
                      <Loading />
                    ) : currentTides?.data ? (
                      <>
                        <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold', fontSize: '2.25rem' }}>
                          {getCurrentTideValue(currentTides.data) ? `${getCurrentTideValue(currentTides.data)?.toFixed(1)}ft`: <NoData/>}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Current Tide
                        </Typography>
                      </>
                    ) : (
                      <NoData />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            {spotData && forecastCurrent?.data?.current && (
                <ForecastRatingComponent
                  spotId={spotData.id}
                  spotSlug={spotData.slug}
                  spotName={spotData.name}
                  forecastData={{
                    current: forecastCurrent.data.current,
                    timestamp: new Date().toISOString(),
                    spot_id: spotData.id,
                    spot_name: spotData.name
                  }}
                />
              )}
          </SectionContainer>
          {currentWeather && (
            <SectionContainer 
              title="Weather & Tide Status"
              background="PAPER"
              spacing="NORMAL"
              marginBottom="NORMAL"
            >
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <WeatherWind weatherData={currentWeather} isLoading={isWeatherLoading} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold', mb: 3 }}>
                      Tide Status
                    </Typography>
                    {isTideDataLoading ? (
                      <Loading />
                    ) : dailyTides?.data && currentTides?.data ? (
                      <Card sx={{ textAlign: 'center' }}>
                        <CardContent sx={{ py: 1, px: 2 }}>
                          <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold', fontSize: '2.25rem', mb: 0.5 }}>
                            {Math.min(...dailyTides.data.predictions.map((p: any) => parseFloat(p.v))).toFixed(1)}-{Math.max(...dailyTides.data.predictions.map((p: any) => parseFloat(p.v))).toFixed(1)}ft
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                            Today's Range
                          </Typography>
                          <Box sx={{ pt: 1, borderTop: 1, borderColor: 'divider' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                              High: {Math.max(...dailyTides.data.predictions.filter((p: any) => p.type === 'H').map((p: any) => parseFloat(p.v))).toFixed(1)}ft at {new Date(dailyTides.data.predictions.find((p: any) => p.type === 'H' && parseFloat(p.v) === Math.max(...dailyTides.data.predictions.filter((p: any) => p.type === 'H').map((p: any) => parseFloat(p.v))))?.t || '').toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit',
                                hour12: true 
                              })}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Low: {Math.min(...dailyTides.data.predictions.filter((p: any) => p.type === 'L').map((p: any) => parseFloat(p.v))).toFixed(1)}ft at {new Date(dailyTides.data.predictions.find((p: any) => p.type === 'L' && parseFloat(p.v) === Math.min(...dailyTides.data.predictions.filter((p: any) => p.type === 'L').map((p: any) => parseFloat(p.v))))?.t || '').toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit',
                                hour12: true 
                              })}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    ) : (
                      <NoData />
                    )}
                  </Box>
                </Grid>
              </Grid>
            </SectionContainer>
          )}
          { !isEmpty(spotData) && (
            <SectionContainer 
              title="Location Map"
              background="PAPER"
              spacing="NORMAL"
              marginBottom="NORMAL"
            >
              <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={6} lg={6}>
                  <MapBoxSingle 
                    lat={spotData.latitude} 
                    lng={spotData.longitude} 
                    zoom={8} 
                    nearbyBuoys={nearbyBuoys || []}
                  />
                </Grid>
              </Grid>
            </SectionContainer>
          )}


          {forecastDataHourly?.data?.hourly && (
            <SectionContainer 
              title="Wave & Tide Forecast"
              background="PAPER"
              spacing="NORMAL"
              marginBottom="NORMAL"
            >
              <WaveChart 
                waveHeightData={forecastDataHourly?.data.hourly.swell_wave_height} 
                wavePeriodData={forecastDataHourly?.data.hourly.swell_wave_period} 
                timeData={forecastDataHourly?.data.hourly.time}
                tideData={dailyTides?.data}
              />
            </SectionContainer>
          )}
        </PageContainer>
      ): null}
    </>
  )
}

export default SpotPage