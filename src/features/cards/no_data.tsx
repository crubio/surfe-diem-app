import { WarningAmberOutlined } from "@mui/icons-material"
import { Stack, Typography } from "@mui/material"

type NoDataProps = {
  message?: string;
}

export const NoData = (props: NoDataProps) => {
  return(
    <Stack direction="row" spacing={2}>
      <WarningAmberOutlined color="warning"/>
      <Typography sx={{marginBottom: 2}} variant="subtitle2" color={"text.secondary"}>
        {props.message || "No data available"}
      </Typography>
    </Stack>
  )
}