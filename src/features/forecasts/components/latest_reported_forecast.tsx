import { BuoyLocationLatestObservation } from "@features/locations/types"
import { WarningAmberOutlined } from "@mui/icons-material";
import { Box, Divider, Paper, Stack, Typography } from "@mui/material";
import { Item } from "components";
import { formatDate, validateIsCurrent } from "utils/common";

interface LatestReportedForecastProps {
  forecast: BuoyLocationLatestObservation
}

export const LatestReportedForecast = (props: LatestReportedForecastProps) => {
  const {forecast} = props
  const validReport = validateIsCurrent(forecast.published);
  const dash: JSX.Element = (<code>&#8212;</code>)

  return (
    <>
      <Paper sx={{ p: 2}}>
        <Typography sx={{marginBottom: 2}} variant="subtitle2" color={"text.secondary"}>
          {!validReport && (<><WarningAmberOutlined color="warning"/> Last reported{' '}</>)}
          {forecast.published && formatDate(forecast.published)}
        </Typography>
        <Stack direction="row" spacing={2}>
          <Stack direction="column" spacing={2}>
            <Typography variant="subtitle2" color={"text.secondary"}>wave height</Typography>
            <Typography variant="h3" sx={{marginBottom: "2px"}}>{validReport ? forecast.significant_wave_height : dash}</Typography>
          </Stack>
          <Divider orientation="vertical" flexItem />
          <Stack direction="column" spacing={2}>
            <Box><Typography variant="subtitle2" color={"text.secondary"}>mean direction</Typography>{validReport ? forecast.mean_wave_direction : dash}</Box>
            <Box><Typography variant="subtitle2" color={"text.secondary"}>wave period</Typography>{validReport ? forecast.dominant_wave_period: dash}</Box>
            <Box><Typography variant="subtitle2" color={"text.secondary"}>temperature</Typography>{validReport ? forecast.water_temp: dash}</Box>
          </Stack>
        </Stack>
      </Paper>
      { forecast.wind_direction && forecast.wind_speed && (
        <Box>
          <p>Wind data</p>
          <Item>
            {forecast.wind_speed}
          </Item>
          <Item>
            {forecast.wind_direction}
          </Item>
        </Box>
      )}
    </>
  )
}
