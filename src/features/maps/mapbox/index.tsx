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

    // Wait for map to load before adding layers
    map.current.on('load', () => {
      if (map.current) {
        // Add GeoJSON source with clustering
        map.current.addSource('locations', {
          type: 'geojson',
          data: props.geoJson as any, // Type assertion for now
          cluster: true,
          clusterMaxZoom: 14, // Max zoom to cluster points
          clusterRadius: 50, // Radius of each cluster when clustering points
        });

        console.log('Added GeoJSON source with clustering for:', props.geoJson.features.length, 'features');

        // Add cluster layer
        map.current.addLayer({
          id: 'clusters',
          type: 'circle',
          source: 'locations',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': '#1ed6e6', // theme primary color
            'circle-radius': [
              'step',
              ['get', 'point_count'],
              20, 100,
              30, 750,
              40
            ]
          }
        });

        // Add cluster count layer
        map.current.addLayer({
          id: 'cluster-count',
          type: 'symbol',
          source: 'locations',
          filter: ['has', 'point_count'],
          layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
          },
          paint: {
            'text-color': '#ffffff'
          }
        });

        // Add unclustered point layer
        map.current.addLayer({
          id: 'unclustered-point',
          type: 'circle',
          source: 'locations',
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-color': [
              'case',
              ['==', ['get', 'type'], 'spot_location'], '#1ed6e6', // theme primary (blue)
              ['==', ['get', 'type'], 'buoy_location'], '#f06292', // theme secondary (pink)
              '#9e9e9e' // default gray
            ],
            'circle-radius': 8,
            'circle-stroke-width': 2,
                      'circle-stroke-color': '#ffffff'
        }
      });

      // Add click handlers for clusters
      map.current.on('click', 'clusters', (e) => {
        const features = map.current!.queryRenderedFeatures(e.point, {
          layers: ['clusters']
        });
        const clusterId = features[0].properties!.cluster_id;
        (map.current!.getSource('locations') as any).getClusterExpansionZoom(
          clusterId,
          (err: any, zoom: any) => {
            if (err) return;
            map.current!.easeTo({
              center: (features[0].geometry as any).coordinates,
              zoom: zoom
            });
          }
        );
      });

      // Add click handlers for individual points
      map.current.on('click', 'unclustered-point', (e) => {
        const features = map.current!.queryRenderedFeatures(e.point, {
          layers: ['unclustered-point']
        });
        if (features.length > 0) {
          const properties = features[0].properties;
          console.log('Clicked point:', properties);
          setSelectedItem(properties as any);
        }
      });

      // Change cursor on hover
      map.current.on('mouseenter', 'clusters', () => {
        map.current!.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', 'clusters', () => {
        map.current!.getCanvas().style.cursor = '';
      });
      map.current.on('mouseenter', 'unclustered-point', () => {
        map.current!.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', 'unclustered-point', () => {
        map.current!.getCanvas().style.cursor = '';
      });
    }
  });
    
    // Cleanup function
    return () => {
      if (map.current) {
        // Remove event listeners
        map.current.off('move', moveHandler);
        
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
