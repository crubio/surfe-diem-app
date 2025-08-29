import { Box, Container, Grid, Stack, Typography, Card, CardContent, Button, Chip, LinearProgress, Tooltip } from "@mui/material";
import sharks from "assets/sharks1.jpg";
import { useQuery } from "@tanstack/react-query";
import { getLocations, getSurfSpots, getBatchForecast, getSurfSpotClosest } from "@features/locations/api/locations";
import { Item, SEO, EnhancedSelect, LocationPrompt } from "components";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { getGeolocation } from "utils/geolocation";
import { useFavorites } from "../providers/favorites-provider";
import { FavoritesList } from "../components/favorites/favorites-list";
import { orderBy } from "lodash";
import { useEffect, useState } from "react";
import { trackPageView, trackInteraction } from "utils/analytics";
import { getHomePageVariation } from "utils/ab-testing";
import { getEnhancedConditionScore, getWaveHeightColor, getWindColor, getBatchRecommendationsFromAPI } from "utils/conditions";
import { getClostestTideStation, getCurrentTides } from "@features/tides/api/tides";
import { getCurrentTideValue, getCurrentTideTime, calculateCurrentTideState } from "utils/tides";
import { extractSwellDataFromForecast, getSwellQualityDescription, getSwellDirectionText, getSwellHeightColor, formatSwellHeight, formatSwellPeriod, getSwellHeightPercentage } from "utils/swell";
import { extractWaterTempFromForecast, getWaterTempQualityDescription, getWaterTempColor } from "utils/water-temp";
import { TemperatureCard } from "components";
import { FEATURED_SPOTS } from "utils/constants";
import { getForecastCurrent } from "@features/forecasts";
import HeroSection from "components/common/hero";
import ExploreActions from "components/common/explore-actions";
import { getWaveHeightPercentage } from "utils/formatting";
import DashboardCard from "@features/cards/dashboard-card";

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
  const {data: closestSpots, isLoading: isClosestSpotsLoading, isError: isClosestSpotsError} = useQuery({
    queryKey: ['closest_spots', geolocation?.latitude, geolocation?.longitude],
    queryFn: () => getSurfSpotClosest(geolocation!.latitude, geolocation!.longitude),
    enabled: !!geolocation?.latitude && !!geolocation?.longitude,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const {data: closestSpotsForecast, isLoading: isForecastLoading} = useQuery({
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
        <Box sx={{ marginBottom: "20px" }}>
          <FavoritesList 
            favorites={favorites}
            currentData={favoritesData}
            isLoading={favoritesLoading}
          />
        </Box>

          {/* Current Conditions Grid */}
          <Item sx={{ bgcolor: 'background.default', marginBottom: "20px", p: 3 }}>
          <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
            Current Conditions Dashboard
          </Typography>
          
          {/* Recommendations Section */}
          <Typography variant="h6" component="h3" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
            Recommendations
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {/* Best Right Now Card */}
            <Grid item xs={12} sm={6} md={4}>
              {!geolocation ? (
                <LocationPrompt/>
              ) : (
                <DashboardCard
                  isLoading={isBatchLoading}
                  isError={isBatchError}
                  title="Best Right Now"
                  name={bestConditions?.spot || ''}
                  subtitle={
                    bestConditions
                      ? `${bestConditions.waveHeight}`
                      : ''
                  }
                  score={bestConditions?.score}
                  heightValue={bestConditions?.waveHeightValue}
                  speedValue={bestConditions?.windSpeedValue}
                  onClick={() => {
                    if (bestConditions?.slug) {
                      navigate(`/spot/${bestConditions.slug}`);
                    }
                  }}
                  description={
                    bestConditions?.score?.description
                  }
                />
              )}
            </Grid>
            {/* Closest to You Card */}
            <Grid item xs={12} sm={6} md={4}>
              {!geolocation ? (
                <LocationPrompt/>
              ) : (
                <DashboardCard
                  isLoading={isClosestSpotsLoading}
                  isError={isClosestSpotsError}
                  name={closestSpotData?.spot || ''}
                  title="Closest to You"
                  subtitle={
                    closestSpotData
                      ? `${closestSpotData.waveHeight || ''}`
                      : ''
                  }
                  score={closestSpotData?.score}
                  heightValue={closestSpotData?.waveHeightValue}
                  speedValue={closestSpotData?.windSpeedValue}
                  onClick={() => {
                    if (closestSpotData?.slug) {
                      navigate(`/spot/${closestSpotData.slug}`);
                    } else if (closestSpotData?.spotId) {
                      navigate(`/spot/${closestSpotData.spotId}`);
                    }
                  }}
                  description={
                    closestSpotData?.isLocationBased
                      ? `${closestSpotData.distance ? `${closestSpotData.distance.toFixed(1)}mi` : ''} • Based on your location`
                      : undefined
                  }
                />
              )}
            </Grid>
            {/* Cleanest Conditions Card */}
            <Grid item xs={12} sm={6} md={4}>
              {!geolocation ? (
                <LocationPrompt/>
              ) : (
                <DashboardCard
                  name={cleanestConditions?.spot || ''}
                  title="Cleanest Conditions"
                  subtitle={
                    cleanestConditions
                      ? `${cleanestConditions.waveHeight}`
                      : ''
                  }
                  score={cleanestConditions?.score}
                  heightValue={cleanestConditions?.waveHeightValue}
                  speedValue={cleanestConditions?.windSpeedValue}
                  onClick={() => {
                    if (cleanestConditions?.slug) {
                      navigate(`/spot/${cleanestConditions.slug}`);
                    }
                  }}
                  description={
                    cleanestConditions
                      ? cleanestConditions.direction
                        ? `${cleanestConditions.direction} swell • ${cleanestConditions.score?.description || ''}`
                        : cleanestConditions.score?.description
                      : undefined
                  }
                  isError={isBatchError}
                  isLoading={isBatchLoading}
                />
              )}
            </Grid>
          </Grid>

          {/* Divider */}
          <Box sx={{ 
            borderTop: '1px solid', 
            borderColor: 'divider', 
            my: 3,
            opacity: 0.6 
          }} />

          {/* Current Conditions Section */}
          <Typography variant="h6" component="h3" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
            Current Conditions
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <DashboardCard
                title="Current Swell"
                name={currentSwellData ? formatSwellHeight(currentSwellData.height) : ''}
                isLoading={isForecastLoading}
                isError={isClosestSpotsError}
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
                title="Current Tide"
                name={currentTideValue !== null && currentTideValue !== undefined ? `${currentTideValue.toFixed(1)}ft` : ''}
                score={{ label: currentTideTime!, color: 'info', description: currentTideTime ? `as of ${currentTideTime}` : 'recent reading' }}
                isLoading={tidesLoading}
                isError={tidesError}
                description={closestTideStation ? `Reported from station ${closestTideStation.station_id}` : undefined}
                heightValue={currentTideValue !== null ? currentTideValue : undefined}
              >
              </DashboardCard>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                sx={{ 
                  height: "100%", 
                  transition: 'all 0.2s ease-in-out',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  '&:hover': {
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.04)'
                        : 'rgba(0,0,0,0.02)',
                  },
                }}
              >
                <CardContent>
                  {!closestSpotsForecast ? (
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Loading water temp...
                      </Typography>
                    </Box>
                  ) : !currentWaterTempData ? (
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        No water temp data available
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" color="primary" gutterBottom>
                          Water Temperature
                        </Typography>
                        <Chip 
                          label={getWaterTempQualityDescription(currentWaterTempData.temperature)}
                          color={getWaterTempColor(currentWaterTempData.temperature)}
                          size="small"
                          sx={{ fontWeight: 'bold' }}
                        />
                      </Box>
                      {/* Temperature Card */}
                      <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
                        <TemperatureCard 
                          temperature={currentWaterTempData.temperature}
                          showFahrenheit={true}
                          showComfortLevel={false}
                        />
                      </Box>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                sx={{ 
                  height: "100%", 
                  transition: 'all 0.2s ease-in-out',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  '&:hover': {
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.04)'
                        : 'rgba(0,0,0,0.02)',
                  },
                }}
              >
                <CardContent>
                  {isBatchLoading ? (
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Finding highest waves...
                      </Typography>
                    </Box>
                  ) : !highestWaves ? (
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        No significant waves nearby
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" color="primary" gutterBottom>
                          Highest Waves
                        </Typography>
                        <Chip 
                          label={highestWaves.waveHeightValue && highestWaves.waveHeightValue >= 6 ? 'Big' : 'Medium'}
                          color={getWaveHeightColor(highestWaves.waveHeightValue || 0)}
                          size="small"
                          sx={{ fontWeight: 'bold' }}
                        />
                      </Box>
                      <Typography variant="h4" component="div" sx={{ fontWeight: "bold", mb: 1 }}>
                        {highestWaves.waveHeight}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                        {highestWaves.spot} • {highestWaves.conditions}
                      </Typography>
                      
                      {/* Progress bar for wave height */}
                      <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            Wave Height
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {highestWaves.waveHeightValue?.toFixed(1)}ft
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={getWaveHeightPercentage(highestWaves.waveHeightValue || 0)}
                          sx={{ 
                            height: 6, 
                            borderRadius: 3,
                            backgroundColor: 'rgba(0,0,0,0.1)',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: getWaveHeightColor(highestWaves.waveHeightValue || 0) === 'success' ? '#4caf50' : 
                                             getWaveHeightColor(highestWaves.waveHeightValue || 0) === 'warning' ? '#ff9800' : 
                                             getWaveHeightColor(highestWaves.waveHeightValue || 0) === 'error' ? '#f44336' : '#2196f3'
                            }
                          }}
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary">
                        {highestWaves.waveHeightValue && highestWaves.waveHeightValue >= 6 ? 'Experienced surfers only' : 'Good waves available'}
                      </Typography>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Item>

        {/* Search Sections (Collapsible) */}
        <Item sx={{ bgcolor: 'background.default', marginTop: "20px" }}>
          <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
            Search
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Find a Buoy
                </Typography>
                {buoys && buoys.length > 0 && (
                  <EnhancedSelect 
                    label="Select a buoy" 
                    items={orderBy(buoys, ["name"], ["asc"])} 
                    selectValueKey="location_id" 
                    doOnSelect={goToBuoyPage}
                    type="buoy"
                    placeholder="Search buoys..."
                  />
                )}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Find a Spot
                </Typography>
                {spots && spots.length > 0 && (
                  <EnhancedSelect 
                    label="Select a surf spot" 
                    items={orderBy(spots, ["subregion_name", "name"], ["asc"])} 
                    selectValueKey="id" 
                    doOnSelect={goToSpotPage}
                    type="spot"
                    placeholder="Search surf spots..."
                  />
                )}
              </Box>
            </Grid>
          </Grid>
        </Item>

      </Container>
    </>
  );
};

export default DashboardHome; 