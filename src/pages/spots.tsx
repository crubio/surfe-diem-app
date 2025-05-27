import { getSurfSpots } from "@features/locations/api/locations";
import { Spot } from "@features/locations/types";
import { Box, Container, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Item, LinkRouter } from "components";
import { sortBy } from "lodash";
import surfImage from "assets/sharks1.jpg";
import NoDataFound from "components/common/not-found";

const SurfSpotsPage = () => {

    const {data} = useQuery(['surf_spots'], async () => getSurfSpots());

    sortBy(data, ['subregion_name' ]);

    function sortBySubregion(data: Spot[]) {
        const sortedData: { [key: string]: Spot[] } = {}
        data.forEach(spot => {
            if (!sortedData[spot.subregion_name]) {
                sortedData[spot.subregion_name] = [];
            }
            sortedData[spot.subregion_name].push(spot);
        });
        return sortedData;
    }

    const sortedSpots = sortBySubregion(data || []);

    return (
        <Container sx={{marginBottom: "20px"}}>
            <Item sx={{ bgcolor: 'primary.dark', marginTop: "20px"}}>
                <Box sx={{backgroundColor: "#1ed6e6", backgroundImage: `url(${surfImage})`, backgroundRepeat: "no-repeat", backgroundSize: "cover", height: "290px", backgroundPosition: "center"}} >
                    <Typography variant="h3" component="div" sx={{ paddingTop: "20px", color: "white", textAlign: "center", textShadow: "#1ed6e6 1px 0 2px;" }}>
                    surfe diem
                    </Typography>
                    <Typography variant="h5" component="div" sx={{ marginBottom: "20px", color: "white", textAlign: "center" }}>
                    get the latest surf forecasts near you
                    </Typography>
                </Box>
            </Item>
            <Box sx={{ marginTop: "20px", padding: "10px", borderRadius: "8px" }}>
                <Typography variant="h5" sx={{marginBottom: "10px"}}>Surf spots by region</Typography>
                {sortedSpots && Object.keys(sortedSpots).length > 0 ? (
                    Object.keys(sortedSpots).map((subregion) => (
                        <Box key={subregion} sx={{ marginBottom: "20px", width: "100%" }}>
                            <Typography variant="h5" component="div" sx={{ marginBottom: "10px" }}>{subregion}</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                {sortedSpots[subregion].map((spot) => (
                                    <Item key={spot.id} sx={{ width: '300px', padding: '10px' }}>
                                        <LinkRouter to={`/spot/${spot.id}`}>
                                            <Typography variant="h6">{spot.name}</Typography>
                                        </LinkRouter>
                                    </Item>
                                ))}
                            </Box>
                        </Box>
                    ))
                ) : <NoDataFound />}
            </Box>
        </Container>
    )
}

export default SurfSpotsPage;