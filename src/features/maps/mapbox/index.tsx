import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_API_KEY } from 'config';
import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import './mapbox.css';
import {
  Box, Button, InputAdornment, Paper, TextField,
  ToggleButton, ToggleButtonGroup, Typography, useTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Link as RouterLink } from 'react-router-dom';
import { GeoJSON, GeoJSONProperties } from 'features/maps/types';
import { DEFAULT_CENTER } from 'utils/constants';
import { useColorMode } from 'providers/theme-provider';
import { colorTokens } from 'config/theme';

mapboxgl.accessToken = MAPBOX_API_KEY;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STYLE_URLS = {
  light: 'mapbox://styles/mapbox/light-v11',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
  dark: 'mapbox://styles/mapbox/dark-v11',
} as const;

type MapStyle = keyof typeof STYLE_URLS;
type FilterType = 'all' | 'spots' | 'buoys';

const STYLE_STORAGE_KEY = 'mapbox-style';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SelectedFeature {
  properties: GeoJSONProperties;
  coordinates: [number, number];
}

interface MapProps {
  geoJson: GeoJSON;
  lat?: number;
  lng?: number;
  zoom?: number;
}

// ---------------------------------------------------------------------------
// Pure helpers (no hooks, safe to call from effects)
// ---------------------------------------------------------------------------

function addMapLayers(mapInstance: mapboxgl.Map, data: any, filterType: FilterType) {
  ['clusters', 'cluster-count', 'unclustered-point'].forEach(id => {
    if (mapInstance.getLayer(id)) mapInstance.removeLayer(id);
  });
  if (mapInstance.getSource('locations')) mapInstance.removeSource('locations');

  mapInstance.addSource('locations', {
    type: 'geojson',
    data,
    cluster: true,
    clusterMaxZoom: 14,
    clusterRadius: 50,
    maxzoom: 16,
  });

  const clusterSmall  = filterType === 'buoys' ? '#f06292' : '#1ed6e6';
  const clusterMed    = filterType === 'buoys' ? '#c2185b' : filterType === 'spots' ? '#1976d2' : '#ff9800';
  const clusterLarge  = filterType === 'buoys' ? '#880e4f' : filterType === 'spots' ? '#0d47a1' : '#9c27b0';

  mapInstance.addLayer({
    id: 'clusters',
    type: 'circle',
    source: 'locations',
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': ['step', ['get', 'point_count'], clusterSmall, 10, clusterMed, 50, clusterLarge],
      'circle-radius': ['step', ['get', 'point_count'], 15, 5, 20, 10, 25, 50, 30],
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff',
    },
  });

  mapInstance.addLayer({
    id: 'cluster-count',
    type: 'symbol',
    source: 'locations',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': '{point_count_abbreviated}',
      'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
      'text-size': 12,
    },
    paint: { 'text-color': '#ffffff' },
  });

  mapInstance.addLayer({
    id: 'unclustered-point',
    type: 'circle',
    source: 'locations',
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': [
        'case',
        ['==', ['get', 'type'], 'spot_location'], '#1ed6e6',
        ['==', ['get', 'type'], 'buoy_location'], '#f06292',
        '#9e9e9e',
      ],
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 8, 6, 12, 10, 16, 14],
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff',
      'circle-opacity': 0.85,
    },
  });
}

