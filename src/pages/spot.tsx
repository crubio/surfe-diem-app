import { Box, Button, Grid, Typography } from "@mui/material"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "react-router-dom"
import ErrorPage from "./error"
import { Loading, SEO, SurfSpotStructuredData, PageContainer, SectionContainer } from "components"
import MapBoxSingle from "@features/maps/mapbox/single-instance"
import { WeatherWind } from "@features/weather/components/weather-wind"
import { getCurrentWeather } from "@features/weather/api"
import { NoData } from "@features/cards/no_data"
import { ForecastRatingComponent, SpotMetricBar, MLForecastCard, SpotHero } from "@features/locations/components"
import { useTideData, useSpotData, useNearbyBuoys, useNWSForecast, useMLForecast } from "hooks"
import { SurfScoreWaveChart } from "@features/charts/surf-score-wave-chart"
import { TideSparklineCard } from "@features/tides"

const SpotPage = () => {
  const params = useParams()
  const { spotId } = params

  const isSlug = spotId ? isNaN(Number(spotId)) : false

  const { data: spotData, isError, error } = useSpotData(spotId, isSlug)
  const { station, dailyTides, currentTides, isLoading: isTideDataLoading } = useTideData(spotData?.latitude, spotData?.longitude)
  const { data: nwsForecastData, isLoading: isNWSLoading } = useNWSForecast(spotData?.id, { enabled: !!spotData?.id })
  const { data: mlForecastData } = useMLForecast(spotData?.id, { enabled: !!spotData?.id })

  // TODO: create hook for current weather if thats needed in the future.
  const { data: currentWeather } = useQuery({
    queryKey: ['current_weather', spotData?.id],
    queryFn: () => getCurrentWeather({ lat: spotData!.latitude, lng: spotData!.longitude }),
    enabled: !!spotData?.name
  })

  const { data: nearbyBuoys } = useNearbyBuoys(spotData?.latitude, spotData?.longitude)

  return (
    <>
      {spotData && (
        <>
          <SEO title={`${spotData.name} Surf Spot - Surfe Diem`} />
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
        <>
          <SpotHero
            spotId={spotData.id}
            spotName={spotData.name}
            subregionName={spotData.subregion_name}
            latitude={spotData.latitude}
            longitude={spotData.longitude}
            timezone={spotData.timezone}
            current={nwsForecastData?.current ?? null}
            hourly={nwsForecastData?.hourly ?? []}
          />

          <PageContainer maxWidth="XL" padding="MEDIUM" marginBottom={20}>

            {/* ML model */}
            {mlForecastData && (
              <SectionContainer background="DEFAULT" spacing="TIGHT" marginBottom="NORMAL">
                <MLForecastCard data={mlForecastData} />
              </SectionContainer>
            )}

            {/* NWS forecast + rating */}
            <SectionContainer background="DEFAULT" spacing="TIGHT" marginBottom="NORMAL">
              <SpotMetricBar
                current={nwsForecastData?.current}
                currentTides={currentTides.data}
                isNWSLoading={isNWSLoading}
                isTideLoading={isTideDataLoading}
              >
                {nwsForecastData?.current && (
                  <ForecastRatingComponent
                    spotId={spotData.id}
                    spotSlug={spotData.slug}
                    spotName={spotData.name}
                    forecastData={{
                      current: nwsForecastData.current,
                      timestamp: new Date().toISOString(),
                      spot_id: spotData.id,
                      spot_name: spotData.name,
                    }}
                  />
                )}
              </SpotMetricBar>
            </SectionContainer>

            {/* Swell forecast chart */}
            <SectionContainer background="DEFAULT" spacing="TIGHT" marginBottom="NORMAL">
              <SurfScoreWaveChart data={nwsForecastData ?? null} isLoading={isNWSLoading} height={250} />
            </SectionContainer>

            {/* Weather & Tide */}
            {currentWeather && (
              <SectionContainer background="DEFAULT" spacing="NORMAL" marginBottom="NORMAL">
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <WeatherWind weatherData={currentWeather} isLoading={isNWSLoading} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    {isTideDataLoading ? (
                      <Loading />
                    ) : dailyTides?.data && currentTides?.data ? (
                      <TideSparklineCard
                        predictions={dailyTides.data.predictions}
                        stationId={station.data?.station_id}
                      />
                    ) : (
                      <NoData />
                    )}
                  </Grid>
                </Grid>
              </SectionContainer>
            )}

            {/* Map */}
            <SectionContainer background="DEFAULT" spacing="NORMAL" marginBottom="NORMAL">
                <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mb: 2.5 }}>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '0.16em',
                        textTransform: 'uppercase',
                        color: 'text.secondary',
                        mb: 0.5,
                      }}
                    >
                      Location
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: '"Bricolage Grotesque", Inter, sans-serif',
                        fontWeight: 700,
                        fontSize: 36,
                        letterSpacing: '-0.025em',
                        lineHeight: 1.05,
                      }}
                    >
                      Explore
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    href={`https://www.google.com/maps?q=${spotData.latitude},${spotData.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      borderRadius: '999px',
                      px: 2,
                      fontWeight: 600,
                      fontSize: 13,
                    }}
                  >
                    Open in map ↗
                  </Button>
                </Box>
                <MapBoxSingle
                  lat={spotData.latitude}
                  lng={spotData.longitude}
                  zoom={8}
                  nearbyBuoys={nearbyBuoys || []}
                />
            </SectionContainer>

          </PageContainer>
        </>
      ) : null}
    </>
  )
}

export default SpotPage
