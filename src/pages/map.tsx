import { getGeoJsonLocations, getSurfSpotsGeoJson } from "@features/locations/api/locations"
import { useQuery } from "@tanstack/react-query"
import PageContainer from "components/common/container"
import { SEO } from "components"
import { useEffect, useState, lazy, Suspense, useMemo } from "react"
import { Box, CircularProgress, Typography, useTheme } from "@mui/material"
import { useColorMode } from "providers/theme-provider"
import { colorTokens } from "config/theme"

// Lazy load the map component to reduce initial bundle size
const MapBox = lazy(() => import("@features/maps").then(module => ({ default: module.MapBox })))

const MapPage = () => {
  const [coords, setCoords] = useState<[number, number] | null>(null) // [lat, lng]
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
      <PageContainer>
        <Box sx={{ mb: 3 }}>
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
            Explore
          </Typography>
          <Typography
            component="h1"
            sx={{
              fontFamily: '"Bricolage Grotesque", Inter, sans-serif',
              fontWeight: 700,
              fontSize: { xs: '36px', md: '48px' },
              letterSpacing: '-0.03em',
              lineHeight: 1,
              color: theme.palette.text.primary,
            }}
          >
            Buoys &amp; Spots
          </Typography>
        </Box>

        {geoJson && locationsGeoJson && isLocationsFetched && (
          <Suspense fallback={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 4 }}>
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
        )}

        {isLocationsError && (
          <Box sx={{ py: 4 }}>
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
        )}
      </PageContainer>
    </>
  )
}

export default MapPage
