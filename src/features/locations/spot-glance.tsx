import { Item } from "components"
import { Spot } from "./types"
import { getSurfSpotClosest } from "./api/locations";
import { useQuery } from "@tanstack/react-query";
import { Button, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";

type SpotGlanceProps = {
    latitude: number;
    longitude: number;
    renderNumber?: number;
}

const SpotGlance = (props: SpotGlanceProps) => {
    const {data: closestSpots} = useQuery(['closestSpots'], async () => getSurfSpotClosest(props.latitude, props.longitude))

    function renderSpots(spots: Spot[], numToRender = 3) {
        return (
            <>
                <Stack spacing={2} direction={{ xs: 'column', sm: 'column', md: 'row' }} sx={{ overflowX: "auto", padding: "10px", width: "fit-content" }}>
                    {spots.slice(0, numToRender).map((spot: Spot) => {
                        return (
                            <Item key={spot.id}>
                                <Button color="secondary" component={Link} to={`/spot/${spot.id}`}>
                                    <Typography variant="h5" component="div">
                                        {spot.name}
                                    </Typography>
                                </Button>
                                <Typography variant="body2" color="text.secondary" sx={{padding:"0 8px"}}>
                                    {spot.subregion_name}
                                </Typography>
                            </Item>
                        )
                    })}
                </Stack>
            </>
        )

    }

    return (
        <>
            {renderSpots(closestSpots || [], props.renderNumber)}
        </>
    )
}

export default SpotGlance