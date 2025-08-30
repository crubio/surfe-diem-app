import { Box, Container, Grid, Stack, Typography } from "@mui/material";
import sharks from "assets/sharks1.jpg";
import { useQuery } from "@tanstack/react-query";
import { getLocations, getSurfSpots, getBatchForecast, getSurfSpotClosest } from "@features/locations/api/locations";
import { Item, SEO, LocationPrompt } from "components";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { getGeolocation } from "utils/geolocation";
import { useFavorites } from "../providers/favorites-provider";
import { FavoritesList } from "../components/favorites/favorites-list";
import { orderBy } from "lodash";
import { useEffect } from "react";
import { trackPageView, trackInteraction } from "utils/analytics";
import { getHomePageVariation } from "utils/ab-testing";
import { getEnhancedConditionScore, getBatchRecommendationsFromAPI } from "utils/conditions";
import { getClostestTideStation, getCurrentTides } from "@features/tides/api/tides";
import { getCurrentTideValue, getCurrentTideTime } from "utils/tides";
import { extractSwellDataFromForecast, getSwellQualityDescription, getSwellDirectionText, getSwellHeightColor, formatSwellHeight, formatSwellPeriod } from "utils/swell";
import { extractWaterTempFromForecast } from "utils/water-temp";
import { TemperatureCard } from "components";
import { FEATURED_SPOTS } from "utils/constants";
import { getForecastCurrent } from "@features/forecasts";
import HeroSection from "components/common/hero";
import ExploreActions from "components/common/explore-actions";
import DashboardCard from "@features/cards/dashboard-card";
import SearchCard from "@features/cards/search-select";
import {
  GRID_ITEM_SPACING,
  ITEM_PADDING,
  SECTION_MARGIN_BOTTOM,
  TITLE_FONT_WEIGHT,
  SECTION_TITLE_MB,
  SUBSECTION_TITLE_MB,
  FAVORITES_SECTION_MB,
  DASHBOARD_CARD_SECTION_MB,
  SEARCH_SECTION_MT
} from "utils/layout-constants";

