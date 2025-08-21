import { NoData } from "@features/cards/no_data";
import { Card, CardContent, Typography } from "@mui/material";
import { Loading } from "components/layout/loading";

type ValueCardSmallProps = {
  title: string;
  value: string | number;
  isLoading: boolean;
}

const ValueCardSmall = (props: ValueCardSmallProps) => {
  return (
    <>
      <Card sx={{ height: '100%', textAlign: 'center' }}>
        <CardContent sx={{ py: 2 }}>
          {props.isLoading ? (
            <Loading />
          ) : props.value ? (
            <>
              <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold', fontSize: '2.25rem' }}>
                {props.value}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {props.title}
              </Typography>
            </>
          ) : (
            <NoData />
          )}
        </CardContent>
      </Card>
    </>
  )
}

export default ValueCardSmall;