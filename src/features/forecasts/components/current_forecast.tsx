import { isEmpty } from "lodash"
import { ForecastDataCurrent } from ".."
import { Box, Divider, Stack, Typography } from "@mui/material"
import { formatDateWeekday, formatNumber } from "utils/common"
import { Item } from "components"
import { NoData } from "@features/cards/no_data"

export interface CurrentForecastProps {
  forecast: ForecastDataCurrent
}

export const CurrentForecast = (props: CurrentForecastProps) => {
  const {forecast} = props
  if (!forecast || isEmpty(forecast)) return <NoData />

  return (
    <Item>
      <Typography sx={{marginBottom: 2}} variant="subtitle2" color={"text.secondary"}>
        {formatDateWeekday(forecast.current.time)}
      </Typography>
      <Stack direction="row" spacing={2}>
        <Stack direction="column" spacing={2}>
          <Typography variant="subtitle2" color={"text.secondary"}>swell height</Typography>
          <Typography variant="h3" sx={{marginBottom: "2px"}}>{formatNumber(forecast.current.swell_wave_height, 1)}{forecast.current_units.swell_wave_height}</Typography>
        </Stack>
        <Divider orientation="vertical" flexItem />
        <Stack direction="column" spacing={2}>
          <Box>
            <Typography 
              variant="subtitle2" 
              color={"text.secondary"}
            >
              {"swell direction"}
            </Typography>{forecast.current.swell_wave_direction}{forecast.current_units.swell_wave_direction}
          </Box>
          <Box>
            <Typography variant="subtitle2" color={"text.secondary"}>swell period</Typography>{formatNumber(forecast.current.swell_wave_period, 0)}{forecast.current_units.swell_wave_period}
          </Box>
        </Stack>
      </Stack>
    </Item>
  )
}
