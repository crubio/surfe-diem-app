/**
 * Location summary component
 * displays properties of a bouy or station
 */

import isEmpty from 'lodash/isEmpty'
import { BuoyLocation, BuoyLocationLatestObservation } from './types';
import { Box, Button, Card, CardActions, CardContent, Divider, Typography } from '@mui/material';
import { LocationOn } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { getLatestObservation } from './api/locations';
import { formatLatLong } from 'utils/common';
import { Loading } from 'components';
import { Link } from 'react-router-dom';

export default function LocationSummary(props: {locationSummary: BuoyLocation}) {
  const {location_id} = props.locationSummary
  const {data, isLoading, isError} = useQuery([location_id], () => getLatestObservation(location_id))
  
  function renderLatestObservation(latestObservation: BuoyLocationLatestObservation) {
    if (!latestObservation) return (
      <p>No data available</p>
    )
    return (
      <>
        <Typography variant="h3" sx={{marginBottom: "2px"}}>
          {latestObservation.wave_height}
        </Typography>
        { latestObservation.peak_period && (
          <Typography sx={{ mb: 1.5 }} color="text">
            {latestObservation.peak_period}
          </Typography>
        )}
        {latestObservation.water_temp && (
          <Typography sx={{ mb: 1.5 }} color="text">
            {latestObservation.water_temp}
          </Typography>
        )}
      </>
    ) 
  }

  return (
    <>
      { isLoading ? (
        <Loading />
      ) : (
        <Card data-testid="location-summary-card"
          sx={{ 
            height: "100%",
            display: "flex",
            flexDirection: "column"
          }}
        >
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
              {data && !isEmpty(data) && !isError ? (
                renderLatestObservation(data[0])
              ) : (
                <p>No data available</p>
              )}
            </Box>
          </CardContent>
          <CardActions disableSpacing sx={{ mt: "auto" }}>
            <Button color="secondary" component={Link} to={`/location/${props.locationSummary.location_id}`}>
              View buoy
            </Button>
          </CardActions>
        </Card>
      )}
      
    </>
  );
}