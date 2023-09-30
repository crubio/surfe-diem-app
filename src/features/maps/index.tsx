// Basic google map component wrapper
import { Box } from "@mui/material";
import { GoogleMap, useLoadScript, GoogleMapProps } from "@react-google-maps/api";
import { Loading } from "components";
import {G_MAP_API_KEY as apiKey} from "config"

interface MapProps extends GoogleMapProps {
  children: React.ReactNode;
}

const defaultMapContainerStyle = {
  width: '100%',
  minHeight: '200px',
  maxHeight: '400px'
}
  

export const Map = (props: MapProps) => {
  const { children, ...rest } = props;
  const mapStyling = rest.mapContainerStyle || defaultMapContainerStyle;
  const { isLoaded: isMapLoaded } = useLoadScript({
    googleMapsApiKey: apiKey,
  });

  if (!isMapLoaded) {
    return <Loading />;
  }

  return (
    <Box maxWidth={{sm: '100%', md: '50%'}}>
      <GoogleMap {...rest} mapContainerStyle={mapStyling}>
        {children}
      </GoogleMap>
    </Box>
  );
}