import { getSurfSpots, getSurfSpotClosest } from "@features/locations/api/locations";
import { Spot } from "../types";
import { Box, InputAdornment, TextField, Typography, useTheme } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useQuery } from "@tanstack/react-query";
import { LinkRouter, SEO, PageContainer, HeroSection } from "components";
import surfImage from "assets/sharks1.jpg";
import NoDataFound from "components/common/not-found";
import { useColorMode } from "providers/theme-provider";
import { colorTokens } from "config/theme";
import HeroWidget from "components/common/hero-widget";
import { useUserLocation, useGeolocationStore } from "../stores/geolocation-store";
import { useNWSForecast } from "hooks/useNWSForecast";
import { getClostestTideStation, getCurrentTides } from "@features/tides/api/tides";
import { getCurrentTideValue } from "utils/tides";
import { kilometersPerHourToMph } from "utils/formatting";
import { getEnhancedConditionScore, getBatchRecommendationsFromAPI } from "utils/conditions";
import { useEffect, useMemo, useState } from "react";

function sortBySubregion(data: Spot[]) {
  const sortedData: { [key: string]: Spot[] } = {};
  data.forEach(spot => {
    if (!sortedData[spot.subregion_name]) {
      sortedData[spot.subregion_name] = [];
    }
    sortedData[spot.subregion_name].push(spot);
  });
  return sortedData;
}

