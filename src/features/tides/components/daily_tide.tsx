import { NoData } from "@features/cards/no_data"
import { TidesDataDaily } from ".."
import { Box, Typography } from "@mui/material"
import { Item } from "components"
import { formatDateShortWeekday, formatDateHour, formatNumber } from "utils/common"

enum TideType {
  H = "High",
  L = "Low"
}

export const DailyTide = (props: TidesDataDaily | undefined) => {
  if (!props) return <NoData />
  return (
    <Item sx={{minWidth: "160px", textAlign: {xs: 'center', sm: 'left'}}}>
      <Typography sx={{marginBottom: 2}} variant="subtitle2" color={"text.secondary"}>{formatDateShortWeekday(props.predictions[0].t)}</Typography>
      {props.predictions.map((item, index) => (
        <Box key={index} marginBottom={"20px"}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {`${formatNumber(item.v, 1)} ${TideType[item.type as keyof typeof TideType]}`}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {formatDateHour(item.t)}
          </Typography>
        </Box>
      ))}
    </Item>
  )
}