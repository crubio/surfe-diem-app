import { LocationOn, Navigation } from "@mui/icons-material"
import { Card, CardContent, Divider, Typography } from "@mui/material"
import { Box } from "@mui/system"
import { useQuery } from "@tanstack/react-query"
import { formatIsoNearestHour, getTodaysDate } from "utils/common"
import { ForecastDataHourly, getOpenMeteoForecastHourly } from ".."
import { Spot } from "./types"
import { Loading } from "components"
import { isEmpty } from "lodash"

export default function SpotSummary (props: Spot) {
  const {latitude, longitude, name, subregion_name, id} = props

  const {data, isLoading: isHourlyForecastLoading, isError } = useQuery(['forecast_hourly', id], () => getOpenMeteoForecastHourly({
    latitude: latitude,
    longitude: longitude,
    start_date: getTodaysDate(),
    end_date: getTodaysDate()
  }), {
    enabled: true
  })

  const forecastStartingIndex = data?.hourly.time.findIndex((item: string) => item === formatIsoNearestHour())

  function renderLatestObservation(hourlyData: ForecastDataHourly, idx: number) {
    if (!hourlyData) return (
      <p>No data available</p>
    )
    return (
      <>
        <Typography variant="h3" sx={{marginBottom: "2px"}}>
          {hourlyData.hourly.wave_height[idx].toFixed(1)} {hourlyData.hourly_units.wave_height}
        </Typography>
        <Typography sx={{ mb: 1.5 }} color="text">
          {hourlyData.hourly.wave_period[idx].toFixed(0)} {hourlyData.hourly_units.wave_period}
        </Typography>
        <Typography sx={{ mb: 1.5 }} color="text">
          <Navigation
            sx={{transform: `rotate(${hourlyData.hourly.wave_direction[0] - 180}deg)`
            }}
          /> {hourlyData.hourly.wave_direction[idx]} {hourlyData.hourly_units.wave_direction}
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
            flexDirection: "column"
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
              {data && forecastStartingIndex && !isEmpty(data) && !isError ? (
                renderLatestObservation(data, forecastStartingIndex)
              ) : (
                <p>No data available</p>
              )}
            </Box>
          </CardContent>
        </Card>       
      )}
      
    </>
  )
}