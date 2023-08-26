import LocationSummary from "@features/ui/locations/summary";
import {Container, Grid} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { getLocations } from "@features/ui/locations/api/locations";
import { isEmpty } from "lodash";
import { Location } from "@features/ui/locations/types";
import { Item } from "components";


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
      <>
        {data.slice(0, n).map((location: Location) => {
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
    <p>Latest buoy conditions</p>
      <Item sx={{ bgcolor: '#cfe8fc'}}>
        <Grid container spacing={1} direction="row">
          {data && !isEmpty(data)? (
              renderLocations(locationsData, 3)
          ) : (
            <p>loading...</p>
          )}
        </Grid>
      </Item>
    </Container>
    </>
  );
}

export default Home;