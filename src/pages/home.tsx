import LocationSummary from "@features/locations/summary";
import {Box, Container, Stack, Typography} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { getLocations } from "@features/locations/api/locations";
import { isEmpty } from "lodash";
import { BuoyLocation } from "@features/locations/types";
import { Item } from "components";


const Home = () => {

  const {data} = useQuery(['locations'], async () => getLocations())
  
  const locationsData = data || []

  function renderLocations(data: BuoyLocation[], n = 3) {
    if (isEmpty(data)) {
      return (
        <p>loading...</p>
      )
    }
    return (
      <>
        {data.slice(0, n).map((location: BuoyLocation) => {
          return (
            <LocationSummary key={location.location_id} locationSummary={location} />
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
          <Stack direction={{ xs: 'column', sm: 'column', md: 'row' }} spacing={2}>
            {data && !isEmpty(data)? (
                renderLocations(locationsData, 4)
            ) : (
              <p>No data available</p>
            )}
          </Stack>
        </Item>
      </Box>
    </Container>
    </>
  );
}

export default Home;