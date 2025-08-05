import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_API_KEY } from 'config';
import { useEffect, useRef, useState } from 'react';
import { Collapse, IconButton, Box, Typography } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { BuoyNearestType } from '@features/locations/types';
import './mapbox.css'
mapboxgl.accessToken = MAPBOX_API_KEY;

interface MapProps {
  lat: number;
  lng: number;
  zoom?: number;
  nearbyBuoys?: BuoyNearestType[];
}

const MapBoxSingle = (props: MapProps) => {
  const {lat, lng, zoom, nearbyBuoys} = props
  const [isExpanded, setIsExpanded] = useState(true);
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const popup = useRef<mapboxgl.Popup | null>(null);
  const buoyMarkers = useRef<mapboxgl.Marker[]>([]);

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
      // Create spot marker element with consistent styling
      const spotEl = document.createElement('div');
      spotEl.className = 'marker marker-spot_location';
      spotEl.style.width = '50px';
      spotEl.style.height = '50px';
      spotEl.style.borderRadius = '50%';
      spotEl.style.backgroundColor = '#1ed6e6'; // Blue color for spots (matching main map)
      spotEl.style.border = '3px solid white';
      spotEl.style.cursor = 'pointer';
      spotEl.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      
      marker = new mapboxgl.Marker(spotEl)
      .setLngLat([lng, lat])
      .addTo(map.current);
    }

    // Add buoy markers when data is available
    const addBuoyMarkers = () => {
      if (!map.current || !nearbyBuoys) return;
      
      // Clear existing markers
      buoyMarkers.current.forEach(marker => marker.remove());
      buoyMarkers.current = [];
      
      nearbyBuoys.forEach((buoy: BuoyNearestType) => {
        // Create buoy marker element
        const buoyEl = document.createElement('div');
        buoyEl.className = 'marker marker-buoy_location';
        buoyEl.style.width = '50px';
        buoyEl.style.height = '50px';
        buoyEl.style.borderRadius = '50%';
        buoyEl.style.backgroundColor = '#f06292'; // Pink color for buoys (matching main map)
        buoyEl.style.border = '3px solid white';
        buoyEl.style.cursor = 'pointer';
        buoyEl.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
        
        // Create popup content
        const popupContent = document.createElement('div');
        popupContent.innerHTML = `
          <div style="padding: 8px; min-width: 200px;">
            <h4 style="margin: 0 0 8px 0; font-size: 14px;">${buoy.name}</h4>
            ${buoy.latest_observation ? `
              <div style="font-size: 12px; color: #666;">
                <div><strong>Current:</strong> ${buoy.latest_observation[1].swell_height}ft, ${buoy.latest_observation[1].period}s, ${buoy.latest_observation[1].direction}</div>
              </div>
            ` : '<div style="font-size: 12px; color: #666;">No current data</div>'}
            <div style="margin-top: 8px;">
              <a href="/location/${buoy.location_id}" style="color: #1976d2; text-decoration: none; font-size: 12px;">View Details →</a>
            </div>
          </div>
        `;
        
        // Create popup
        const buoyPopup = new mapboxgl.Popup({
          closeButton: true,
          closeOnClick: false,
          maxWidth: '300px',
          className: 'mapboxgl-popup-content'
        }).setDOMContent(popupContent);
        
        // Create marker
        const buoyMarker = new mapboxgl.Marker(buoyEl)
          .setLngLat([parseFloat(buoy.longitude), parseFloat(buoy.latitude)])
          .setPopup(buoyPopup)
          .addTo(map.current!);
        
        // Store marker reference for cleanup
        buoyMarkers.current.push(buoyMarker);
        
        // Add click handler to close other popups
        buoyMarker.getElement().addEventListener('click', () => {
          // Close all other popups
          buoyMarkers.current.forEach(marker => {
            if (marker !== buoyMarker) {
              marker.getPopup().remove();
            }
          });
        });
      });
    };

    // Add buoy markers when map is loaded and buoy data is available
    if (map.current && nearbyBuoys) {
      addBuoyMarkers();
    }

    // Cleanup function
    return () => {
      if (marker) {
        marker.remove();
      }
      // Clean up buoy markers
      buoyMarkers.current.forEach(marker => marker.remove());
      buoyMarkers.current = [];
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [lat, lng, zoom, nearbyBuoys])

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