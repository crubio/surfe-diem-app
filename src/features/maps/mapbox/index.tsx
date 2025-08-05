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
    console.log('Creating markers for features:', props.geoJson.features.length);
    props.geoJson.features.forEach((marker, index) => {
      if (index < 3) { // Debug first 3 markers
        console.log(`Marker ${index}:`, marker.properties);
      }
      const el = document.createElement('div');
      // Add type-specific class for visual differentiation
      const markerType = marker.properties.type || 'unknown';
      el.className = `marker marker-${markerType} marker-${marker.properties.id}`;

      // Create popup content based on type
      let popupContent = '';
      if (marker.properties.type === 'spot_location') {
        popupContent = `
          <h3>${marker.properties.name}</h3>
          <p><strong>Region:</strong> ${marker.properties.subregion_name}</p>
        `;
      } else if (marker.properties.type === 'buoy_location') {
        popupContent = `
          <h3>${marker.properties.name}</h3>
          <p><strong>Type:</strong> ${marker.properties.description}</p>
          <p><strong>Location:</strong> ${marker.properties.location}</p>
        `;
      } else {
        popupContent = `
          <h3>${marker.properties.name}</h3>
          <p>${marker.properties.description || 'Unknown location'}</p>
        `;
      }

      const popup = new mapboxgl.Popup({ offset: 25 })
      .setHTML(popupContent);

      if (map.current) {
        // GeoJSON coordinates are typically [lng, lat], so we should use them directly
        const markerLng = marker.geometry.coordinates[0];
        const markerLat = marker.geometry.coordinates[1];
        
        // Set color based on type using theme colors
        let markerColor = '#9e9e9e'; // default gray
        if (marker.properties.type === 'spot_location') {
          markerColor = '#1ed6e6'; // theme primary (blue)
        } else if (marker.properties.type === 'buoy_location') {
          markerColor = '#f06292'; // theme secondary (pink)
        }
        
        const mapMarker = new mapboxgl.Marker({ color: markerColor })
        .setLngLat([markerLng, markerLat])
        .setPopup(popup)
        .addTo(map.current);
        
        const clickHandler = () => {
          console.log('Clicked marker:', marker.properties); // Debug
          setSelectedItem(marker.properties);
        };
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
              <LinkRouter to={`${selectedItem.type === 'spot_location' ? '/spot/' + (selectedItem.slug || selectedItem.id) : '/location/' + selectedItem.id}`} >
                {selectedItem.name}
              </LinkRouter>
              {selectedItem.type === 'spot_location' ? (
                <span>{selectedItem.subregion_name}</span>
              ) : (
                <span>{selectedItem.description}</span>
              )}
            </Stack>
          </Item>
        )}
      </div>
    </>
  ) 
};
