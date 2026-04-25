import { Box, Card, CardContent, Grid, Stack, Typography } from "@mui/material"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "react-router-dom"
import ErrorPage from "./error"
import { FavoriteButton, Item, Loading, SEO, SurfSpotStructuredData, PageContainer, SectionContainer } from "components"
import { isEmpty } from "lodash"
import MapBoxSingle from "@features/maps/mapbox/single-instance"
import { WeatherWind } from "@features/weather/components/weather-wind"
import { getCurrentWeather } from "@features/weather/api"
import { NoData } from "@features/cards/no_data"
import { ForecastRatingComponent, SpotMetricBar } from "@features/locations/components"
import { formatCoordinates } from "utils/formatting"
import { useTideData, useSpotData, useNearbyBuoys, useNWSForecast} from "hooks"
import { SurfScoreWaveChart } from "@features/charts/surf-score-wave-chart"

const SpotPage = () => {
  const params = useParams()
  const { spotId } = params

  // Determine if spotId is a slug (non-numeric) or ID (numeric)
  const isSlug = spotId ? isNaN(Number(spotId)) : false

  const {data: spotData, isError, error} = useSpotData(spotId, isSlug)

  const {dailyTides, currentTides, isLoading: isTideDataLoading} = useTideData(spotData?.latitude, spotData?.longitude)

  // NWS fetch
  const {data: nwsForecastData, isLoading: isNWSLoading} = useNWSForecast(spotData?.id, { enabled: !!spotData?.id })

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

          {/* Hero: name, location, metrics, rating */}
          <SectionContainer
            background="DEFAULT"
            spacing="NORMAL"
            marginBottom="NORMAL"
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold' }}>
                {spotData.name}
              </Typography>
              <Box sx={{ ml: 2.5 }}>
                <FavoriteButton showTooltip={true} id={spotData.id} type="spot" name={spotData.name} subregion_name={spotData.subregion_name} latitude={spotData.latitude} longitude={spotData.longitude} />
              </Box>
            </Box>

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

            <SpotMetricBar
              current={nwsForecastData?.current}
              currentTides={currentTides.data}
              isNWSLoading={isNWSLoading}
              isTideLoading={isTideDataLoading}
            />

            {nwsForecastData?.current && (
              <ForecastRatingComponent
                spotId={spotData.id}
                spotSlug={spotData.slug}
                spotName={spotData.name}
                forecastData={{
                  current: nwsForecastData.current,
                  timestamp: new Date().toISOString(),
                  spot_id: spotData.id,
                  spot_name: spotData.name
                }}
              />
            )}
          </SectionContainer>

          {/* Swell forecast chart */}
          <SectionContainer
            background="PAPER"
            spacing="NORMAL"
            marginBottom="NORMAL"
          >
            <SurfScoreWaveChart data={nwsForecastData ?? null} isLoading={isNWSLoading} height={250} />
          </SectionContainer>

          {/* Weather & Tide */}
          {currentWeather && (
            <SectionContainer
              title="Weather & Tide"
              background="PAPER"
              spacing="NORMAL"
              marginBottom="NORMAL"
            >
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <WeatherWind weatherData={currentWeather} isLoading={isNWSLoading} />
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
                            <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold', fontSize: '1.25rem', mb: 0.5 }}>
                              {dailyTides.data.predictions.map((p: any) => (
                                <><span key={p.t}>{parseFloat(p.v).toFixed(1)}ft at {new Date(p.t).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span><br /></>
                              ))}
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

          {/* Map */}
          {!isEmpty(spotData) && (
            <SectionContainer
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

        </PageContainer>
      ): null}
    </>
  )
}

export default SpotPage
