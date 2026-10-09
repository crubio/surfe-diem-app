import { useMemo } from "react"
import { Box, Button, Typography } from "@mui/material"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "react-router-dom"
import ErrorPage from "./error"
import { SEO, SurfSpotStructuredData, PageContainer } from "components"
import MapBoxSingle from "@features/maps/mapbox/single-instance"
import { WeatherInline } from "@features/weather/components/weather-inline"
import { getCurrentWeather } from "@features/weather/api"
import { ForecastRatingComponent, SpotMetricBar, MLForecastCard, SpotHero, NDBCObservationCard } from "@features/locations/components"
import { useTideData, useSpotData, useNearbyBuoys, useNWSForecast, useMLForecast, useLatestObservation, useConditions } from "hooks"
import { ForecastSection, buildDailyForecast, getForecastHeightSeries } from "@features/forecasts"
import { TideInline } from "@features/tides"
import { useColorMode } from "providers/theme-provider"
import { colorTokens } from "config/theme"
import { DEFAULT_TIMEZONE } from "utils/constants"
/* eslint-disable @typescript-eslint/no-unused-vars -- kept for the commented-out
   Weather & Tide grid below (phase 2 resurrection candidate, see
   .docs/forecast-spot-plan.md §3.D2): Grid, Loading, NoData, WeatherWind, TideSparklineCard */
import { Grid } from "@mui/material"
import { Loading } from "components"
import { NoData } from "@features/cards/no_data"
import { WeatherWind } from "@features/weather/components/weather-wind"
import { TideSparklineCard } from "@features/tides"
/* eslint-enable @typescript-eslint/no-unused-vars */

// v1 ML forecast card hidden (2026-10-08): it forecasts combined seas.
// Will be revived after a new model is trained.
const SHOW_ML_FORECAST = false

