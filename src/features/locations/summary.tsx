/**
 * Location summary component
 * displays properties of a bouy or station
 */

import isEmpty from 'lodash/isEmpty'
import { BuoyLocation, BuoyLocationLatestObservation } from './types';
import { Box, Card, CardActions, CardContent, Divider, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { LocationOn } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { getLatestObservation } from './api/locations';

export default function LocationSummary(props: {locationSummary: BuoyLocation}) {
  const {location_id} = props.locationSummary
  const {data} = useQuery([location_id], () => getLatestObservation(location_id))
  
  function renderLatestObservation(latestObservation: BuoyLocationLatestObservation) {
    return (
      <>
      <Typography sx={{ mb: 1 }} color="text.secondary">
          {latestObservation.published}
        </Typography>
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
    <Card data-testid="location-summary-card">
      <CardContent>
        <Typography sx={{ fontSize: '1.6rem'}} variant="h2" component="div">
          {props.locationSummary.name}
        </Typography>
        <Typography sx={{ mb: 1 }} color="text.secondary">
          <LocationOn /> {props.locationSummary.location}
        </Typography>
        <Typography sx={{ mb: 1 }} color="text.secondary">
          {props.locationSummary.description}
        </Typography>
        <Box sx={{ mb: 1 }}>
          <Divider variant="middle" />
        </Box>
        <Box className="current-conditions">
          <Typography variant="h3" sx={{ fontSize: '1.2rem'}}>
            Current Conditions
          </Typography>
          {data && !isEmpty(data) ? (
            renderLatestObservation(data[0])
          ) : (
            <p>No data available</p>
          )}
        </Box>
      </CardContent>
      <CardActions>
        <RouterLink to={`/location/${props.locationSummary.location_id}`}>View Details</RouterLink>
      </CardActions>
    </Card>
  );
}