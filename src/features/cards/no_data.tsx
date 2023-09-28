import { WarningAmberOutlined } from "@mui/icons-material"
import { Stack, Typography } from "@mui/material"

export const NoData = () => {
  return(
    <Stack direction="row" spacing={2}>
      <WarningAmberOutlined color="warning"/>
      <Typography sx={{marginBottom: 2}} variant="subtitle2" color={"text.secondary"}>
        No data available
      </Typography>
    </Stack>
  )
}