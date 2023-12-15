import LocationSummary from "@features/locations/summary";
import {Box, Container, Grid, Stack, Typography} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { getLocations, getSurfSpots } from "@features/locations/api/locations";
import { isEmpty } from "lodash";
import { BuoyLocation, Spot } from "@features/locations/types";
import { Item } from "components";
import BasicSelect from "components/common/basic-select";
import { useNavigate } from "react-router-dom";
import { FEATURED_SPOTS } from "utils/constants";
import SpotSummary from "@features/locations/spot-summary";


const Home = () => {
  const navigate = useNavigate();
  const {data: buoys} = useQuery(['locations'], async () => getLocations())
  const {data: spots} = useQuery(['spots'], async () => getSurfSpots())
  const buoysData = buoys || []
  const spotsData = spots || []
  const featuredSpots = spots?.flatMap((spot: Spot) => {
    return FEATURED_SPOTS.includes(spot.name) ? spot : []
  }) || []

  function renderBuoyLocations(data: BuoyLocation[], n = 3) {
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

  function renderSpots(data: Spot[], n = 3) {
    return (
      <>
        {data.slice(0, n).map((spot: Spot) => {
          return (
            <SpotSummary key={spot.id} {...spot} />   
          )
        })}
      </>
    )
  }

  function goToBuoyPage(location_id: string) {
    navigate(`/location/${location_id}`)
    return
  }

  function goToSpotPage(spot_id: string) {
    navigate(`/spot/${spot_id}`)
    return
  }

  return (
    <>
      <Container maxWidth="xl" sx={{ marginTop: '20px', padding: "20px" }}>
      <h1>Latest buoy and spot conditions</h1>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={12} md={5} lg={5}>
          <Box>
            {buoysData && buoysData.length > 0 && (
              <BasicSelect label={"select a buoy"} items={buoysData} selectValueKey={"location_id"} doOnSelect={goToBuoyPage} />
            )}
          </Box>
        </Grid>
        <Grid item xs={12} sm={12} md={5} lg={5}>
          <Box>
            {spotsData && spotsData.length > 0 && (
              <BasicSelect label={"select a surf spot"} items={spotsData} selectValueKey={"id"} doOnSelect={goToSpotPage} />
            )}
          </Box>
        </Grid>
      </Grid>
      {/* <Typography variant="h5" sx={{marginBottom: "10px"}}>buoys</Typography> */}
        <Box sx={{ marginTop: "20px", marginBottom: "20px" }}>
          <Item sx={{ bgcolor: 'primary.light', marginTop: "20px"}}>
            <Stack direction={{ xs: 'column', sm: 'column', md: 'row' }} spacing={2}>
              {buoys && !isEmpty(buoys)? (
                  renderBuoyLocations(buoysData, 4)
              ) : (
                <p>No data available</p>
              )}
            </Stack>
          </Item>
        </Box>
        <Box sx={{ marginTop: "20px", marginBottom: "20px" }}>
          <Typography variant="h5" sx={{marginBottom: "10px"}}>featured spots</Typography>
          <Item sx={{ bgcolor: 'primary.light', marginTop: "20px"}}>
            <Stack direction={{ xs: 'column', sm: 'column', md: 'row' }} spacing={2}>
              {spots && !isEmpty(spots)? (
                renderSpots(featuredSpots, 5)
              ): (
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