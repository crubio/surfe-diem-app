import { isEmpty } from "lodash"
import { ForecastDataHourly } from ".."
import { Box, Divider, Stack, Typography } from "@mui/material"
import { formatDateWeekday } from "utils/common"
import { Item } from "components"
import { NoData } from "@features/cards/no_data"

export interface HourlyForecastProps {
  forecast: ForecastDataHourly | undefined
  idx?: number
}

export const CurrentHourForecast = (props: HourlyForecastProps) => {
  const {forecast, idx} = props
  const startingIndex = idx || 0
  if (!forecast || isEmpty(forecast)) return <NoData />

  return (
    <Item>
      <Typography sx={{marginBottom: 2}} variant="subtitle2" color={"text.secondary"}>
        {formatDateWeekday(forecast.hourly.time[startingIndex])}
      </Typography>
      <Stack direction="row" spacing={2}>
        <Stack direction="column" spacing={2}>
          <Typography variant="subtitle2" color={"text.secondary"}>max swell</Typography>
          <Typography variant="h3" sx={{marginBottom: "2px"}}>{forecast.hourly.swell_wave_height[startingIndex].toFixed(1) + " ft"}</Typography>
        </Stack>
        <Divider orientation="vertical" flexItem />
        <Stack direction="column" spacing={2}>
          <Box><Typography variant="subtitle2" color={"text.secondary"}>swell direction</Typography>{forecast.hourly.swell_wave_direction[startingIndex]}{forecast.hourly_units.wave_direction}</Box>
          <Box><Typography variant="subtitle2" color={"text.secondary"}>swell period</Typography>{forecast.hourly.swell_wave_period[startingIndex]}</Box>
        </Stack>
      </Stack>
    </Item>
  )
}
