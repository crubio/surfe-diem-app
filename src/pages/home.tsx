import LocationSummary from "@features/ui/locations/summary";
import { Container, Grid, Stack } from "@mui/material";
import Paper from '@mui/material/Paper';
import styled from '@mui/material/styles/styled';
import { useQuery } from "@tanstack/react-query";
import { getLocations } from "@features/ui/locations/api/locations";
import { isEmpty } from "lodash";
import { Location } from "@features/ui/locations/types";

const Item = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1),
  elevation: 1
}));


const Home = () => {

  const {data} = useQuery(['locations'], async () => getLocations())
  
  const locationsData = data || []

  function renderLocations(data: Location[], n: number = 3) {
    if (isEmpty(data)) {
      return (
        <p>loading...</p>
      )
    }
    return (
      <Stack direction="row" spacing={2}>
        {data.slice(0, n).map((location: Location) => {
          return (
            <div className="summary-card" key={location.id}>
              <LocationSummary locationSummary={location} />
            </div>
          )
        })}
      </Stack>
    )
  }


  return (
    <>
    {/* TODO: refactor into some demo type component. used for basic layout testing for now. */}
    <Container maxWidth="xl" sx={{ height: '100vh', marginTop: '20px' }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <p>Latest buoy conditions</p>
          <Item sx={{ bgcolor: '#cfe8fc'}}>
            {data && !isEmpty(data)? (
              <Container>
                {renderLocations(locationsData)}
              </Container>
            ) : (
              <p>loading...</p>
            )}
          </Item>
        </Grid>
      </Grid>
    </Container>
    </>
  );
}

export default Home;