const DashboardHome = () => {
  const navigate = useNavigate();
  const { favorites } = useFavorites();
  const variation = getHomePageVariation();
  
  // Track page view on mount
  useEffect(() => {
    trackPageView(variation, 'dashboard-home');
  }, [variation]);
  
  // List of all location metadata
  const {data: buoys} = useQuery({
    queryKey: ['locations'],
    queryFn: async () => getLocations()
  });
  
  // List of all surf spots metadata
  const {data: spots} = useQuery({
    queryKey: ['spots'],
    queryFn: async () => getSurfSpots()
  });
  
  // Users geolocation if available
  const {data: geolocation} = useQuery({
    queryKey: ['geolocation'],
    queryFn: async () => getGeolocation()
  });

  // List of closest spots to user's geolocation if available
  const {data: closestSpots, isError: isClosestSpotsError} = useQuery({
    queryKey: ['closest_spots', geolocation?.latitude, geolocation?.longitude],
    queryFn: () => getSurfSpotClosest(geolocation!.latitude, geolocation!.longitude),
    enabled: !!geolocation?.latitude && !!geolocation?.longitude,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const {data: closestSpotsForecast, isLoading: isForecastLoading, isError: isForecastError} = useQuery({
    queryKey: ['closest_spot_forecast', closestSpots?.[0]?.latitude, closestSpots?.[0]?.longitude],
    queryFn: () => getForecastCurrent({
      latitude: Number(closestSpots![0].latitude),
      longitude: Number(closestSpots![0].longitude),
    }),
    enabled: !!closestSpots && closestSpots.length > 0
  })

  // Get batch recommendations from nearby spots (optimized - single API call for all 3 cards)
  const {data: batchRecommendations, isLoading: isBatchLoading, isError: isBatchError} = useQuery({
    queryKey: ['batch_recommendations', closestSpots?.map(s => s.id).join(',')],
    queryFn: () => getBatchRecommendationsFromAPI(closestSpots!.map(spot => ({
      ...spot,
      distance: spot.distance ? `${spot.distance} miles` : undefined
    }))),
    enabled: !!closestSpots && closestSpots.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })

  // Extract individual results from batch
  const bestConditions = batchRecommendations?.bestConditions || null;
  const cleanestConditions = batchRecommendations?.cleanestConditions || null;
  const highestWaves = batchRecommendations?.highestWaves || null;

  // Get closest tide station to user's location
  const {data: closestTideStation} = useQuery({
    queryKey: ['closest_tide_station', geolocation?.latitude, geolocation?.longitude],
    queryFn: () => getClostestTideStation({
      lat: geolocation!.latitude,
      lng: geolocation!.longitude
    }),
    enabled: !!geolocation?.latitude && !!geolocation?.longitude,
  })

  // Get current tide data for the closest station
  const {data: currentTides, isLoading: tidesLoading, isError: tidesError} = useQuery({
    queryKey: ['current_tides', closestTideStation?.station_id],
    queryFn: () => getCurrentTides({
      station: closestTideStation!.station_id
    }),
    enabled: !!closestTideStation?.station_id,
    staleTime: 5 * 60 * 1000, // 5 minutes (more frequent updates for current data)
    gcTime: 10 * 60 * 1000, // 10 minutes
  })

  // Get featured spots from existing spots data
  const featuredSpots = spots ? spots.filter(spot => 
    FEATURED_SPOTS.includes(spot.slug)
  ) : [];

  // Get current tide value and time
  const currentTideValue = currentTides ? getCurrentTideValue(currentTides) : null;
  const currentTideTime = currentTides ? getCurrentTideTime(currentTides) : null;
  
  // Extract swell data from closest spot forecast
  const currentSwellData = closestSpotsForecast ? extractSwellDataFromForecast(closestSpotsForecast) : null;
  
  // Extract water temperature data from closest spot forecast
  const currentWaterTempData = closestSpotsForecast ? extractWaterTempFromForecast(closestSpotsForecast) : null;
  
  // Fetch current data for favorites - Updated to React Query v5 object syntax
  const {data: favoritesData, isPending: favoritesLoading} = useQuery({
    queryKey: ['favorites-batch-data', favorites.length > 0 ? favorites.map(f => `${f.type}-${f.id}`).join(',') : 'empty'],
    queryFn: () => {
      if (favorites.length === 0) return { buoys: [], spots: [] };
      
      const buoyIds = favorites.filter(f => f.type === 'buoy').map(f => f.id);
      const spotIds = favorites.filter(f => f.type === 'spot').map(f => Number(f.id));
      
      return getBatchForecast({
        buoy_ids: buoyIds.length > 0 ? buoyIds : undefined,
        spot_ids: spotIds.length > 0 ? spotIds : undefined,
      });
    },
    enabled: favorites.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime in v5)
  });

  // Navigation functions with tracking
  const goToBuoyPage = (location_id: string) => {
    trackInteraction(variation, 'buoy_click', { location_id });
    navigate(`/location/${location_id}`);
  };

  const goToSpotPage = (spot_id: string) => {
    const spot = spots?.find(s => s.id.toString() === spot_id);
    trackInteraction(variation, 'spot_click', { spot_id, spot_name: spot?.name });
    if (spot?.slug) {
      navigate(`/spot/${spot.slug}`);
    } else {
      navigate(`/spot/${spot_id}`);
    }
  };

  // Helper function to get closest spot
  const getClosestSpot = () => {
    // If we have geolocation, show closest spot
    if (geolocation?.latitude && geolocation?.longitude && closestSpots && closestSpots.length > 0) {
      // Use actual closest spot data
      const closestSpot = closestSpots[0]; // API returns sorted by distance, first is the closest

      if (closestSpotsForecast?.current) {
        // Return the tranformed spot data for use with the dashboard "closest" card
        return {
          spot: closestSpot.name,
          spotId: closestSpot.id,
          slug: closestSpot.slug,
          distance: closestSpot.distance,
          waveHeight: `${closestSpotsForecast.current.swell_wave_height.toFixed(1)}-${(closestSpotsForecast.current.swell_wave_height + 1).toFixed(1)}ft`,
          windSpeedValue: closestSpotsForecast.current.wind_wave_height,
          score: getEnhancedConditionScore({waveHeight: closestSpotsForecast.current.swell_wave_height, windSpeed: closestSpotsForecast.current.wind_wave_height}),
          waveHeightValue: closestSpotsForecast.current.swell_wave_height,
          isLocationBased: true
        }
      }
    } else if (featuredSpots && featuredSpots.length > 0) {
      // Fallback to featured SF Bay Area spot
      const featuredSpot = featuredSpots[0];
      // Use default values since Spot type doesn't include wave/wind data, TODO: implemnt after current data is available
      return {
        spot: featuredSpot.name,
        spotId: featuredSpot.id,
        slug: featuredSpot.slug
      };
    } else {
      return null;
    }
  };

  // Move getClosestSpot call out of JSX
  const closestSpotData = getClosestSpot();

  const recommendations = [
    { key: 'best', title: 'Best Right Now', data: bestConditions },
    { key: 'closest', title: 'Closest to You', data: closestSpotData },
    { key: 'cleanest', title: 'Cleanest Conditions', data: cleanestConditions }
  ];

  return (
    <>
      <SEO 
        title="Surfe Diem - What's the surf like now?"
        description="Get real-time surf conditions and current forecasts. Find the best waves right now."
        keywords="surf conditions, current surf, wave height, surf forecast, real-time surf data"
        url="https://surfe-diem.com"
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Surfe Diem",
            "description": "Real-time surf conditions and current forecasts",
            "url": "https://surfe-diem.com"
          })}
        </script>
      </Helmet>
      
      <Container maxWidth="xl" sx={{ 
        marginTop: { xs: '10px', sm: '0px' }, 
        padding: { xs: "12px", sm: "20px" }, 
        paddingTop: { xs: "0px", sm: "0px" }
      }}>
        
        {/* Hero Section */}
        <HeroSection image={sharks} headline="What's the surf like now?" body="Real-time conditions and current forecasts"/>

        {/* Explore section */}
        <ExploreActions page="home" geolocation={!!geolocation} />

        {/* My Lineup (Favorites) - First row of content */}
        <Box sx={{ marginBottom: FAVORITES_SECTION_MB }}>
          <FavoritesList 
            favorites={favorites}
            currentData={favoritesData}
            isLoading={favoritesLoading}
          />
        </Box>

        {/* Current Conditions Grid */}
        <Item sx={{ bgcolor: 'background.default', marginBottom: DASHBOARD_CARD_SECTION_MB, p: ITEM_PADDING }}>
          <Typography variant="h5" component="h2" sx={{ mb: SECTION_TITLE_MB, fontWeight: TITLE_FONT_WEIGHT }}>
            Current Conditions Dashboard
          </Typography>
          
          {/* Recommendations Section */}
          <Typography variant="h6" component="h3" sx={{ mb: SUBSECTION_TITLE_MB, fontWeight: TITLE_FONT_WEIGHT, color: 'primary.main' }}>
            Recommendations
          </Typography>
          
          <Grid container spacing={GRID_ITEM_SPACING}>
            {recommendations.map(({ key, title, data }) => (
              <Grid item xs={12} sm={6} md={4} key={key}>
                {!geolocation ? (
                  <LocationPrompt />
                ) : (
                  <DashboardCard
                    isLoading={isBatchLoading}
                    isError={isBatchError}
                    title={title}
                    name={data?.spot || ''}
                    subtitle={data?.waveHeight || ''}
                    score={data?.score}
                    heightValue={data?.waveHeightValue}
                    speedValue={data?.windSpeedValue}
                    description={data?.score?.description}
                    onClick={() => data?.slug && navigate(`/spot/${data.slug}`)}
                  />
                )}
              </Grid>
            ))}
          </Grid>

          {/* Divider */}
          <Box sx={{ 
            borderTop: '1px solid', 
            borderColor: 'divider', 
            my: SECTION_MARGIN_BOTTOM,
            opacity: 0.6 
          }} />

          {/* Current Conditions Section */}
          {geolocation ? (
            <>
              <Typography variant="h6" component="h3" sx={{ mb: SUBSECTION_TITLE_MB, fontWeight: TITLE_FONT_WEIGHT, color: 'primary.main' }}>
                Current Conditions
              </Typography>
              <Grid container spacing={GRID_ITEM_SPACING}>
              <Grid item xs={12} sm={6} md={3}>
                <DashboardCard
                  isLoading={isForecastLoading}
                  isError={isForecastError}
                  title="Current Swell"
                  name={currentSwellData ? formatSwellHeight(currentSwellData.height) : ''}
                  score={currentSwellData ? {
                    label: getSwellQualityDescription(currentSwellData.period),
                    color: getSwellHeightColor(currentSwellData.height),
                    description: `${formatSwellPeriod(currentSwellData.period)} • ${getSwellDirectionText(currentSwellData.direction)}`
                  } : undefined}
                  subtitle={currentSwellData ? `${formatSwellPeriod(currentSwellData.period)} • ${getSwellDirectionText(currentSwellData.direction)}` : undefined}
                  heightValue={currentSwellData?.height}
                  description={currentSwellData ? `Swell from ${getSwellDirectionText(currentSwellData.direction)}` : undefined}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <DashboardCard
                  isLoading={tidesLoading}
                  isError={tidesError}
                  title="Current Tide"
                  name={currentTideValue !== null && currentTideValue !== undefined ? `${currentTideValue.toFixed(1)}ft` : ''}
                  score={{ label: currentTideTime!, color: 'info', description: currentTideTime ? `as of ${currentTideTime}` : 'recent reading' }}
                  description={closestTideStation ? `Reported from station ${closestTideStation.station_id}` : undefined}
                  heightValue={currentTideValue !== null ? currentTideValue : undefined}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <DashboardCard 
                  isLoading={isForecastLoading}
                  isError={isClosestSpotsError}
                  title={"Current Water Temperature"}
                  name="" // No main name, using card below
                >
                  {currentWaterTempData?.temperature ? (
                    <TemperatureCard 
                      temperature={currentWaterTempData?.temperature}
                      showFahrenheit={true}
                      showComfortLevel={false}
                    />
                  ) : (
                    <Typography variant="body1" color="text.secondary">
                      No data available
                    </Typography>
                  )}
                </DashboardCard>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <DashboardCard
                  isLoading={isBatchLoading}
                  isError={isBatchError}
                  title="Highest Waves"
                  name={highestWaves && typeof highestWaves.waveHeight === 'string' ? highestWaves.waveHeight : ''}
                  subtitle={highestWaves ? `${highestWaves.spot} • ${highestWaves.conditions}` : ''}
                  heightValue={highestWaves?.waveHeightValue}
                  onClick={() => {
                    if (highestWaves?.slug) {
                      navigate(`/spot/${highestWaves.slug}`);
                    }
                  }}
                  score={highestWaves?.score
                    ? {...highestWaves.score, description: highestWaves.score.description || (highestWaves.waveHeightValue && highestWaves.waveHeightValue >= 6 ? 'Experienced surfers only' : 'Good waves available')}
                    : undefined
                  }
                />
              </Grid>
            </Grid>
            </>
          ) : null}
        </Item>

        {/* Search Sections (Collapsible) */}
        <Item sx={{ bgcolor: 'background.default', marginTop: SEARCH_SECTION_MT }}>
          <Typography variant="h5" component="h2" sx={{ mb: SUBSECTION_TITLE_MB, fontWeight: TITLE_FONT_WEIGHT }}>
            Search
          </Typography>
          <Grid container spacing={GRID_ITEM_SPACING}>
            <Grid item xs={12} md={6}>
              <SearchCard
                label="Find a Buoy"
                items={buoys && buoys.length > 0 ? orderBy(buoys, ["name"], ["asc"]) : []}
                selectValueKey="location_id"
                doOnSelect={goToBuoyPage}
                type="buoy"
                placeholder="Search buoys..."
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <SearchCard
                label="Find a Spot"
                items={spots && spots.length > 0 ? orderBy(spots, ["subregion_name", "name"], ["asc"]) : []}
                selectValueKey="id"
                doOnSelect={goToSpotPage}
                type="spot"
                placeholder="Search surf spots..."
              />
            </Grid>
          </Grid>
        </Item>

      </Container>
    </>
  );
};

export default DashboardHome; 