/**
 * Location summary component
 * displays properties of a bouy or station
 */

import isEmpty from 'lodash/isEmpty'
import { BuoyLocation, BuoyLocationLatestObservation } from './types';
import { Box, Card, CardActions, CardContent, Divider, Typography } from '@mui/material';
import { LocationOn } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { getLatestObservation } from './api/locations';
import { formatDate, formatLatLong } from 'utils/common';
import { LinkRouter, Loading } from 'components';

export default function LocationSummary(props: {locationSummary: BuoyLocation}) {
  const {location_id} = props.locationSummary
  const {data, isLoading} = useQuery([location_id], () => getLatestObservation(location_id))
  
  function renderLatestObservation(latestObservation: BuoyLocationLatestObservation) {
    return (
      <>
      <Typography sx={{marginBottom: 2}} variant="subtitle2" color={"text.secondary"}>
          {latestObservation.published && formatDate(latestObservation.published)}
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
    <>
      { isLoading ? (
        <Loading />
      ) : (
        <Card data-testid="location-summary-card">
          <CardContent>
            <h2>{props.locationSummary.name}</h2>
            <Typography sx={{ mb: 1 }} color="text.secondary">
              <LocationOn /> {props.locationSummary.location && formatLatLong(props.locationSummary.location).join(', ')}
            </Typography>
            <Typography sx={{ mb: 1 }} color="text.secondary">
              {props.locationSummary.description}
            </Typography>
            <Box sx={{ mb: 1 }}>
              <Divider variant="middle" />
            </Box>
            <Box className="current-conditions">
              <Typography>
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
            <LinkRouter color="secondary.main" to={`/location/${props.locationSummary.location_id}`}>View Details</LinkRouter>
          </CardActions>
        </Card>
      )}
      
    </>
  );
}