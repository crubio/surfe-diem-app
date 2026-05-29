import { getLatestObservation, getLocation } from "@features/locations/api/locations"
import { Box, Button, Chip, Divider, Paper, Typography, useTheme } from "@mui/material"
import { useQuery } from "@tanstack/react-query"
import { SEO, BuoyStructuredData, PageContainer } from "components"
import { useParams } from "react-router-dom"
import { formatLatLong } from "utils/common"
import ErrorPage from "./error"
import MapBoxSingle from "@features/maps/mapbox/single-instance"
import { Loading } from "components/layout/loading"
import { useFavorites } from "providers/favorites-provider"
import { Favorite as FavoriteIcon, FavoriteBorder as FavoriteBorderIcon } from '@mui/icons-material'
import { useColorMode } from "providers/theme-provider"
import { colorTokens } from "config/theme"
import type { Favorite } from "types"

interface MetricTileProps {
  label: string;
  value: string | null | undefined;
  isLoading: boolean;
  bgColor: string;
  textTertiary: string;
  accentColor: string;
}

const MetricTile = ({ label, value, isLoading, bgColor, textTertiary, accentColor }: MetricTileProps) => {
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: { xs: '40%', sm: 0 },
        px: 2.5,
        py: 2,
        borderRadius: '12px',
        backgroundColor: bgColor,
      }}
    >
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: textTertiary,
              mb: 0.75,
            }}
          >
            {label}
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Bricolage Grotesque", Inter, sans-serif',
              fontWeight: 700,
              fontSize: 30,
              letterSpacing: '-0.03em',
              lineHeight: 1,
              color: value ? accentColor : textTertiary,
            }}
          >
            {value ?? '—'}
          </Typography>
        </>
      )}
    </Box>
  );
};

