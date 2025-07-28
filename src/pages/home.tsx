import {Box, Container, Grid, Stack, Typography} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { getLocations, getSurfSpots } from "@features/locations/api/locations";
import { isEmpty } from "lodash";
import { Spot } from "@features/locations/types";
import { Item } from "components";
import BasicSelect from "components/common/basic-select";
import { useNavigate } from "react-router-dom";
import { FEATURED_SPOTS } from "utils/constants";
import SpotSummary from "@features/locations/spot-summary"
import { getGeolocation } from "utils/geolocation";
import SpotGlance from "@features/locations/spot-glance";
import surfingImage from "assets/manresa1.jpg";
import surfImage2 from "assets/pismo_landscape.jpg";
import { orderBy } from "lodash";
import FavoritesList from "components/common/favorites-list";

const Home = () => {
  const navigate = useNavigate();
  const {data: buoys} = useQuery(['locations'], async () => getLocations())
  const {data: spots} = useQuery(['spots'], async () => getSurfSpots())
  const {data: geolocation} = useQuery(['geolocation'], async () => getGeolocation())
  const buoysData = orderBy(buoys,["name"], ["asc"] ) || []
  const spotsData = orderBy(spots, ["subregion_name", "name"], ["asc"]) || []
  const featuredSpots = spots?.flatMap((spot: Spot) => {
    return FEATURED_SPOTS.includes(spot.name) ? spot : []
  }) || []

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
      <Container maxWidth="xl" sx={{ marginTop: '20px', padding: "20px", paddingTop: "4px" }}>
        <Item sx={{ bgcolor: 'primary.dark', marginTop: "20px"}}>
          <Box sx={{backgroundColor: "#1ed6e6", backgroundImage: `url(${surfImage2})`, backgroundRepeat: "no-repeat", backgroundSize: "cover", height: "290px"}} >
            <Typography variant="h3" component="div" sx={{ paddingTop: "20px", color: "white", textAlign: "center", textShadow: "#1ed6e6 1px 0 2px;" }}>
              surfe diem
            </Typography>
            <Typography variant="h5" component="div" sx={{ marginBottom: "20px", color: "white", textAlign: "center" }}>
              get the latest surf forecasts near you
            </Typography>
          </Box>
        </Item>
        <Grid container spacing={2} sx={{ marginBottom: "20px" }}>
          <Grid item xs={12} sm={12} md={5} lg={5}>
            <Item sx={{ bgcolor: 'background.default', marginTop: "20px"}}>
              <h2>Buoys</h2>
              <Box>
                {buoysData && buoysData.length > 0 && (
                  <BasicSelect label={"select a buoy"} items={buoysData} selectValueKey={"location_id"} doOnSelect={goToBuoyPage} />
                )}
              </Box>
            </Item>
          </Grid>
          <Grid item xs={12} sm={12} md={5} lg={5}>
          <Item sx={{ bgcolor: 'background.default', marginTop: "20px"}}>
              <h2>Spots</h2>
              <Box>
                {spotsData && spotsData.length > 0 && (
                  <BasicSelect label={"select a surf spot"} items={spotsData} selectValueKey={"id"} doOnSelect={goToSpotPage} />
                )}
              </Box>
            </Item>
          </Grid>
        </Grid>
        {geolocation ? (
          <Box sx={{ marginTop: "20px", marginBottom: "20px" }}>
            {/* TODO: link to page with the complete list and all other spots */}
            <Typography variant="h5" sx={{marginBottom: "10px", paddingLeft: "8px"}}>Surf spots nearby</Typography>
            <SpotGlance latitude={geolocation.latitude} longitude={geolocation.longitude} renderNumber={10} />
          </Box>
        ): null}
        <Item sx={{ bgcolor: 'background.default', marginTop: "20px"}}>
        <Box sx={{
          backgroundImage:`url(${surfingImage})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover"
        }}>
          <Box sx={{
            padding: "20px",
          }}>
            <Typography variant="h5" sx={{marginBottom: "10px"}}>Featured spots</Typography>
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
        </Box>
        </Item>
      </Container>
    </>
  );
}

export default Home;