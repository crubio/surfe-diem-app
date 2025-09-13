import { getForecastHourly } from "@features/forecasts"
import { getLatestObservation, getLocation } from "@features/locations/api/locations"
import { Box, Container, Grid, Link, Stack } from "@mui/material"
import { useQuery } from "@tanstack/react-query"
import { FavoriteButton, Item, SEO, BuoyStructuredData } from "components"
import { useParams } from "react-router-dom"
import { formatLatLong } from "utils/common"
import ErrorPage from "./error"
import WaveChart from "@features/charts/wave-height"
import MapBoxSingle from "@features/maps/mapbox/single-instance"
import ValueCardSmall from "components/common/value-card-small"

const LocationsPage = () => {
  const params = useParams()
  const { locationId } = params

  const { data: locationData, isError: isLocationError, error } = useQuery({
    queryKey: ['location', locationId],
    queryFn: () => getLocation(locationId)
  });

  const {data: latestObservationData, isPending: isLatestObsvLoading} = useQuery({
    queryKey: ['latest_observation', params],
    queryFn: () => getLatestObservation(locationId!),
    enabled: !!locationData?.location_id
  });

  const latLong = formatLatLong(locationData?.location || "")

  const {data: forecastDataHourly } = useQuery({
    queryKey: ['forecast_hourly', locationData?.location_id],
    queryFn: () => getForecastHourly({
      latitude: latLong[0],
      longitude: latLong[1],
      forecast_days: 1,
    }),
    enabled: !!locationData?.location_id
  });

  const latestWave = (latestObservationData ?? [])[0] || [];
  const latestSwell = (latestObservationData ?? [])[1] || [];
  
  return (
    <>
      {locationData && (
        <>
          <SEO 
            title={`${locationData.name} Buoy - Surfe Diem`}
            description={`Get real-time surf conditions and weather data from ${locationData.name} buoy. Current wave height, wind, and tide information.`}
            keywords={`${locationData.name} buoy, ${locationData.name} surf conditions, ${locationData.name} wave data, surf buoy data, real-time surf conditions`}
            url={`https://surfe-diem.com/location/${locationData.location_id}`}
          />
          <BuoyStructuredData
            name={locationData.name}
            description={locationData.description || `Weather buoy providing real-time surf conditions`}
            location={locationData.location || ''}
            url={`https://surfe-diem.com/location/${locationData.location_id}`}
            buoyUrl={locationData.url}
          />
        </>
      )}
      <div>
        {isLocationError ? <ErrorPage error={error} /> : (
        <Container sx={{marginBottom: "20px"}}>
          <h1>
            {locationData?.name}
            {locationData && (
              <FavoriteButton 
                showTooltip={true} 
                id={locationData.location_id} 
                type="buoy" 
                name={locationData.name} 
                location={locationData.location}
              />
            )}
          </h1>
          <Stack direction={{ xs: 'column', sm: 'row' }} marginBottom={'20px'} spacing={2}>
            <Item>{locationData?.description}</Item>
            <Item>{locationData?.location?.split("(")[0]}</Item>
            <Item><Link href={locationData?.url} target="_blank">more info</Link></Item>
          </Stack>

          <Grid container spacing={2} sx={{ marginBottom: '20px' }}>
            <Grid item xs={6} sm={4} md={2}>
              <ValueCardSmall
                title="Swell Height"
                value={latestSwell.swell_height}
                isLoading={isLatestObsvLoading}
              />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <ValueCardSmall
                title="Swell Period"
                value={latestSwell.period}
                isLoading={isLatestObsvLoading}
              />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <ValueCardSmall
                title="Swell Direction"
                value={latestSwell.direction}
                isLoading={isLatestObsvLoading}
              />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              {latestWave.water_temp && (
                // TODO: Uncomment when water temp card is ready
                // <TemperatureCard
                //   temperature={10}
                //   showFahrenheit={true}
                //   showComfortLevel={false}
                // />
                <ValueCardSmall
                  title="Water Temp"
                  value={latestWave.water_temp}
                  isLoading={isLatestObsvLoading}
                />
              )}
            </Grid>
          </Grid>
          { locationData?.location && latLong[0] && (
            <>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={6} lg={6}>
                  <MapBoxSingle lat={latLong[0]} lng={latLong[1]} zoom={8} />
                </Grid>
              </Grid>
            </>
          )}
        {forecastDataHourly?.hourly &&
          <Box sx={{marginTop: "20px"}}>
            <WaveChart waveHeightData={forecastDataHourly?.hourly.swell_wave_height} wavePeriodData={forecastDataHourly?.hourly.swell_wave_period} timeData={forecastDataHourly?.hourly.time} />
          </Box>
        }
      </Container>
      )}
      </div>
    </>
  )
}

export default LocationsPage