const LocationsPage = () => {
  const params = useParams()
  const { locationId } = params
  const theme = useTheme();
  const { mode } = useColorMode();
  const tokens = colorTokens[mode];
  const { isFavorited, addFavorite, removeFavorite } = useFavorites();

  const { data: locationData, isError: isLocationError, error } = useQuery({
    queryKey: ['location', locationId],
    queryFn: () => getLocation(locationId)
  });

  const { data: latestObservationData, isPending: isLatestObsvLoading } = useQuery({
    queryKey: ['latest_observation', params],
    queryFn: () => getLatestObservation(locationId!),
    enabled: !!locationData?.location_id
  });

  const latLong = formatLatLong(locationData?.location || "")

  const latestReading = Object.assign({}, ...(latestObservationData ?? []));

  const favorited = isFavorited(String(locationData?.location_id ?? ''), 'buoy');

  const handleFavoriteToggle = () => {
    if (!locationData) return;
    if (favorited) {
      removeFavorite(String(locationData.location_id), 'buoy');
    } else {
      const fav: Omit<Favorite, 'addedAt'> = {
        id: String(locationData.location_id),
        type: 'buoy',
        name: locationData.name,
        location: locationData.location,
      };
      addFavorite(fav);
    }
  };

  const metrics = [
    { label: 'Wave Height', value: latestReading.wave_height ?? latestReading.swell_height },
    { label: 'Period', value: latestReading.peak_period ?? latestReading.period },
    { label: 'Water Temp', value: latestReading.water_temp },
    { label: 'Air Temp', value: latestReading.air_temp },
  ];

  return (
    <>
      {locationData && (
        <>
          <SEO title={`${locationData.name} - Surfe Diem`} />
          <BuoyStructuredData
            name={locationData.name}
            description={locationData.description || `Weather buoy providing real-time surf conditions`}
            location={locationData.location || ''}
            url={`https://surfe-diem.com/location/${locationData.location_id}`}
            buoyUrl={locationData.url}
          />
        </>
      )}
      {isLocationError ? <ErrorPage error={error} /> : (
        <PageContainer maxWidth="XL" padding="MEDIUM" marginBottom={20}>

          {/* Page header */}
          <Box sx={{ mb: 2 }}>
            <Paper sx={{ p: 3.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                <Box>
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
                    Buoy Station
                  </Typography>
                  <Typography
                    component="h1"
                    sx={{
                      fontFamily: '"Bricolage Grotesque", Inter, sans-serif',
                      fontWeight: 700,
                      fontSize: { xs: '36px', md: '52px' },
                      letterSpacing: '-0.03em',
                      lineHeight: 0.95,
                      color: theme.palette.text.primary,
                    }}
                  >
                    {locationData?.name ?? '—'}
                  </Typography>
                </Box>

                {locationData && (
                  <Button
                    variant={favorited ? 'contained' : 'outlined'}
                    size="small"
                    startIcon={favorited ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                    onClick={handleFavoriteToggle}
                    sx={{
                      borderRadius: '999px',
                      px: 2,
                      py: 0.75,
                      fontWeight: 600,
                      fontSize: 13,
                      flexShrink: 0,
                    }}
                  >
                    {favorited ? 'Saved' : 'Save'}
                  </Button>
                )}
              </Box>

              {/* Meta chips */}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {locationData?.description && (
                  <Chip
                    label={locationData.description}
                    size="small"
                    sx={{ backgroundColor: tokens.bgSoft, color: theme.palette.text.secondary, fontSize: 11 }}
                  />
                )}
                {locationData?.location?.split("(")[0]?.trim() && (
                  <Chip
                    label={locationData.location.split("(")[0].trim()}
                    size="small"
                    sx={{ backgroundColor: tokens.bgSoft, color: theme.palette.text.secondary, fontSize: 11 }}
                  />
                )}
                {locationData?.url && (
                  <Chip
                    component="a"
                    label="More info ↗"
                    href={locationData.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    clickable
                    size="small"
                    sx={{ backgroundColor: tokens.bgSoft, color: theme.palette.text.secondary, fontSize: 11 }}
                  />
                )}
              </Box>
            </Paper>
          </Box>

          {/* Latest observation */}
          <Box sx={{ mb: 2 }}>
            <Paper sx={{ p: 3.5 }}>
              <Box sx={{ mb: 2.5 }}>
                <Typography
                  sx={{
                    fontFamily: '"Bricolage Grotesque", Inter, sans-serif',
                    fontWeight: 700,
                    fontSize: 18,
                    letterSpacing: '-0.02em',
                  }}
                >
                  Latest Observation
                </Typography>
                <Typography sx={{ fontSize: 12, color: theme.palette.text.secondary, mt: 0.25 }}>
                  Most recent buoy reading
                </Typography>
              </Box>
              <Divider sx={{ mb: 2.5, borderColor: tokens.rule }} />
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                {metrics.map((m) => (
                  <MetricTile
                    key={m.label}
                    label={m.label}
                    value={m.value}
                    isLoading={isLatestObsvLoading}
                    bgColor={tokens.bgSoft}
                    textTertiary={tokens.textTertiary}
                    accentColor={tokens.accentDark}
                  />
                ))}
              </Box>
            </Paper>
          </Box>

          {/* Map */}
          {locationData?.location && latLong[0] && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mb: 2.5 }}>
                <Box>
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
                    Location
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: '"Bricolage Grotesque", Inter, sans-serif',
                      fontWeight: 700,
                      fontSize: 36,
                      letterSpacing: '-0.025em',
                      lineHeight: 1.05,
                    }}
                  >
                    Explore
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  href={`https://www.google.com/maps?q=${latLong[0]},${latLong[1]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    borderRadius: '999px',
                    px: 2,
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  Open in map ↗
                </Button>
              </Box>
              <MapBoxSingle lat={latLong[0]} lng={latLong[1]} zoom={8} />
            </Box>
          )}

        </PageContainer>
      )}
    </>
  )
}

export default LocationsPage