const SpotsPage = () => {
  const theme = useTheme();
  const { mode } = useColorMode();
  const tokens = colorTokens[mode];
  const [query, setQuery] = useState('');

  const { location } = useUserLocation();
  const coordinates = location?.coordinates;

  useEffect(() => {
    if (useGeolocationStore.getState().location === undefined && !useGeolocationStore.getState().isLoading) {
      useGeolocationStore.getState().requestGeolocation();
    }
  }, []);

  // Spots directory
  const { data } = useQuery({
    queryKey: ['surf_spots'],
    queryFn: async () => getSurfSpots({ limit: 5000 })
  });

  // Widget data — same query keys as home page so cache is shared
  const { data: closestSpots } = useQuery({
    queryKey: ['closest_spots', coordinates?.latitude, coordinates?.longitude],
    queryFn: () => getSurfSpotClosest(coordinates!.latitude, coordinates!.longitude),
    enabled: !!coordinates?.latitude && !!coordinates?.longitude,
    staleTime: 5 * 60 * 1000,
  });

  const { data: nwsForecastData } = useNWSForecast(
    closestSpots?.[0]?.id,
    { enabled: !!closestSpots && closestSpots.length > 0 }
  );

  const { data: batchRecommendations } = useQuery({
    queryKey: ['batch_recommendations', closestSpots?.map(s => s.id).join(',')],
    queryFn: () => getBatchRecommendationsFromAPI(closestSpots!.map(spot => ({
      ...spot,
      distance: spot.distance ? `${spot.distance} miles` : undefined
    }))),
    enabled: !!closestSpots && closestSpots.length > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const { data: closestTideStation } = useQuery({
    queryKey: ['closest_tide_station', coordinates?.latitude, coordinates?.longitude],
    queryFn: () => getClostestTideStation({ lat: coordinates!.latitude, lng: coordinates!.longitude }),
    enabled: !!coordinates?.latitude && !!coordinates?.longitude,
  });

  const { data: currentTides } = useQuery({
    queryKey: ['current_tides', closestTideStation?.station_id],
    queryFn: () => getCurrentTides({ station: closestTideStation!.station_id }),
    enabled: !!closestTideStation?.station_id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const bestConditions = batchRecommendations?.bestConditions ?? null;
  const cleanestConditions = batchRecommendations?.cleanestConditions ?? null;
  const currentTideValue = currentTides ? getCurrentTideValue(currentTides) : null;

  const nwsCurrent = nwsForecastData?.current;
  const closestSpotData = closestSpots?.[0] && nwsCurrent ? {
    spot: closestSpots[0].name,
    waveHeight: `${nwsCurrent.wave_height.toFixed(1)}-${(nwsCurrent.wave_height + 1).toFixed(1)}ft`,
    score: getEnhancedConditionScore({
      waveHeight: nwsCurrent.wave_height,
      windSpeed: Math.floor(kilometersPerHourToMph(nwsCurrent.wind_speed || 0)),
    }),
  } : null;

  const showWidget = !!(bestConditions && cleanestConditions && closestSpotData && currentTideValue != null);

  const spotsArray: Spot[] = Array.isArray(data) ? data : (data && data.status === "success" && Array.isArray(data.data) ? data.data : []);
  const totalCount = spotsArray.length;

  // Client-side filter — only active after 3 characters
  const filtered = useMemo(() => {
    if (query.length < 3) return spotsArray;
    const q = query.toLowerCase();
    return spotsArray.filter(s =>
      s.name.toLowerCase().includes(q) || s.subregion_name.toLowerCase().includes(q)
    );
  }, [spotsArray, query]);

  const sortedSpots = useMemo(() => sortBySubregion(filtered), [filtered]);
  const resultCount = filtered.length;
  const isFiltering = query.length >= 3;

  return (
    <>
      <SEO title="Surf Spots - Surfe Diem" />

      <HeroSection
        image={surfImage}
        heading="Surf Spots"
        body="Explore surf spots by region, get detailed information about surf conditions, and find the best waves."
        ctas={[
          { label: 'Explore map', href: '/map', variant: 'outlined' },
        ]}
        widget={showWidget ? (
          <HeroWidget
            rows={[
              {
                label: 'Best right now',
                spot: bestConditions!.spot,
                value: bestConditions!.waveHeight ?? '—',
                score: bestConditions!.score,
              },
              {
                label: 'Cleanest',
                spot: cleanestConditions!.spot,
                value: cleanestConditions!.waveHeight ?? '—',
                score: cleanestConditions!.score,
              },
              {
                label: 'Closest to you',
                spot: closestSpotData!.spot,
                value: closestSpotData!.waveHeight,
                score: closestSpotData!.score,
              },
              {
                label: 'Current tide',
                value: `${currentTideValue!.toFixed(1)}ft`,
              },
            ]}
          />
        ) : null}
      />

      <PageContainer maxWidth="XL" padding="MEDIUM" marginBottom={20}>

        {/* Header strip */}
        <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
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
              Browse
            </Typography>
            <Typography
              component="h1"
              sx={{
                fontFamily: '"Bricolage Grotesque", Inter, sans-serif',
                fontWeight: 700,
                fontSize: { xs: '28px', md: '36px' },
                letterSpacing: '-0.025em',
                lineHeight: 1.05,
                color: theme.palette.text.primary,
              }}
            >
              Surf Spots
            </Typography>
            {totalCount > 0 && (
              <Typography sx={{ fontSize: 13, color: tokens.textTertiary, mt: 0.5 }}>
                {totalCount} spots across all regions
              </Typography>
            )}
          </Box>

          {/* Search */}
          <TextField
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search spots or regions…"
            size="small"
            sx={{
              minWidth: { xs: '100%', sm: '280px' },
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
                  <SearchIcon sx={{ fontSize: 18, color: tokens.textTertiary }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Result count */}
        <Typography sx={{ fontSize: 12, color: tokens.textTertiary, mb: 2.5 }}>
          {isFiltering
            ? `Showing ${resultCount} of ${totalCount} spots`
            : `Showing all ${totalCount} spots`
          }
        </Typography>

        {/* Spot list */}
        {Object.keys(sortedSpots).length > 0 ? (
          Object.keys(sortedSpots).map((subregion) => (
            <Box key={subregion} sx={{ mb: 4 }}>
              <Typography
                sx={{
                  fontFamily: '"Bricolage Grotesque", Inter, sans-serif',
                  fontWeight: 700,
                  fontSize: { xs: '16px', sm: '18px' },
                  letterSpacing: '-0.01em',
                  color: tokens.textTertiary,
                  mb: 1.5,
                }}
              >
                {subregion}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 1, sm: 1.5 } }}>
                {sortedSpots[subregion].map((spot) => (
                  <LinkRouter
                    key={spot.id}
                    to={`/spot/${spot.slug || spot.id}`}
                    underline="none"
                  >
                    <Box
                      sx={{
                        px: 2,
                        py: 1.25,
                        borderRadius: '12px',
                        backgroundColor: tokens.bgSoft,
                        border: `1px solid ${tokens.rule}`,
                        transition: 'border-color 0.15s, background-color 0.15s',
                        '&:hover': {
                          borderColor: tokens.ruleHi,
                          backgroundColor: theme.palette.action.hover,
                        },
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                          fontWeight: 500,
                          color: theme.palette.text.primary,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {spot.name}
                      </Typography>
                    </Box>
                  </LinkRouter>
                ))}
              </Box>
            </Box>
          ))
        ) : (
          <NoDataFound />
        )}

      </PageContainer>
    </>
  );
};

export default SpotsPage;
