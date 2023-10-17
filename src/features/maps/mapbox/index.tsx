import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_API_KEY } from 'config';
import { useEffect, useRef } from 'react';
mapboxgl.accessToken = MAPBOX_API_KEY;

const defaultMapContainerStyle = {
  width: '50%',
  minHeight: '200px',
  maxHeight: '400px'
}

interface MapProps {
  lat: number;
  lng: number;
  zoom?: number;
}

export const MapBox = (props: MapProps) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const zoom = props.zoom || 8;

  useEffect(() => {
    if (map.current) return; // initialize map only once
    if (!mapContainer.current) return; // check if container is available
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [props.lng, props.lat],
      zoom: zoom,
    });

    new mapboxgl.Marker().setLngLat([props.lng, props.lat]).addTo(map.current);
  }, [mapContainer]);
  

  return <div ref={mapContainer} style={defaultMapContainerStyle} />;
};
