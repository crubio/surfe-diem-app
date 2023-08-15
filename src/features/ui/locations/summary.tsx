/**
 * Location summary component
 * displays properties of a bouy or station
 */

import isEmpty from 'lodash/isEmpty'
import { LocationSummaryProps, LatestObservation } from './types';
import { Card, CardActions, CardContent, Divider, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export default function LocationSummary(props: {locationSummary: LocationSummaryProps, latestObservation?: LatestObservation | {}}) {
  

  function renderLatestObservation(latestObservation: LatestObservation) {
    console.log(latestObservation)
    return (
      <>
        <Typography sx={{ mb: 1.5 }} color="text">
          Air temp: {latestObservation.air_temp}
        </Typography>
        <Typography sx={{ mb: 1.5 }} color="text">
          Water temp: {latestObservation.water_temp}
        </Typography>
        <Typography sx={{ mb: 1.5 }} color="text">
          Swell: {latestObservation.significant_wave_height}
        </Typography>
      </>
    ) 
  }

  return (
    <Card sx={{ minWidth: 275 }}>
      <CardContent>
        <Typography variant="h5" component="div">
          {props.locationSummary.name}
        </Typography>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          {props.locationSummary.url}
        </Typography>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          {props.locationSummary.location}
        </Typography>
        <Divider variant="middle" />
        <Typography variant="h5">
          Current Conditions
        </Typography>
        { !isEmpty(props.latestObservation) ? (
          <>
            {renderLatestObservation(props.latestObservation)}
          </>
        ) : (
          <>
            {"Data not available"}
          </>
        )}
      </CardContent>
      <CardActions>
        <Link to={`/location/${props.locationSummary.location_id}`}>View Details</Link>
      </CardActions>
    </Card>
  );
}