const SpotPage = () => {
  const params = useParams()
  const { spotId } = params
  const { mode } = useColorMode()
  const tokens = colorTokens[mode]

  const isSlug = spotId ? isNaN(Number(spotId)) : false

  const { data: spotData, isError, error } = useSpotData(spotId, isSlug)
  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- only needed by the commented-out TideSparklineCard below (phase 2)
    station: tideStation,
    hiLo: tideHiLo,
    chart: tideChart,
    tideAvailable,
    currentState: tideCurrentState,
    isLoading: isTideDataLoading,
  } = useTideData(spotData?.latitude, spotData?.longitude, { timezone: spotData?.timezone })
  // includePartial: wave-height-only grids still give a wave height + wind
  // forecast; the chart and cards handle the missing swell breakdown
  const { data: nwsForecastData, isLoading: isNWSLoading } = useNWSForecast(spotData?.id, { enabled: !!spotData?.id, includePartial: true })
  // Swell power, and buoy-measured swell where NWS has none
  const { data: conditions, isLoading: isConditionsLoading } = useConditions(spotData?.id)
  const { data: mlForecastData } = useMLForecast(spotData?.id, { enabled: SHOW_ML_FORECAST && !!spotData?.id })

  // TODO: create hook for current weather if thats needed in the future.
  const { data: currentWeather } = useQuery({
    queryKey: ['current_weather', spotData?.id],
    queryFn: () => getCurrentWeather({ lat: spotData!.latitude, lng: spotData!.longitude }),
    enabled: !!spotData?.name
  })

  const { data: nearbyBuoys } = useNearbyBuoys(spotData?.latitude, spotData?.longitude)

  const ndbcFallbackStation = nwsForecastData?.raw?.ndbc_fallback_station
  const { data: latestObservation } = useLatestObservation(ndbcFallbackStation ?? undefined)

  const nwsUnavailable = !isNWSLoading && !nwsForecastData?.current
  // NWS answered but has nothing to chart (e.g. a placeholder 0 wave height
  // for the whole week): skip the chart and cards; the metric bar's buoy
  // reading is the useful data here
  const nwsHasNoWaveForecast =
    !isNWSLoading && !!nwsForecastData?.current && getForecastHeightSeries(nwsForecastData.hourly) === 'none'
  const observation = latestObservation?.[0] ?? null

  // 5-day text forecast — derived client-side from the same hourly NWS data
  // that feeds the chart, plus Tide Explorer hi/lo predictions. See
  // .docs/forecast-spot-plan.md §3.A.
  const dailyForecastDays = useMemo(
    () =>
      buildDailyForecast(
        nwsForecastData?.hourly ?? [],
        tideHiLo.data?.predictions ?? null,
        spotData?.timezone || DEFAULT_TIMEZONE,
        5
      ),
    [nwsForecastData?.hourly, tideHiLo.data, spotData?.timezone]
  )

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
            {SHOW_ML_FORECAST && mlForecastData && (
              <Box sx={{ mb: 2 }}>
                <MLForecastCard data={mlForecastData} />
              </Box>
            )}

            {/* NWS forecast + rating, with condensed weather/tide readouts folded in */}
            <Box sx={{ mb: 2 }}>
              <SpotMetricBar
                current={nwsForecastData?.current}
                tideHeightFt={tideCurrentState?.currentHeight ?? null}
                isNWSLoading={isNWSLoading}
                isTideLoading={isTideDataLoading}
                conditions={conditions}
                isConditionsLoading={isConditionsLoading}
                timezone={spotData.timezone}
                weather={<WeatherInline weatherData={currentWeather} isLoading={isNWSLoading} />}
                tide={
                  <TideInline
                    tideAvailable={tideAvailable}
                    currentState={tideCurrentState}
                    isLoading={isTideDataLoading}
                    timezone={spotData.timezone}
                  />
                }
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
            </Box>

            {/* Swell forecast: chart + 5-day text (toggled on mobile, both on desktop),
                or the NDBC fallback observation when NWS has no coverage here */}
            <Box sx={{ mb: 2 }}>
              {nwsUnavailable && observation && ndbcFallbackStation ? (
                <NDBCObservationCard stationId={ndbcFallbackStation} observation={observation} timezone={spotData.timezone} />
              ) : nwsHasNoWaveForecast ? (
                <Typography color="text.secondary" sx={{ px: 0.5 }}>
                  NWS has no wave forecast for this spot. Current conditions above come from the nearest reporting buoy.
                </Typography>
              ) : (
                <ForecastSection
                  nwsData={nwsForecastData ?? null}
                  isNWSLoading={isNWSLoading}
                  dailyForecastDays={dailyForecastDays}
                  isDailyForecastLoading={isNWSLoading || tideHiLo.isLoading}
                  tideAvailable={tideAvailable}
                  tideChartSeries={tideChart.data?.predictions}
                  timezone={spotData.timezone}
                />
              )}
            </Box>

            {/* Weather & Tide — big standalone cards retired in favor of the inline
                readouts folded into "Forecast right now" above (locked decision, see
                .docs/forecast-spot-plan.md §3.D2 / §5.5).
                TODO(phase 2): repurpose TideSparklineCard as a dedicated "Tide Status" card. */}
            {/* {currentWeather && (
              <Box sx={{ mb: 2 }}>
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <WeatherWind weatherData={currentWeather} isLoading={isNWSLoading} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    {isTideDataLoading ? (
                      <Loading />
                    ) : tideChart.data?.predictions?.length ? (
                      <TideSparklineCard
                        predictions={tideChart.data.predictions}
                        stationId={tideStation.data?.station_id}
                        timezone={spotData.timezone}
                      />
                    ) : (
                      <NoData />
                    )}
                  </Grid>
                </Grid>
              </Box>
            )} */}

            {/* Map */}
            <Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mb: 2.5 }}>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        letterSpacing: '0.16em',
                        textTransform: 'none',
                        color: tokens.textTertiary,
                        mb: 0.5,
                      }}
                    >
                      Location
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: '"Bricolage Grotesque", Inter, sans-serif',
                        fontWeight: 700,
                        fontSize: '2.25rem',
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
                      fontSize: '0.875rem',
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
            </Box>

          </PageContainer>
        </>
      ) : null}
    </>
  )
}

export default SpotPage
