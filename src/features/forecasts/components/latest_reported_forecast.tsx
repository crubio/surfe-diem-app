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

  if (isEmpty(wave) && isEmpty(swell) && isEmpty(wind)) return <NoData />
  return (
    <Item>
      <Box>
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
      </Box>
      
      { swell && (
        <Stack direction="column" spacing={2} marginBottom={"20px"} className="swell-forecast-latest">
          <Typography variant="subtitle2" color={"text.secondary"}>swell</Typography>
          <Stack direction={"row"} spacing={2}>
            <Box>
              <Typography variant="h5" sx={{marginBottom: "2px"}}>{swell.swell_height ? swell.swell_height : dash}</Typography>
            </Box>
            <Box>
            <Typography variant="h5" sx={{marginBottom: "2px"}}>{swell.period ? swell.period : dash}</Typography>
            </Box>
            <Box>
              <Typography variant="h5" sx={{marginBottom: "2px"}}>{swell.direction ? swell.direction : dash}</Typography>
            </Box>
          </Stack>
        </Stack>
      )}
      { wind && (
        <Stack direction="column" spacing={2} marginBottom={"20px"} className="wind-forecast-latest">
          <Typography variant="subtitle2" color={"text.secondary"}>wind</Typography>
          <Stack direction={"row"} spacing={2}>
            <Box>
              <Typography variant="h5" sx={{marginBottom: "2px"}}>{wind.wind_wave_height ? wind.wind_wave_height : dash}</Typography>
            </Box>
            <Box>
            <Typography variant="h5" sx={{marginBottom: "2px"}}>{wind.period ? wind.period : dash}</Typography>
            </Box>
            <Box>
              <Typography variant="h5" sx={{marginBottom: "2px"}}>{wind.direction ? wind.direction : dash}</Typography>
            </Box>
          </Stack>
        </Stack>
      )}
    </Item>
  )
}