function getDetailUrl(properties: GeoJSONProperties): string {
  return properties.type === 'spot_location'
    ? `/spot/${properties.slug || properties.id}`
    : `/location/${properties.id}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const MapBox = (props: MapProps) => {
  const theme = useTheme();
  const { mode } = useColorMode();
  const tokens = colorTokens[mode];

  const [mapStyle, setMapStyle] = useState<MapStyle>(() =>
    (localStorage.getItem(STYLE_STORAGE_KEY) as MapStyle) || 'light'
  );
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedFeature, setSelectedFeature] = useState<SelectedFeature | null>(null);
  const [railQuery, setRailQuery] = useState('');

  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const isMounted = useRef(false);

  // Refs so effect callbacks always read latest values without re-registering
  const filteredGeoJsonRef = useRef(props.geoJson);
  const filterTypeRef = useRef<FilterType>(filterType);

  // ---------------------------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------------------------

  const filteredGeoJson = useMemo(() => {
    if (filterType === 'all') return props.geoJson;
    return {
      ...props.geoJson,
      features: props.geoJson.features.filter(f =>
        filterType === 'spots'
          ? f.properties.type === 'spot_location'
          : f.properties.type === 'buoy_location'
      ),
    };
  }, [props.geoJson, filterType]);

  useEffect(() => {
    filteredGeoJsonRef.current = filteredGeoJson;
    filterTypeRef.current = filterType;
  }, [filteredGeoJson, filterType]);

  const railItems = useMemo(() => {
    const features = filteredGeoJson.features;
    if (railQuery.length < 2) return features;
    const q = railQuery.toLowerCase();
    return features.filter(f =>
      f.properties.name.toLowerCase().includes(q) ||
      (f.properties.subregion_name || '').toLowerCase().includes(q)
    );
  }, [filteredGeoJson, railQuery]);

  const legendItems = useMemo(() => {
    const spot = { label: 'Surf Spots', color: '#1ed6e6' };
    const buoy = { label: 'Buoys', color: '#f06292' };
    if (filterType === 'spots') return [spot];
    if (filterType === 'buoys') return [buoy];
    return [spot, buoy];
  }, [filterType]);

  // ---------------------------------------------------------------------------
  // Map initialisation (runs once)
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    const validLng = typeof props.lng === 'number' && !isNaN(props.lng) ? props.lng : DEFAULT_CENTER[0];
    const validLat = typeof props.lat === 'number' && !isNaN(props.lat) ? props.lat : DEFAULT_CENTER[1];

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: STYLE_URLS[mapStyle],
      center: [validLng, validLat],
      zoom: props.zoom || 5,
      attributionControl: true,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      if (!map.current) return;
      addMapLayers(map.current, filteredGeoJsonRef.current, filterTypeRef.current);

      // Cluster click — zoom in
      map.current.on('click', 'clusters', (e) => {
        const features = map.current!.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        const clusterId = features[0].properties!.cluster_id;
        (map.current!.getSource('locations') as any).getClusterExpansionZoom(
          clusterId,
          (err: any, zoom: any) => {
            if (err) return;
            map.current!.easeTo({ center: (features[0].geometry as any).coordinates, zoom });
          }
        );
      });

      // Point click — select + ease to
      map.current.on('click', 'unclustered-point', (e) => {
        const features = map.current!.queryRenderedFeatures(e.point, { layers: ['unclustered-point'] });
        if (!features.length) return;
        const coordinates = (features[0].geometry as any).coordinates.slice() as [number, number];
        setSelectedFeature({ properties: features[0].properties as any, coordinates });
        map.current!.easeTo({ center: coordinates, zoom: Math.max(map.current!.getZoom(), 10), duration: 500 });
      });

      // Cursor
      map.current.on('mouseenter', 'unclustered-point', () => { map.current!.getCanvas().style.cursor = 'pointer'; });
      map.current.on('mouseleave', 'unclustered-point', () => { map.current!.getCanvas().style.cursor = ''; });
      map.current.on('mouseenter', 'clusters', () => { map.current!.getCanvas().style.cursor = 'pointer'; });
      map.current.on('mouseleave', 'clusters', () => { map.current!.getCanvas().style.cursor = ''; });
    });

    return () => {
      if (map.current) { map.current.remove(); map.current = null; }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update source data when filter changes
  useEffect(() => {
    if (map.current && map.current.getSource('locations')) {
      (map.current.getSource('locations') as any).setData(filteredGeoJson);
    }
  }, [filteredGeoJson]);

  // Switch map style (skip first mount — initial style set in constructor)
  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return; }
    if (!map.current) return;
    localStorage.setItem(STYLE_STORAGE_KEY, mapStyle);
    map.current.setStyle(STYLE_URLS[mapStyle]);
    map.current.once('style.load', () => {
      if (map.current) addMapLayers(map.current, filteredGeoJsonRef.current, filterTypeRef.current);
    });
  }, [mapStyle]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const flyToFeature = useCallback((feature: GeoJSON['features'][0]) => {
    const coordinates = feature.geometry.coordinates as [number, number];
    map.current?.flyTo({ center: coordinates, zoom: 12, duration: 800 });
    setSelectedFeature({ properties: feature.properties, coordinates });
  }, []);

  const handleFilterChange = useCallback((_: React.MouseEvent, value: FilterType | null) => {
    if (value !== null) setFilterType(value);
  }, []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Box
      sx={{
        display: 'flex',
        height: { xs: '500px', md: '700px', lg: '860px' },
        borderRadius: '16px',
        overflow: 'hidden',
        border: `1px solid ${tokens.rule}`,
        boxShadow: '0 8px 24px -8px rgba(8,40,52,0.14)',
      }}
    >
      {/* ------------------------------------------------------------------ */}
      {/* Left rail — hidden on mobile                                        */}
      {/* ------------------------------------------------------------------ */}
      <Box
        sx={{
          width: 340,
          flexShrink: 0,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          borderRight: `1px solid ${tokens.rule}`,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        {/* Rail header */}
        <Box sx={{ p: 2, borderBottom: `1px solid ${tokens.rule}` }}>
          <TextField
            value={railQuery}
            onChange={(e) => setRailQuery(e.target.value)}
            placeholder="Filter by name or region…"
            size="small"
            fullWidth
            sx={{
              mb: 1.5,
              '& .MuiOutlinedInput-root': {
                borderRadius: '999px',
                backgroundColor: tokens.bgSoft,
                '& fieldset': { borderColor: tokens.rule },
                '&:hover fieldset': { borderColor: tokens.ruleHi },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 16, color: tokens.textTertiary }} />
                </InputAdornment>
              ),
            }}
          />
          <ToggleButtonGroup
            value={filterType}
            exclusive
            onChange={handleFilterChange}
            size="small"
            fullWidth
            sx={{
              mb: 1,
              '& .MuiToggleButton-root': {
                borderRadius: '999px !important',
                border: `1px solid ${tokens.rule} !important`,
                fontSize: 11,
                fontWeight: 700,
                py: 0.5,
                color: tokens.textTertiary,
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main,
                  color: 'white',
                  '&:hover': { backgroundColor: theme.palette.primary.dark },
                },
              },
            }}
          >
            <ToggleButton value="all">All</ToggleButton>
            <ToggleButton value="spots">Spots</ToggleButton>
            <ToggleButton value="buoys">Buoys</ToggleButton>
          </ToggleButtonGroup>
          <Typography sx={{ fontSize: 11, color: tokens.textTertiary }}>
            {railItems.length} {filterType === 'all' ? 'locations' : filterType}
          </Typography>
        </Box>

        {/* Rail list */}
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          {railItems.map((feature) => {
            const isSpot = feature.properties.type === 'spot_location';
            const isSelected = selectedFeature?.properties.id === feature.properties.id;
            return (
              <Box
                key={`${feature.properties.type}-${feature.properties.id}`}
                onClick={() => flyToFeature(feature)}
                sx={{
                  px: 2.5,
                  py: 1.75,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  borderLeft: isSelected
                    ? `3px solid ${theme.palette.primary.main}`
                    : '3px solid transparent',
                  backgroundColor: isSelected ? tokens.bgSoft : 'transparent',
                  borderBottom: `1px solid ${tokens.rule}`,
                  transition: 'background-color 0.1s',
                  '&:hover': { backgroundColor: tokens.bgSoft },
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: isSpot ? '#1ed6e6' : '#f06292',
                    flexShrink: 0,
                  }}
                />
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontFamily: '"Bricolage Grotesque", Inter, sans-serif',
                      fontWeight: 600,
                      fontSize: 14,
                      color: theme.palette.text.primary,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {feature.properties.name}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 11,
                      color: tokens.textTertiary,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {feature.properties.subregion_name || feature.properties.description || ''}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* ------------------------------------------------------------------ */}
      {/* Map canvas                                                          */}
      {/* ------------------------------------------------------------------ */}
      <Box sx={{ flex: 1, position: 'relative' }}>
        <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

        {/* Style switcher — top left, desktop only */}
        <Paper
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            zIndex: 1,
            display: { xs: 'none', md: 'flex' },
            borderRadius: '999px',
            overflow: 'hidden',
            border: `1px solid ${tokens.rule}`,
          }}
          elevation={2}
        >
          {(Object.keys(STYLE_URLS) as MapStyle[]).map((style) => (
            <Box
              key={style}
              onClick={() => setMapStyle(style)}
              sx={{
                px: 1.75,
                py: 0.75,
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                userSelect: 'none',
                backgroundColor: mapStyle === style ? theme.palette.primary.main : 'transparent',
                color: mapStyle === style ? 'white' : tokens.textTertiary,
                transition: 'background-color 0.15s',
                '&:hover': {
                  backgroundColor: mapStyle === style ? theme.palette.primary.main : tokens.bgSoft,
                },
              }}
            >
              {style.charAt(0).toUpperCase() + style.slice(1)}
            </Box>
          ))}
        </Paper>

        {/* Mobile filter toggles — visible only on mobile */}
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            zIndex: 1,
            display: { xs: 'block', md: 'none' },
          }}
        >
          <ToggleButtonGroup
            value={filterType}
            exclusive
            onChange={handleFilterChange}
            size="small"
            sx={{
              backgroundColor: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(8px)',
              borderRadius: '20px',
              '& .MuiToggleButton-root': {
                color: tokens.textTertiary,
                border: 'none',
                borderRadius: '20px',
                px: 1.5,
                py: 0.5,
                fontSize: 11,
                fontWeight: 700,
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main,
                  color: 'white',
                },
              },
            }}
          >
            <ToggleButton value="all">All</ToggleButton>
            <ToggleButton value="spots">Spots</ToggleButton>
            <ToggleButton value="buoys">Buoys</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Selected feature card — bottom left */}
        {selectedFeature && (
          <Paper
            elevation={4}
            sx={{
              position: 'absolute',
              bottom: 32,
              left: 12,
              zIndex: 1,
              p: 2.5,
              width: 260,
              borderRadius: '16px',
            }}
          >
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: tokens.textTertiary,
                mb: 0.5,
              }}
            >
              {selectedFeature.properties.subregion_name ||
                (selectedFeature.properties.type === 'buoy_location' ? 'Buoy Station' : 'Surf Spot')}
            </Typography>
            <Typography
              sx={{
                fontFamily: '"Bricolage Grotesque", Inter, sans-serif',
                fontWeight: 700,
                fontSize: 20,
                letterSpacing: '-0.02em',
                color: theme.palette.text.primary,
                mb: 1.5,
              }}
            >
              {selectedFeature.properties.name}
            </Typography>
            <Button
              component={RouterLink}
              to={getDetailUrl(selectedFeature.properties)}
              variant="contained"
              fullWidth
              sx={{ borderRadius: '999px', fontWeight: 700, fontSize: 13 }}
            >
              View details →
            </Button>
          </Paper>
        )}

        {/* Legend — bottom right */}
        <Paper
          sx={{
            position: 'absolute',
            bottom: 32,
            right: 12,
            zIndex: 1,
            px: 2,
            py: 1.25,
            borderRadius: '999px',
            display: { xs: 'none', sm: 'flex' },
            alignItems: 'center',
            gap: 2,
            border: `1px solid ${tokens.rule}`,
          }}
          elevation={1}
        >
          {legendItems.map((item) => (
            <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: item.color,
                  border: '1.5px solid white',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }}
              />
              <Typography sx={{ fontSize: 11, fontWeight: 600, color: tokens.textTertiary }}>
                {item.label}
              </Typography>
            </Box>
          ))}
        </Paper>
      </Box>
    </Box>
  );
};
