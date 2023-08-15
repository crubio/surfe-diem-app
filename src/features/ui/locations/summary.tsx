/**
 * Location summary component
 * displays properties of a bouy or station
 */

import isEmpty from 'lodash/isEmpty'
import { LocationSummaryProps, LatestObservation } from './types';
import { Card, CardActions, CardContent, Divider, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export default function LocationSummary(props: LocationSummaryProps, latestObservation?: LatestObservation) {

  function renderLatestObservation(latestObservation: LatestObservation) {
    return (
      <>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          {latestObservation.air_temp}
        </Typography>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          {latestObservation.water_temp}
        </Typography>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          {latestObservation.significant_wave_height}
        </Typography>
      </>
    ) 
  }

  return (
    <Card sx={{ minWidth: 275 }}>
      <CardContent>
        <Typography variant="h5" component="div">
          {props.name}
        </Typography>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          {props.url}
        </Typography>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          {props.location}
        </Typography>
        <Divider variant="middle" />
        <Typography variant="h5">
          Current Conditions
        </Typography>
        { !isEmpty(latestObservation) ? (
          <>
            {renderLatestObservation(latestObservation)}
          </>
        ) : (
          <>
            {"Data not available"}
          </>
        )}
      </CardContent>
      <CardActions>
        <Link to={`/location/${props.location_id}`}>View Details</Link>
      </CardActions>
    </Card>
  );
}