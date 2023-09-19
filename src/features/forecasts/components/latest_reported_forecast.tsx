import { BuoyLocationLatestObservation } from "@features/locations/types"
import { WarningAmberOutlined } from "@mui/icons-material";
import { Box, Divider, Stack, Typography } from "@mui/material";
import { Item } from "components";
import { isEmpty } from "lodash";
import { formatDate, validateIsCurrent } from "utils/common";

interface LatestReportedForecastProps {
  forecast: BuoyLocationLatestObservation
}

export const LatestReportedForecast = (props: LatestReportedForecastProps) => {
  const {forecast} = props
  const validReport = validateIsCurrent(forecast.published, 2);
  const dash: JSX.Element = (<code>&#8212;</code>)

  return (
    <>
      <Item>
        {isEmpty(forecast) ? (
          <>
            <Stack direction="row" spacing={2}>
              <WarningAmberOutlined color="warning"/>
              <Typography sx={{marginBottom: 2}} variant="subtitle2" color={"text.secondary"}>
                No data available
              </Typography>
            </Stack>
          </>
        ) : (
          <>
            <Typography sx={{marginBottom: 2}} variant="subtitle2" color={"text.secondary"}>
              {!validReport && (<><WarningAmberOutlined color="warning"/> Last reported{' '}</>)}
              {forecast.published && formatDate(forecast.published)}
            </Typography>
            <Stack direction="row" spacing={2}>
              <Stack direction="column" spacing={2}>
                <Typography variant="subtitle2" color={"text.secondary"}>wave height</Typography>
                <Typography variant="h3" sx={{marginBottom: "2px"}}>{forecast.significant_wave_height ? forecast.significant_wave_height : dash}</Typography>
              </Stack>
              <Divider orientation="vertical" flexItem />
              <Stack direction="column" spacing={2}>
                <Box><Typography variant="subtitle2" color={"text.secondary"}>mean direction</Typography>{forecast.mean_wave_direction ? forecast.mean_wave_direction : dash}</Box>
                <Box><Typography variant="subtitle2" color={"text.secondary"}>wave period</Typography>{forecast.dominant_wave_period ? forecast.dominant_wave_period: dash}</Box>
                <Box><Typography variant="subtitle2" color={"text.secondary"}>temperature</Typography>{forecast.water_temp ? forecast.water_temp: dash}</Box>
              </Stack>
            </Stack>
          </>
        )}
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
      </Item>
    </>
  )
}
