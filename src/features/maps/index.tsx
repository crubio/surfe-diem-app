// Basic google map component wrapper
import { Box } from "@mui/material";
import { GoogleMap, useLoadScript, GoogleMapProps } from "@react-google-maps/api";
import { Loading } from "components";
import {G_MAP_API_KEY as apiKey} from "config"

interface MapProps extends GoogleMapProps {
  children: React.ReactNode;
}

export const Map = (props: MapProps) => {
  const { children, ...rest } = props;
  const { isLoaded: isMapLoaded } = useLoadScript({
    googleMapsApiKey: apiKey,
  });

  if (!isMapLoaded) {
    return <Loading />;
  }

  return (
    <Box>
      <GoogleMap {...rest}>
        {children}
      </GoogleMap>
    </Box>
  );
}