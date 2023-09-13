import { isEmpty } from "lodash"
import { ForecastDataHourly } from ".."
import { Box, Divider, Stack, Typography } from "@mui/material"
import { formatDateWeekday } from "utils/common"
import { Item } from "components"

export interface HourlyForecastProps {
  forecast: ForecastDataHourly | undefined
  idx?: number
}

export const CurrentHourForecast = (props: HourlyForecastProps) => {
  const {forecast, idx} = props
  const startingIndex = idx || 0
  if (!forecast || isEmpty(forecast)) return

  return (
    <Item>
      <Typography sx={{marginBottom: 2}} variant="subtitle2" color={"text.secondary"}>
        {formatDateWeekday(forecast.hourly.time[startingIndex])}
      </Typography>
      <Stack direction="row" spacing={2}>
        <Stack direction="column" spacing={2}>
          <Typography variant="subtitle2" color={"text.secondary"}>wave height</Typography>
          <Typography variant="h3" sx={{marginBottom: "2px"}}>{forecast.hourly.wave_height[startingIndex].toFixed(1) + " ft"}</Typography>
        </Stack>
        <Divider orientation="vertical" flexItem />
        <Stack direction="column" spacing={2}>
          <Box><Typography variant="subtitle2" color={"text.secondary"}>wave direction</Typography>{forecast.hourly.wave_direction[startingIndex]}</Box>
          <Box><Typography variant="subtitle2" color={"text.secondary"}>wave period</Typography>{forecast.hourly.wave_period[startingIndex]}</Box>
        </Stack>
      </Stack>
    </Item>
  )
}
