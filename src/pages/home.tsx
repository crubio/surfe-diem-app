import LocationSummary from "@features/locations/summary";
import {Box, Container, Grid, Typography} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { getLocations } from "@features/locations/api/locations";
import { isEmpty } from "lodash";
import { BuoyLocation } from "@features/locations/types";
import { Item } from "components";


const Home = () => {

  const {data} = useQuery(['locations'], async () => getLocations())
  
  const locationsData = data || []

  function renderLocations(data: BuoyLocation[], n: number = 3) {
    if (isEmpty(data)) {
      return (
        <p>loading...</p>
      )
    }
    return (
      <>
        {data.slice(0, n).map((location: BuoyLocation) => {
          return (
            <Grid item xs className="summary-card" key={location.id}>
              <LocationSummary locationSummary={location} />
            </Grid>
          )
        })}
      </>
    )
  }


  return (
    <>
    {/* TODO: refactor into some demo type component. used for basic layout testing for now. */}
    <Container maxWidth="xl" sx={{ marginTop: '20px', padding: "20px" }}>
      <Box sx={{ marginTop: "20px", marginBottom: "20px"}}>
        <Typography variant="h4" sx={{marginBottom: "10px"}}>Latest buoy conditions</Typography>
        <Item sx={{ bgcolor: 'primary.light', marginTop: "20px"}}>
          <Grid container spacing={1} direction="row">
            {data && !isEmpty(data)? (
                renderLocations(locationsData, 3)
            ) : (
              <p>loading...</p>
            )}
          </Grid>
        </Item>
      </Box>
    </Container>
    </>
  );
}

export default Home;