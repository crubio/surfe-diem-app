import { getGeoJsonLocations, getSurfSpotsGeoJson } from "@features/locations/api/locations"
import { useQuery } from "@tanstack/react-query"
import { SEO } from "components"
import { useEffect, useState, lazy, Suspense, useMemo } from "react"
import { Box, CircularProgress, Typography, useTheme } from "@mui/material"
import { useColorMode } from "providers/theme-provider"
import { colorTokens } from "config/theme"

// Lazy load the map component to reduce initial bundle size
const MapBox = lazy(() => import("@features/maps").then(module => ({ default: module.MapBox })))

const MapPage = () => {
  const [coords, setCoords] = useState<[number, number] | null>(null)
  const theme = useTheme()
  const { mode } = useColorMode()
  const tokens = colorTokens[mode]

  const { data: locationsGeoJson, isFetched: isLocationsFetched, isError: isLocationsError } = useQuery({
    queryKey: ['locations/geojson'],
    queryFn: () => getGeoJsonLocations()
  });

  const { data: spotsGeoJson } = useQuery({
    queryKey: ['spots/geojson'],
    queryFn: () => getSurfSpotsGeoJson()
  })

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      setCoords([position.coords.longitude, position.coords.latitude])
      return true
    })
  }, [])

  const geoJson = useMemo(() => {
    if (!locationsGeoJson || !spotsGeoJson) return undefined;
    if (locationsGeoJson.type === "FeatureCollection" && spotsGeoJson.type === "FeatureCollection") {
      return {
        type: "FeatureCollection",
        features: [
          ...locationsGeoJson.features,
          ...spotsGeoJson.features,
        ],
      };
    }
    return undefined;
  }, [locationsGeoJson, spotsGeoJson]);

  return (
    <>
      <SEO title="Explore - Surfe Diem" />

      {/* Page header */}
      <Box sx={{ px: { xs: 2, md: 4 }, pt: 3, pb: 2 }}>
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: tokens.textTertiary,
            mb: 0.5,
          }}
        >
          Buoys and Surf spots
        </Typography>
        <Typography
          component="h1"
          sx={{
            fontFamily: '"Bricolage Grotesque", Inter, sans-serif',
            fontWeight: 700,
            fontSize: { xs: '32px', md: '44px' },
            letterSpacing: '-0.03em',
            lineHeight: 1,
            color: theme.palette.text.primary,
          }}
        >
          Explore
        </Typography>
      </Box>

      {/* Map workspace — full width with horizontal padding */}
      <Box sx={{ px: { xs: 1, md: 3 }, pb: 4 }}>
        {geoJson && locationsGeoJson && isLocationsFetched ? (
          <Suspense fallback={
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 1.5,
              height: { xs: '500px', md: '700px', lg: '860px' },
              justifyContent: 'center',
            }}>
              <CircularProgress size={20} />
              <Typography sx={{ fontSize: 14, color: tokens.textTertiary }}>Loading map...</Typography>
            </Box>
          }>
            <MapBox
              geoJson={geoJson}
              lat={coords?.[1] ?? undefined}
              lng={coords?.[0] ?? undefined}
            />
          </Suspense>
        ) : isLocationsError ? (
          <Box sx={{ py: 6 }}>
            <Typography
              sx={{
                fontFamily: '"Bricolage Grotesque", Inter, sans-serif',
                fontWeight: 700,
                fontSize: 20,
                color: theme.palette.text.primary,
                mb: 0.5,
              }}
            >
              Could not load map data
            </Typography>
            <Typography sx={{ fontSize: 14, color: tokens.textTertiary }}>
              Try refreshing the page.
            </Typography>
          </Box>
        ) : (
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 1.5,
            height: { xs: '500px', md: '700px', lg: '860px' },
            justifyContent: 'center',
          }}>
            <CircularProgress size={20} />
            <Typography sx={{ fontSize: 14, color: tokens.textTertiary }}>Loading map...</Typography>
          </Box>
        )}
      </Box>
    </>
  )
}

export default MapPage
