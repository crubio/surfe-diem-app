import { useQuery } from "@tanstack/react-query";
import { getLocationBuoyNearby } from "./api/locations";
import { Item, LinkRouter } from "components";
import { Stack, Typography } from "@mui/material";
import { BuoyNearestType } from "./types";
import { goToBuoyPage } from "utils/routing";
import NoDataFound from "components/common/not-found";

type Props = {
    latitude: number;
    longitude: number;
    numToRender?: number;
}

const BuoyDisplay = ({ children, ...props }: BuoyNearestType & { children?: React.ReactNode }) => {
    return (
        <Item sx={{maxWidth: "fit-content", padding: "10px"}}>
            <Typography variant="body1" component="div">
                <LinkRouter to={goToBuoyPage(props.location_id)} style={{textDecoration:"none"}}>{props.name}</LinkRouter>
            </Typography>
            <Typography variant="body2" color="text.secondary">
                <Typography variant="subtitle2">Current observation</Typography>
                {props.latest_observation ? (
                    <>
                    <Typography variant="h5" color="text.secondary">
                        <span>{props.latest_observation[1].swell_height}, {props.latest_observation[1].period}, {props.latest_observation[1].direction}</span>
                    </Typography>
                    </>
                ): <NoDataFound />}
            </Typography>
        </Item>
    )
}

export const NearbyBuoys = (props: Props) => {
    const {latitude, longitude} = props;
    const {data: nearbyBuoys} = useQuery([`get-nearest-buoy-${latitude}-${longitude}`], () => getLocationBuoyNearby(latitude, longitude));

    return (
        <>
            {nearbyBuoys ? (
                <>
                    <h2>Nearby Buoys</h2>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{marginBottom:"20px"}}>
                        {nearbyBuoys.slice(0, props.numToRender || 3).map((buoy) => {
                            return (
                                <BuoyDisplay {...buoy} key={buoy.location_id} />
                            )}
                        )}
                    </Stack>
                </>
            ): null}
        </>
    );
}