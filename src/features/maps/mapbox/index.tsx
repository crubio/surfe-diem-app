import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_API_KEY } from 'config';
import { useEffect, useRef, useState } from 'react';
import './mapbox.css'
import { Item, LinkRouter } from 'components';
import { Stack } from '@mui/material';
import { GeoJSON, GeoJSONProperties } from 'features/maps/types'
mapboxgl.accessToken = MAPBOX_API_KEY;

interface MapProps {
  geoJson: GeoJSON;
  lat?: number;
  lng?: number;
  zoom?: number;
}

export const MapBox = (props: MapProps) => {
  const [lng, setLng] = useState(props.lat || -122.4376);
  const [lat, setLat] = useState(props.lng || 37.7577);
  const [zoom, setZoom] = useState(props.zoom || 5);
  const [selectedItem, setSelectedItem] = useState<GeoJSONProperties | null>(null); // [id, name, description]
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

    map.current.on('move', () => {
      setLng(parseFloat(map.current!.getCenter().lng.toFixed(4)));
      setLat(parseFloat(map.current!.getCenter().lat.toFixed(4)));
      setZoom(parseFloat(map.current!.getZoom().toFixed(4)));
    });

    // Create marker points
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
        new mapboxgl.Marker()
        .setLngLat([marker.geometry.coordinates[1], marker.geometry.coordinates[0]])
        .setPopup(popup)
        .addTo(map.current)
        .getElement().addEventListener('click', () => setSelectedItem(marker.properties));
      }
    });
    
  }, [mapContainer, lat, lng, props.geoJson.features, zoom]);

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
