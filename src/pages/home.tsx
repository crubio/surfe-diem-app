import LocationSummary from "@features/ui/locations/summary";
import { Container, Grid, Stack } from "@mui/material";
import Paper from '@mui/material/Paper';
import styled from '@mui/material/styles/styled';
import {LOCATION_1, LOCATION_2} from '../test/mocks/location'

const Item = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1),
  elevation: 1
}));

// TODO: refactor into some demo type component. used for basic layout testing for now.
const Home = () => {
  return (
    <>
    <Container maxWidth="xl" sx={{ height: '100vh', marginTop: '20px' }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <p>Latest Conditions Section. Put some components for individual location data here.</p>
          <Item sx={{ bgcolor: '#cfe8fc'}}>
            <Stack direction="row" spacing={2}>
              <LocationSummary {...LOCATION_1} />
              <LocationSummary {...LOCATION_2} />
              <LocationSummary {...LOCATION_1} />
            </Stack>
          </Item>
        </Grid>
        <Grid item xs={4}>
          place holders for now
          <Item>xs=4</Item>
        </Grid>
        <Grid item xs={4}>
          place holders for now
          <Item>xs=4</Item>
        </Grid>
      </Grid>
    </Container>
    </>
  );
}

export default Home;