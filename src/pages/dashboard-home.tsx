import { Box, Container, Grid, Stack, Typography, Card, CardContent, Button, Chip, LinearProgress, Tooltip } from "@mui/material";
import manresaImage from "assets/manresa1.jpg";
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
import { getCurrentTideValue, getCurrentTideTime } from "utils/tides";
import { extractSwellDataFromForecast, getSwellQualityDescription, getSwellDirectionText, getSwellHeightColor, formatSwellHeight, formatSwellPeriod, getSwellHeightPercentage } from "utils/swell";
import { extractWaterTempFromForecast, getWaterTempQualityDescription, getWaterTempColor, formatWaterTemp, getWaterTempPercentage, getWaterTempComfortLevel } from "utils/water-temp";
import { TemperatureGauge, TemperatureCard } from "components";
import { FEATURED_SPOTS } from "utils/constants";
import { getForecastCurrent } from "@features/forecasts";

const DashboardHome = () => {
  const navigate = useNavigate();
  const { favorites } = useFavorites();
  const variation = getHomePageVariation();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  
  // Track page view on mount
  // useEffect(() => {
  //   trackPageView(variation, 'dashboard-home');
  // }, [variation]);
  
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
  const {data: closestSpots} = useQuery({
    queryKey: ['closest_spots', geolocation?.latitude, geolocation?.longitude],
    queryFn: () => getSurfSpotClosest(geolocation!.latitude, geolocation!.longitude),
    enabled: !!geolocation?.latitude && !!geolocation?.longitude,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const {data: closestSpotsForecast} = useQuery({
    queryKey: ['closest_spot_forecast', closestSpots?.[0]?.latitude, closestSpots?.[0]?.longitude],
    queryFn: () => getForecastCurrent({
      latitude: Number(closestSpots![0].latitude),
      longitude: Number(closestSpots![0].longitude),
    }),
    enabled: !!closestSpots && closestSpots.length > 0
  })

  // Get batch recommendations from nearby spots (optimized - single API call for all 3 cards)
  const {data: batchRecommendations, isPending: recommendationsLoading} = useQuery({
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
  const {data: closestTideStation, isPending: tideStationLoading} = useQuery({
    queryKey: ['closest_tide_station', geolocation?.latitude, geolocation?.longitude],
    queryFn: () => getClostestTideStation({
      lat: geolocation!.latitude,
      lng: geolocation!.longitude
    }),
    enabled: !!geolocation?.latitude && !!geolocation?.longitude,
  })



  // Get current tide data for the closest station
  const {data: currentTides, isPending: tidesLoading} = useQuery({
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

  const handleQuickAction = (action: string) => {
    trackInteraction(variation, 'quick_action', { action });
    switch (action) {
      case 'map':
        navigate('/map');
        break;
      case 'spots':
        navigate('/spots');
        break;
      case 'near_me':
        navigate('/nearby-spots');
        break;
    }
  };

  // Helper function to get best conditions
  const getBestConditions = () => {
    // This could be based on wave height, wind, tide, etc.
    const conditions = { waveHeight: 4, windSpeed: 8 };
    const score = getEnhancedConditionScore(conditions);
    return {
      spot: "Steamer Lane",
      waveHeight: "4-6ft",
      conditions: "Clean",
      direction: "SW",
      score,
      waveHeightValue: 4,
      windSpeedValue: 8
    };
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

  // Helper function to get wave height percentage for progress bar
  const getWaveHeightPercentage = (waveHeight: number) => {
    // Scale 0-15ft to 0-100%
    return Math.min((waveHeight / 15) * 100, 100);
  };

  // Helper function to get wind speed percentage for progress bar
  const getWindSpeedPercentage = (windSpeed: number) => {
    // Scale 0-30mph to 0-100%
    return Math.min((windSpeed / 30) * 100, 100);
  };

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
        marginTop: { xs: '10px', sm: '20px' }, 
        padding: { xs: "12px", sm: "20px" }, 
        paddingTop: { xs: "4px", sm: "4px" }
      }}>
        
        {/* Hero Section */}
        <Item sx={{ bgcolor: 'primary.dark', marginBottom: "20px" }}>
          <Box sx={{
            backgroundImage: `url(${manresaImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            height: { xs: "200px", sm: "250px", md: "300px" },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            px: { xs: 2, sm: 3, md: 4 },
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "linear-gradient(135deg, rgba(30, 214, 230, 0.4) 0%, rgba(14, 165, 233, 0.4) 100%)",
              zIndex: 1
            }
          }}>
            <Box sx={{ position: "relative", zIndex: 2 }}>
            <Typography 
              variant="h3" 
              component="div" 
              sx={{ 
                color: "white", 
                textAlign: "center", 
                fontSize: { xs: "1.75rem", sm: "2.25rem", md: "2.5rem" },
                fontWeight: "bold",
                mb: 1
              }}
            >
              What's the surf like now?
            </Typography>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                color: "white", 
                textAlign: "center",
                fontSize: { xs: "1rem", sm: "1.125rem" },
                opacity: 0.9
              }}
            >
              Real-time conditions and current forecasts
            </Typography>
            </Box>
          </Box>
        </Item>

        {/* Quick Actions */}
        <Item sx={{ bgcolor: 'background.default', marginBottom: "20px", p: 3 }}>
          <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
            Quick Actions
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button 
              variant="outlined" 
              size="large"
              onClick={() => handleQuickAction('map')}
              sx={{ 
                flex: 1,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }
              }}
            >
              View Map
            </Button>
            <Button 
              variant="outlined" 
              size="large"
              onClick={() => handleQuickAction('spots')}
              sx={{ 
                flex: 1,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }
              }}
            >
              Browse All Spots
            </Button>
            {geolocation && (
              <Button 
                variant="outlined" 
                size="large"
                onClick={() => handleQuickAction('near_me')}
                sx={{ 
                  flex: 1,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }
                }}
              >
                Spots Near Me
              </Button>
            )}
          </Stack>
        </Item>

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
            <Grid item xs={12} sm={6} md={4}>
              {!geolocation ? (
                <LocationPrompt 
                  onMouseEnter={() => setHoveredCard('best')}
                  onMouseLeave={() => setHoveredCard(null)}
                />
              ) : (
                <Tooltip title="Click to view detailed conditions" arrow>
                  <Card 
                    sx={{ 
                      height: "100%", 
                      bgcolor: hoveredCard === 'best' ? 'rgba(30, 214, 230, 0.05)' : 'background.default',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      '&:hover': {
                        bgcolor: 'rgba(30, 214, 230, 0.05)',
                      }
                    }}
                    onMouseEnter={() => setHoveredCard('best')}
                    onMouseLeave={() => setHoveredCard(null)}
                    onClick={() => {
                      if (bestConditions?.slug) {
                        navigate(`/spot/${bestConditions.slug}`);
                      }
                    }}
                  >
                    <CardContent>
                      {recommendationsLoading ? (
                        <Box sx={{ textAlign: 'center', py: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Finding best conditions...
                          </Typography>
                        </Box>
                      ) : !bestConditions ? (
                        <Box sx={{ textAlign: 'center', py: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            No conditions data available
                          </Typography>
                        </Box>
                      ) : (
                        <>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography variant="h6" color="primary" gutterBottom>
                              Best Right Now
                            </Typography>
                            <Chip 
                              label={bestConditions.score.label}
                              color={bestConditions.score.color}
                              size="small"
                              sx={{ fontWeight: 'bold' }}
                            />
                          </Box>
                          <Typography variant="h4" component="div" sx={{ fontWeight: "bold", mb: 1 }}>
                            {bestConditions.spot}
                          </Typography>
                          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                            {bestConditions.waveHeight} • {bestConditions.conditions}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {bestConditions.direction} swell
                          </Typography>
                    
                          {/* Progress bars for conditions */}
                          <Box sx={{ mt: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">
                                Wave Height
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {bestConditions.waveHeightValue?.toFixed(1)}ft
                              </Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={getWaveHeightPercentage(bestConditions.waveHeightValue || 0)}
                              sx={{ 
                                height: 6, 
                                borderRadius: 3,
                                backgroundColor: 'rgba(0,0,0,0.1)',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: getWaveHeightColor(bestConditions.waveHeightValue || 0) === 'success' ? '#4caf50' : 
                                                 getWaveHeightColor(bestConditions.waveHeightValue || 0) === 'warning' ? '#ff9800' : '#f44336'
                                }
                              }}
                            />
                          </Box>
                          
                          <Box sx={{ mt: 1.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">
                                Wind Speed
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {bestConditions.windSpeedValue?.toFixed(1)}mph
                              </Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={getWindSpeedPercentage(bestConditions.windSpeedValue || 0)}
                              sx={{ 
                                height: 6, 
                                borderRadius: 3,
                                backgroundColor: 'rgba(0,0,0,0.1)',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: getWindColor(bestConditions.windSpeedValue || 0) === 'success' ? '#4caf50' : 
                                                 getWindColor(bestConditions.windSpeedValue || 0) === 'warning' ? '#ff9800' : '#f44336'
                                }
                              }}
                            />
                          </Box>
                        
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                            {bestConditions.score.description}
                          </Typography>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Tooltip>
              )}
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Tooltip title="Click to view detailed conditions" arrow>
                <Card 
                  sx={{ 
                    height: "100%", 
                    bgcolor: hoveredCard === 'closest' ? 'rgba(30, 214, 230, 0.05)' : 'background.default',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    '&:hover': {
                      bgcolor: 'rgba(30, 214, 230, 0.05)',
                    }
                  }}
                  onMouseEnter={() => setHoveredCard('closest')}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => {
                    const closestSpotData = getClosestSpot();
                    if (closestSpotData?.slug) {
                      navigate(`/spot/${closestSpotData.slug}`);
                    } else if (closestSpotData?.spotId) {
                      navigate(`/spot/${closestSpotData.spotId}`);
                    }
                  }}
                >
                  <CardContent>
                    {(() => {
                      const closestSpotData = getClosestSpot();
                      
                      if (!closestSpotData) {
                        return (
                          <Box sx={{ textAlign: 'center', py: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Loading spot data...
                            </Typography>
                          </Box>
                        );
                      }
                      
                      return (
                        <>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography variant="h6" color="primary" gutterBottom>
                              {closestSpotData.isLocationBased ? "Closest to You" : "Featured"}
                            </Typography>
                            {closestSpotData.score && (
                              <Chip 
                                label={closestSpotData.score.label}
                                color={closestSpotData.score.color}
                                size="small"
                                sx={{ fontWeight: 'bold' }}
                              />
                            )}
                          </Box>
                          <Typography variant="h4" component="div" sx={{ fontWeight: "bold", mb: 1 }}>
                            {closestSpotData.spot}
                          </Typography>
                          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                            {closestSpotData.waveHeight ? `${closestSpotData.waveHeight}` : 'Featured SF Bay Area spot'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {closestSpotData.isLocationBased 
                              ? `${closestSpotData.distance?.toFixed(1) || ''}mi • Based on your location`
                              : "SF Bay Area • Iconic surf spot"
                            }
                          </Typography>
                    
                          {/* Progress bars for conditions - only show if we have forecast data */}
                          {closestSpotData.waveHeightValue !== undefined && (
                            <>
                              <Box sx={{ mt: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                  <Typography variant="caption" color="text.secondary">
                                    Wave Height
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {closestSpotData.waveHeightValue.toFixed(1)}ft
                                  </Typography>
                                </Box>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={getWaveHeightPercentage(closestSpotData.waveHeightValue)}
                                  sx={{ 
                                    height: 6, 
                                    borderRadius: 3,
                                    backgroundColor: 'rgba(0,0,0,0.1)',
                                    '& .MuiLinearProgress-bar': {
                                      backgroundColor: getWaveHeightColor(closestSpotData.waveHeightValue) === 'success' ? '#4caf50' : 
                                                     getWaveHeightColor(closestSpotData.waveHeightValue) === 'warning' ? '#ff9800' : '#f44336'
                                    }
                                  }}
                                />
                              </Box>
                              
                              <Box sx={{ mt: 1.5 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                  <Typography variant="caption" color="text.secondary">
                                    Wind Speed
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {closestSpotData.windSpeedValue}mph
                                  </Typography>
                                </Box>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={getWindSpeedPercentage(closestSpotData.windSpeedValue)}
                                  sx={{ 
                                    height: 6, 
                                    borderRadius: 3,
                                    backgroundColor: 'rgba(0,0,0,0.1)',
                                    '& .MuiLinearProgress-bar': {
                                      backgroundColor: getWindColor(closestSpotData.windSpeedValue) === 'success' ? '#4caf50' : 
                                                     getWindColor(closestSpotData.windSpeedValue) === 'warning' ? '#ff9800' : '#f44336'
                                    }
                                  }}
                                />
                              </Box>
                            
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                {closestSpotData.score?.description}
                              </Typography>
                            </>
                          )}
                        </>
                      );
                    })()}
                  </CardContent>
                </Card>
              </Tooltip>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              {!geolocation ? (
                <LocationPrompt 
                  onMouseEnter={() => setHoveredCard('cleanest')}
                  onMouseLeave={() => setHoveredCard(null)}
                />
              ) : (
                <Tooltip title="Click to view detailed conditions" arrow>
                  <Card 
                    sx={{ 
                      height: "100%", 
                      bgcolor: hoveredCard === 'cleanest' ? 'rgba(30, 214, 230, 0.05)' : 'background.default',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      '&:hover': {
                        bgcolor: 'rgba(30, 214, 230, 0.05)',
                      }
                    }}
                    onMouseEnter={() => setHoveredCard('cleanest')}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <CardContent>
                      {recommendationsLoading ? (
                        <Box sx={{ textAlign: 'center', py: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Finding cleanest conditions...
                          </Typography>
                        </Box>
                      ) : !cleanestConditions ? (
                        <Box sx={{ textAlign: 'center', py: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Nearby spots not great
                          </Typography>
                        </Box>
                      ) : (
                        <>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography variant="h6" color="primary" gutterBottom>
                              Cleanest Conditions
                            </Typography>
                            <Chip 
                              label={cleanestConditions.score.label}
                              color={cleanestConditions.score.color}
                              size="small"
                              sx={{ fontWeight: 'bold' }}
                            />
                          </Box>
                          <Typography variant="h4" component="div" sx={{ fontWeight: "bold", mb: 1 }}>
                            {cleanestConditions.spot}
                          </Typography>
                          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                            {cleanestConditions.waveHeight} • {cleanestConditions.conditions}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {cleanestConditions.direction} swell
                          </Typography>
                      
                          {/* Progress bars for conditions */}
                          <Box sx={{ mt: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">
                                Wave Height
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {cleanestConditions.waveHeightValue?.toFixed(1)}ft
                              </Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={getWaveHeightPercentage(cleanestConditions.waveHeightValue || 0)}
                              sx={{ 
                                height: 6, 
                                borderRadius: 3,
                                backgroundColor: 'rgba(0,0,0,0.1)',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: getWaveHeightColor(cleanestConditions.waveHeightValue || 0) === 'success' ? '#4caf50' : 
                                                 getWaveHeightColor(cleanestConditions.waveHeightValue || 0) === 'warning' ? '#ff9800' : '#f44336'
                                }
                              }}
                            />
                          </Box>
                          
                          <Box sx={{ mt: 1.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">
                                Wind Speed
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {cleanestConditions.windSpeedValue?.toFixed(1)}mph
                              </Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={getWindSpeedPercentage(cleanestConditions.windSpeedValue || 0)}
                              sx={{ 
                                height: 6, 
                                borderRadius: 3,
                                backgroundColor: 'rgba(0,0,0,0.1)',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: getWindColor(cleanestConditions.windSpeedValue || 0) === 'success' ? '#4caf50' : 
                                                 getWindColor(cleanestConditions.windSpeedValue || 0) === 'warning' ? '#ff9800' : '#f44336'
                                }
                              }}
                            />
                          </Box>
                        
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                            {cleanestConditions.score.description}
                          </Typography>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Tooltip>
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
              <Card 
                sx={{ 
                  height: "100%", 
                  bgcolor: hoveredCard === 'swell' ? 'rgba(30, 214, 230, 0.05)' : 'background.default',
                  transition: 'all 0.2s ease-in-out',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(30, 214, 230, 0.05)',
                  }
                }}
                onMouseEnter={() => setHoveredCard('swell')}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <CardContent>
                  {!currentSwellData ? (
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Loading swell data...
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" color="primary" gutterBottom>
                          Current Swell
                        </Typography>
                        <Chip 
                          label={getSwellQualityDescription(currentSwellData.period)}
                          color={getSwellHeightColor(currentSwellData.height)}
                          size="small"
                          sx={{ fontWeight: 'bold' }}
                        />
                      </Box>
                      <Typography variant="h4" component="div" sx={{ fontWeight: "bold", mb: 1 }}>
                        {formatSwellHeight(currentSwellData.height)}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                        {formatSwellPeriod(currentSwellData.period)} • {getSwellDirectionText(currentSwellData.direction)}
                      </Typography>
                      
                      {/* Progress bar for swell height */}
                      <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            Swell Height
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatSwellHeight(currentSwellData.height)}
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={getSwellHeightPercentage(currentSwellData.height)}
                          sx={{ 
                            height: 6, 
                            borderRadius: 3,
                            backgroundColor: 'rgba(0,0,0,0.1)',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: getSwellHeightColor(currentSwellData.height) === 'success' ? '#4caf50' : 
                                              getSwellHeightColor(currentSwellData.height) === 'warning' ? '#ff9800' : 
                                              getSwellHeightColor(currentSwellData.height) === 'error' ? '#f44336' : '#2196f3'
                            }
                          }}
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary">
                        {getSwellQualityDescription(currentSwellData.period)} from {getSwellDirectionText(currentSwellData.direction)}
                      </Typography>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                sx={{ 
                  height: "100%", 
                  bgcolor: hoveredCard === 'tide' ? 'rgba(30, 214, 230, 0.05)' : 'background.default',
                  transition: 'all 0.2s ease-in-out',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(30, 214, 230, 0.05)',
                  }
                }}
                onMouseEnter={() => setHoveredCard('tide')}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <CardContent>
                  {tidesLoading ? (
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Loading tide data...
                      </Typography>
                    </Box>
                  ) : !currentTideValue ? (
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        No tide data available
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" color="primary" gutterBottom>
                          Current Tide
                        </Typography>
                        <Chip 
                          label={currentTideTime || 'Now'}
                          color="info"
                          size="small"
                          sx={{ fontWeight: 'bold' }}
                        />
                      </Box>
                      <Typography variant="h4" component="div" sx={{ fontWeight: "bold", mb: 1 }}>
                        {currentTideValue.toFixed(1)}ft
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                        Current reading • {currentTideTime || 'Recent'}
                      </Typography>
                      
                      {/* Progress bar for tide level */}
                      <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            Current Level
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {currentTideValue.toFixed(1)}ft
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.min((currentTideValue / 6) * 100, 100)} // Scale 0-6ft to 0-100%
                          sx={{ 
                            height: 6, 
                            borderRadius: 3,
                            backgroundColor: 'rgba(0,0,0,0.1)',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: '#2196f3'
                            }
                          }}
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary">
                        Live tide reading
                      </Typography>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                sx={{ 
                  height: "100%", 
                  bgcolor: hoveredCard === 'water-temp' ? 'rgba(30, 214, 230, 0.05)' : 'background.default',
                  transition: 'all 0.2s ease-in-out',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(30, 214, 230, 0.05)',
                  }
                }}
                onMouseEnter={() => setHoveredCard('water-temp')}
                onMouseLeave={() => setHoveredCard(null)}
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
                  bgcolor: hoveredCard === 'waves' ? 'rgba(30, 214, 230, 0.05)' : 'background.default',
                  transition: 'all 0.2s ease-in-out',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(30, 214, 230, 0.05)',
                  }
                }}
                onMouseEnter={() => setHoveredCard('waves')}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <CardContent>
                  {recommendationsLoading ? (
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
            Search & Explore
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