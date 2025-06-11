import { Stack, Typography } from "@mui/material";
import { Item, Loading } from "components";
import { CurrentWeatherProps, WeatherDataProps, WeatherTimeProps } from "../types";
import { isEmpty } from "lodash";

/**
 * time contains the startPeriodName & validStartTime arrays, eg; Today, Tonight, Tomorrow, Tomorrow Night etc.
 * data contains the actual weather data, eg; temperature & short text description
 * @param props weather object from the API
 * @returns 
 */
export const CurrentWeather = (props: CurrentWeatherProps) => {
  
  const time = props.currentWeather?.time;
  const data = props.currentWeather?.data;
  const items = props.numItems ? props.numItems : 3;

  function renderWeatherData(time: WeatherTimeProps, data: WeatherDataProps, n = items) {
    if (!time || !data) return;
    const result = [];
    for(let i = 0; i < n; i++) {
      result.push(
        <Item key={i} sx={{textAlign: {xs: 'center'}}}>
          <Stack direction="column" spacing={1} justifyContent="center">
            <Typography>{time.startPeriodName[i]}</Typography>
            <Typography variant="h4">{data.temperature[i] ? data.temperature[i] : '--'}{data.temperature[i] && (<>&#8457;</>)}</Typography>
          </Stack>
          <Typography sx={{marginBottom: "2px"}}>{data.text[i]? data.text[i] : '--'}</Typography>
        </Item>
      )
    }
    return result
  }

  return (
    <>
      {props.isLoading && (
        <Loading />
      )}
      {time && data && !props.isLoading && (
        <Stack direction={{ xs: 'column', sm: 'row' }} marginBottom={'20px'} spacing={2}>
          {renderWeatherData(time, data)}
        </Stack>
      )}
      {isEmpty(time) && isEmpty(data) && !props.isLoading && (
        <Typography variant="subtitle1" color="textSecondary">No current weather data available</Typography>
      )}
    </>
  )
}
