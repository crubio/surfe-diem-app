import { isEmpty } from "lodash"
import { ForecastDataDaily } from ".."
import { formatDateShortWeekday } from "utils/common"
import { Typography } from "@mui/material"
import { Item } from "components"

export interface DailyForecastProps {
  forecast: ForecastDataDaily
}

export const DailyForecast = (props: DailyForecastProps) => {
  const {forecast} = props
  function renderForecast(data: ForecastDataDaily) {
    if (!data || isEmpty(data)) return
    const result = []
    for(let i = 0; i < data.daily.time.length; i++) {
      result.push(
          <Item key={data.daily.time[i]}>
            {formatDateShortWeekday(data.daily.time[i])}
            <Typography variant="subtitle2" color={"text.secondary"}>max wave height</Typography>
            <Typography variant="h3" sx={{marginBottom: "2px"}}>{data.daily.wave_height_max[i] ? data.daily.wave_height_max[i].toFixed(1)+' ft' : "N/A"}</Typography>
          </Item>
      )
    }
    return result
  }
  

  return (
    <>
      {renderForecast(forecast)}
    </>
  )
}
