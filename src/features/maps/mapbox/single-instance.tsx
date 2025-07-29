import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_API_KEY } from 'config';
import { useEffect, useRef } from 'react';
import './mapbox.css'
mapboxgl.accessToken = MAPBOX_API_KEY;

interface MapProps {
  lat: number;
  lng: number;
  zoom?: number;
}

const MapBoxSingle = (props: MapProps) => {
  const {lat, lng, zoom} = props
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
    <>
      <div ref={mapContainer} className="map-container" >
      </div>
    </>
  )
}

export default MapBoxSingle