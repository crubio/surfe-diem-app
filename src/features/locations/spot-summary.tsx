import { LocationOn, Navigation } from "@mui/icons-material"
import { Button, Card, CardActions, CardContent, Divider, Typography } from "@mui/material"
import { Box } from "@mui/system"
import { useQuery } from "@tanstack/react-query"
import { formatIsoNearestHour, getTodaysDate } from "utils/common"
import { ForecastDataHourly, getForecastHourly } from ".."
import { Spot } from "./types"
import { Loading } from "components"
import { Link } from 'react-router-dom';

export default function SpotSummary (props: Spot) {
  const {latitude, longitude, name, subregion_name, id} = props

  const {data, isLoading: isHourlyForecastLoading } = useQuery(['forecast_hourly', id], () => getForecastHourly({
    latitude: latitude,
    longitude: longitude,
    start_date: getTodaysDate(),
    end_date: getTodaysDate()
  }), {
    enabled: true
  })

  const forecastStartingIndex = data?.hourly.time.findIndex((item: string) => item === formatIsoNearestHour(props.timezone))

  function renderLatestObservation(hourlyData: ForecastDataHourly, idx: number) {
    if (!hourlyData || forecastStartingIndex == -1) return (
      <p>No data available</p>
    )
    return (
      <>
        <Typography variant="h3" sx={{marginBottom: "2px"}}>
          {hourlyData.hourly.swell_wave_height[idx].toFixed(1)} {hourlyData.hourly_units.swell_wave_height}
        </Typography>
        <Typography sx={{ mb: 1.5 }} color="text">
          {hourlyData.hourly.swell_wave_period[idx].toFixed(0)} {hourlyData.hourly_units.swell_wave_period}
        </Typography>
        <Typography sx={{ mb: 1.5 }} color="text">
          <Navigation
            sx={{transform: `rotate(${hourlyData.hourly.swell_wave_direction[0] - 180}deg)`
            }}
          /> {hourlyData.hourly.swell_wave_direction[idx]} {hourlyData.hourly_units.swell_wave_direction}
        </Typography>
      </>
    )
  }

  return (
    <>
      {isHourlyForecastLoading ? (
        <Loading />
      ) : (
        <Card key={id} data-testid="location-summary-card"
          sx={{ 
            height: "100%",
            display: "flex",
            flexDirection: "column",
            width: "100%",
          }}
        >
          <CardContent>
            <h2>{name}</h2>
            <Typography sx={{ mb: 1 }} color="text.secondary">
              {subregion_name}
            </Typography>
            <Typography sx={{ mb: 1 }} color="text.secondary">
              <LocationOn /> {latitude.toFixed(2)}, {longitude.toFixed(2)}
            </Typography>

            <Box sx={{ mb: 1 }}>
              <Divider variant="middle" />
            </Box>
            <Box className="current-conditions">
              {data && forecastStartingIndex ? (
                renderLatestObservation(data, forecastStartingIndex)
              ) : (
                <p>No data available</p>
              )}
            </Box>
          </CardContent>
          <CardActions disableSpacing sx={{ mt: "auto" }}>
            <Button color="secondary" component={Link} to={`/spot/${id}`}>
              View spot
            </Button>
          </CardActions>
        </Card>       
      )}
      
    </>
  )
}