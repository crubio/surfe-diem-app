import { NoData } from "@features/cards/no_data";
import { Box, Divider, Stack, Typography } from "@mui/material";
import { Item } from "components";
import { isEmpty } from "lodash";

interface LatestReportedForecastProps {
  [key: string]: string
}

export const LatestReportedForecast = (props: LatestReportedForecastProps[]) => {
  const wave = props[0]
  const swell = props[1]
  const wind = props[2]
  const dash: JSX.Element = (<code>&#8212;</code>)
  return (
    <>
      <Item>
        {isEmpty(wave) ? (
          <>
            <NoData />
          </>
        ) : (
          <>
            <Stack direction="row" spacing={2} marginBottom={"20px"}>
              <Stack direction="column" spacing={2}>
                <Typography variant="subtitle2" color={"text.secondary"}>overall height</Typography>
                <Typography variant="h3" sx={{marginBottom: "2px"}}>{wave.wave_height}</Typography>
              </Stack>
              <Divider orientation="vertical" flexItem />
              <Stack direction="column" spacing={2}>
                <Box><Typography variant="subtitle2" color={"text.secondary"}>period</Typography>{wave.peak_period}</Box>
                <Box><Typography variant="subtitle2" color={"text.secondary"}>temperature</Typography>{wave.water_temp}</Box>
              </Stack>
            </Stack>
          </>
        )}
        { wind && (
          <Box marginTop={"8px"} marginBottom={"8px"}>
            <Typography variant="subtitle2" color={"text.secondary"}>wind</Typography>
            <Box>
              height: {wind.wind_height ? wind.wind_height : dash}
            </Box>
            <Box>
              period: {wind.period ? wind.period : dash}
            </Box>
            <Box>
              direction: {wind.direction ? wind.direction : dash}
            </Box>
          </Box>
          
        )}
        { swell && (
          <Box marginTop={"8px"} marginBottom={"8px"}>
            <Typography variant="subtitle2" color={"text.secondary"}>swell</Typography>
            <Box>
              height: {swell.swell_height ? swell.swell_height : dash}
            </Box>
            <Box>
              period: {swell.period ? swell.period : dash}
            </Box>
            <Box>
              direction: {swell.direction ? swell.direction : dash}
            </Box>
          </Box>
        )}
      </Item>
    </>
  )
}
