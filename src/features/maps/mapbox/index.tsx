import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_API_KEY } from 'config';
import { useEffect, useRef, useState } from 'react';
import './mapbox.css'
import { Item, LinkRouter } from 'components';
import { Stack } from '@mui/material';
import { GeoJSON, GeoJSONProperties } from 'features/maps/types'
import { DEFAULT_CENTER } from 'utils/constants';
mapboxgl.accessToken = MAPBOX_API_KEY;

interface MapProps {
  geoJson: GeoJSON;
  lat?: number;
  lng?: number;
  zoom?: number;
}

export const MapBox = (props: MapProps) => {
  const [lng, setLng] = useState(props.lng || DEFAULT_CENTER[0]);
  const [lat, setLat] = useState(props.lat || DEFAULT_CENTER[1]);
  const [zoom, setZoom] = useState(props.zoom || 5);
  

  const [selectedItem, setSelectedItem] = useState<GeoJSONProperties | null>(null); // [id, name, description]
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    if (!mapContainer.current) return; // check if container is available
    
    // Ensure we have valid coordinates
    const validLng = typeof lng === 'number' && !isNaN(lng) ? lng : DEFAULT_CENTER[0];
    const validLat = typeof lat === 'number' && !isNaN(lat) ? lat : DEFAULT_CENTER[1];
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [validLng, validLat],
      zoom: zoom,
    });

    const moveHandler = () => {
      if (map.current) {
        setLng(parseFloat(map.current.getCenter().lng.toFixed(4)));
        setLat(parseFloat(map.current.getCenter().lat.toFixed(4)));
        setZoom(parseFloat(map.current.getZoom().toFixed(4)));
      }
    };

    map.current.on('move', moveHandler);

    // Create marker points
    const markers: mapboxgl.Marker[] = [];
    props.geoJson.features.forEach((marker) => {
      const el = document.createElement('div');
      el.className = 'marker-'+marker.properties.id;

      const popup = new mapboxgl.Popup({ offset: 25 })
      .setHTML(
        `
        <h3>${marker.properties.name}</h3>
        <p>${marker.properties.description}</p>
        `
      );

      if (map.current) {
        // GeoJSON coordinates are typically [lng, lat], so we should use them directly
        const markerLng = marker.geometry.coordinates[0];
        const markerLat = marker.geometry.coordinates[1];
        
        const mapMarker = new mapboxgl.Marker()
        .setLngLat([markerLng, markerLat])
        .setPopup(popup)
        .addTo(map.current);
        
        const clickHandler = () => setSelectedItem(marker.properties);
        mapMarker.getElement().addEventListener('click', clickHandler);
        markers.push(mapMarker);
      }
    });
    
    // Cleanup function
    return () => {
      if (map.current) {
        // Remove event listeners
        map.current.off('move', moveHandler);
        
        // Remove markers and their event listeners
        markers.forEach(marker => {
          const element = marker.getElement();
          if (element) {
            element.removeEventListener('click', () => {});
          }
          marker.remove();
        });
        
        // Remove map instance
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapContainer, props.geoJson.features]); // Removed lat, lng, zoom from dependencies

  return (
    <>
      <div ref={mapContainer} className="map-container" >
      </div>
      <div>
        {selectedItem && (
          <Item sx={{marginTop: "20px"}}>
            <Stack direction="column" spacing={1}>
              <LinkRouter to={`/location/${selectedItem.id}`} >{selectedItem.name}</LinkRouter>
              <span>{selectedItem.description}</span>
            </Stack>
          </Item>
        )}
      </div>
    </>
  ) 
};
