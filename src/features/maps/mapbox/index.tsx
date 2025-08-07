import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_API_KEY } from 'config';
import { useEffect, useRef, useState, useMemo } from 'react';
import './mapbox.css'
import { Item, LinkRouter } from 'components';
import { Stack, Typography, Box, ToggleButtonGroup, ToggleButton, Tooltip } from '@mui/material';
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
  
  const [selectedItem, setSelectedItem] = useState<GeoJSONProperties | null>(null);
  const [hoveredItem, setHoveredItem] = useState<GeoJSONProperties | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'spots' | 'buoys'>('all');
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const popup = useRef<mapboxgl.Popup | null>(null);

  // Filter GeoJSON based on current filter type
  const filteredGeoJson = useMemo(() => {
    if (filterType === 'all') return props.geoJson;
    
    return {
      ...props.geoJson,
      features: props.geoJson.features.filter(feature => {
        if (filterType === 'spots') return feature.properties.type === 'spot_location';
        if (filterType === 'buoys') return feature.properties.type === 'buoy_location';
        return true;
      })
    };
  }, [props.geoJson, filterType]);

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
      attributionControl: true,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

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
          data: filteredGeoJson as any,
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50,
          maxzoom: 16,
        });

        // Add cluster layer with dynamic styling based on filter
        map.current.addLayer({
          id: 'clusters',
          type: 'circle',
          source: 'locations',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': [
              'step',
              ['get', 'point_count'],
              filterType === 'spots' ? '#1ed6e6' : filterType === 'buoys' ? '#f06292' : '#1ed6e6', // small clusters
              10,
              filterType === 'spots' ? '#1976d2' : filterType === 'buoys' ? '#c2185b' : '#ff9800', // medium clusters
              50,
              filterType === 'spots' ? '#0d47a1' : filterType === 'buoys' ? '#880e4f' : '#9c27b0'  // large clusters
            ],
            'circle-radius': [
              'step',
              ['get', 'point_count'],
              15,  // base size
              5,   // threshold
              20,  // size after threshold
              10,  // threshold
              25,  // size after threshold
              50,  // threshold
              30   // max size
            ],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff'
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

        // Add unclustered point layer with improved styling
        map.current.addLayer({
          id: 'unclustered-point',
          type: 'circle',
          source: 'locations',
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-color': [
              'case',
              ['==', ['get', 'type'], 'spot_location'], '#1ed6e6', // primary blue for spots
              ['==', ['get', 'type'], 'buoy_location'], '#f06292', // secondary pink for buoys
              '#9e9e9e' // default gray
            ],
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              8, 6,   // zoom level 8, radius 6
              12, 10, // zoom level 12, radius 10
              16, 14  // zoom level 16, radius 14
            ],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
            'circle-opacity': 0.8
          }
        });

        // Add hover effect layer
        map.current.addLayer({
          id: 'unclustered-point-hover',
          type: 'circle',
          source: 'locations',
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-color': [
              'case',
              ['==', ['get', 'type'], 'spot_location'], '#1ed6e6',
              ['==', ['get', 'type'], 'buoy_location'], '#f06292',
              '#9e9e9e'
            ],
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              8, 8,   // slightly larger on hover
              12, 12,
              16, 16
            ],
            'circle-stroke-width': 3,
            'circle-stroke-color': '#ffffff',
            'circle-opacity': 1
          }
        }, 'unclustered-point');

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
            setSelectedItem(properties as any);
            
            // Create popup
            const coordinates = (features[0].geometry as any).coordinates.slice();
            const description = properties?.description || properties?.subregion_name || '';
            
            // Ensure popup doesn't go outside the viewport
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
              coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            if (popup.current) {
              popup.current.remove();
            }

            popup.current = new mapboxgl.Popup({
              closeButton: true,
              closeOnClick: false,
              maxWidth: '300px'
            })
              .setLngLat(coordinates)
              .setHTML(`
                <div style="padding: 8px; min-width: 200px;">
                  <h3 style="margin: 0 0 8px 0; color: #333; font-size: 16px;">${properties?.name}</h3>
                  <p style="margin: 0; color: #666; font-size: 14px;">${description}</p>
                  <div style="margin-top: 8px;">
                    <span style="
                      display: inline-block;
                      padding: 2px 8px;
                      border-radius: 12px;
                      font-size: 12px;
                      font-weight: 500;
                      color: white;
                      background-color: ${properties?.type === 'spot_location' ? '#1ed6e6' : '#f06292'};
                    ">
                      ${properties?.type === 'spot_location' ? 'Surf Spot' : 'Buoy'}
                    </span>
                  </div>
                </div>
              `)
              .addTo(map.current!);
          }
        });

        // Add hover handlers for individual points
        map.current.on('mouseenter', 'unclustered-point', (e) => {
          map.current!.getCanvas().style.cursor = 'pointer';
          
          const features = map.current!.queryRenderedFeatures(e.point, {
            layers: ['unclustered-point']
          });
          if (features.length > 0) {
            setHoveredItem(features[0].properties as any);
          }
        });

        map.current.on('mouseleave', 'unclustered-point', () => {
          map.current!.getCanvas().style.cursor = '';
          setHoveredItem(null);
        });

        // Change cursor on hover for clusters
        map.current.on('mouseenter', 'clusters', () => {
          map.current!.getCanvas().style.cursor = 'pointer';
        });
        map.current.on('mouseleave', 'clusters', () => {
          map.current!.getCanvas().style.cursor = '';
        });

        // Close popup when clicking elsewhere
        map.current.on('click', () => {
          if (popup.current) {
            popup.current.remove();
            popup.current = null;
          }
        });
      }
    });
    
    // Cleanup function
    return () => {
      if (popup.current) {
        popup.current.remove();
      }
      if (map.current) {
        map.current.off('move', moveHandler);
        map.current.remove();
        map.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapContainer, props.geoJson.features, filterType]);

  // Update map source when filter changes
  useEffect(() => {
    if (map.current && map.current.getSource('locations')) {
      (map.current.getSource('locations') as any).setData(filteredGeoJson);
    }
  }, [filteredGeoJson]);

  const handleFilterChange = (
    event: React.MouseEvent<HTMLElement>,
    newFilter: 'all' | 'spots' | 'buoys' | null,
  ) => {
    if (newFilter !== null) {
      setFilterType(newFilter);
    }
  };

  return (
    <>
      {/* Map container with legend */}
      <Box sx={{ position: 'relative' }}>
        <div ref={mapContainer} className="map-container" />
        
        {/* Filter toggles */}
        <Box
          sx={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            zIndex: 1000,
            display: { xs: 'none', sm: 'block' }
          }}
        >
          <ToggleButtonGroup
            value={filterType}
            exclusive
            onChange={handleFilterChange}
            aria-label="map filters"
            size="small"
            sx={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              borderRadius: '20px',
              '& .MuiToggleButton-root': {
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 500,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  }
                },
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }
            }}
          >
            <Tooltip title="Show all locations">
              <ToggleButton value="all" aria-label="show all">
                All
              </ToggleButton>
            </Tooltip>
            <Tooltip title="Show only surf spots">
              <ToggleButton value="spots" aria-label="show spots">
                Spots
              </ToggleButton>
            </Tooltip>
            <Tooltip title="Show only buoys">
              <ToggleButton value="buoys" aria-label="show buoys">
                Buoys
              </ToggleButton>
            </Tooltip>
          </ToggleButtonGroup>
        </Box>
        
        {/* Hover tooltip */}
        {hoveredItem && (
          <Box
            sx={{
              position: 'absolute',
              top: '60px',
              left: '10px',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '4px',
              fontSize: '14px',
              zIndex: 1000,
              pointerEvents: 'none'
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {hoveredItem.name}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {hoveredItem.type === 'spot_location' ? 'Surf Spot' : 'Buoy'}
            </Typography>
          </Box>
        )}

        {/* Map Legend - hidden on mobile, visible on desktop */}
        <Box
          sx={{
            position: 'absolute',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '20px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            zIndex: 1000,
            display: { xs: 'none', sm: 'flex' },
            alignItems: 'center',
            gap: 2
          }}
        >
          {/* Show relevant legend items based on filter */}
          {filterType === 'all' && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: '#1ed6e6',
                    border: '2px solid white'
                  }}
                />
                <Typography variant="caption" sx={{ color: 'white', fontSize: '12px' }}>
                  Surf Spots
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: '#f06292',
                    border: '2px solid white'
                  }}
                />
                <Typography variant="caption" sx={{ color: 'white', fontSize: '12px' }}>
                  Buoys
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    backgroundColor: '#ff9800',
                    border: '2px solid white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '8px',
                    fontWeight: 'bold',
                    color: 'white'
                  }}
                >
                  5
                </Box>
                <Typography variant="caption" sx={{ color: 'white', fontSize: '12px' }}>
                  Clusters
                </Typography>
              </Box>
            </>
          )}
          
          {filterType === 'spots' && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: '#1ed6e6',
                    border: '2px solid white'
                  }}
                />
                <Typography variant="caption" sx={{ color: 'white', fontSize: '12px' }}>
                  Surf Spots
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    backgroundColor: '#1976d2',
                    border: '2px solid white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '8px',
                    fontWeight: 'bold',
                    color: 'white'
                  }}
                >
                  5
                </Box>
                <Typography variant="caption" sx={{ color: 'white', fontSize: '12px' }}>
                  Clusters
                </Typography>
              </Box>
            </>
          )}
          
          {filterType === 'buoys' && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: '#f06292',
                    border: '2px solid white'
                  }}
                />
                <Typography variant="caption" sx={{ color: 'white', fontSize: '12px' }}>
                  Buoys
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    backgroundColor: '#c2185b',
                    border: '2px solid white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '8px',
                    fontWeight: 'bold',
                    color: 'white'
                  }}
                >
                  5
                </Box>
                <Typography variant="caption" sx={{ color: 'white', fontSize: '12px' }}>
                  Clusters
                </Typography>
              </Box>
            </>
          )}
        </Box>
      </Box>

      {/* Selected item panel - separate from map container */}
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
