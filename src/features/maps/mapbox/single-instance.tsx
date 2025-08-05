import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_API_KEY } from 'config';
import { useEffect, useRef, useState } from 'react';
import { Collapse, IconButton, Box, Typography } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import './mapbox.css'
mapboxgl.accessToken = MAPBOX_API_KEY;

interface MapProps {
  lat: number;
  lng: number;
  zoom?: number;
}

const MapBoxSingle = (props: MapProps) => {
  const {lat, lng, zoom} = props
  const [isExpanded, setIsExpanded] = useState(true);
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    if (!mapContainer.current) return; // check if container is available
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [lng, lat],
      zoom: zoom,
    });

    const el = document.createElement('div');
    el.className = 'marker-single';

    let marker: mapboxgl.Marker | null = null;
    if (map.current) {
      marker = new mapboxgl.Marker()
      .setLngLat([lng, lat])
      .addTo(map.current);
    }

    // Cleanup function
    return () => {
      if (marker) {
        marker.remove();
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [lat, lng, zoom])

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6" component="h3" sx={{ flexGrow: 1 }}>
          Location Map
        </Typography>
        <IconButton 
          onClick={() => setIsExpanded(!isExpanded)}
          size="small"
          aria-label={isExpanded ? 'minimize map' : 'expand map'}
        >
          {isExpanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>
      <Collapse in={isExpanded}>
        <div ref={mapContainer} className="map-container" />
      </Collapse>
    </Box>
  )
}

export default MapBoxSingle