import { Box, Container, Grid, Stack, Typography, Card, CardContent, Button, Chip, LinearProgress, Tooltip } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { getLocations, getSurfSpots, getBatchForecast, getSurfSpotClosest } from "@features/locations/api/locations";
// import { Spot } from "@features/locations/types";
import { Item, SEO, EnhancedSelect } from "components";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { getGeolocation } from "utils/geolocation";
// import SpotGlance from "@features/locations/spot-glance";
import { useFavorites } from "../providers/favorites-provider";
import { FavoritesList } from "../components/favorites/favorites-list";
import { orderBy } from "lodash";
import { useEffect, useState } from "react";
import { trackPageView, trackInteraction } from "utils/analytics";
import { getHomePageVariation } from "utils/ab-testing";
import { getEnhancedConditionScore, getWaveHeightColor, getWindColor, getConditionDescription } from "utils/conditions";
import { FEATURED_SPOTS } from "utils/constants";
import { getForecastCurrent } from "@features/forecasts";

const DashboardHome = () => {
  const navigate = useNavigate();
  const { favorites } = useFavorites();
  const variation = getHomePageVariation();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  
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

  // Get featured spots from existing spots data
  const featuredSpots = spots ? spots.filter(spot => 
    FEATURED_SPOTS.includes(spot.slug)
  ) : [];
  
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
        // Handle spots near me
        break;
    }
  };

  // Helper function to get best conditions
  const getBestConditions = () => {
    // TODO: Implement logic to find best current conditions
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
            backgroundColor: "#1ed6e6", 
            background: "linear-gradient(135deg, #1ed6e6 0%, #0ea5e9 100%)",
            height: { xs: "120px", sm: "140px" },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            px: { xs: 2, sm: 3, md: 4 }
          }}>
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
                  onClick={() => goToSpotPage('1')} // TODO: Use actual spot ID
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6" color="primary" gutterBottom>
                        Best Right Now
                      </Typography>
                      <Chip 
                        label={getBestConditions().score.label}
                        color={getBestConditions().score.color}
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Box>
                    <Typography variant="h4" component="div" sx={{ fontWeight: "bold", mb: 1 }}>
                      {getBestConditions().spot}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                      {getBestConditions().waveHeight} • {getBestConditions().conditions}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {getBestConditions().direction} swell
                    </Typography>
                    
                    {/* Progress bars for conditions */}
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Wave Height
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {getBestConditions().waveHeightValue}ft
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={getWaveHeightPercentage(getBestConditions().waveHeightValue)}
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          backgroundColor: 'rgba(0,0,0,0.1)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: getWaveHeightColor(getBestConditions().waveHeightValue) === 'success' ? '#4caf50' : 
                                           getWaveHeightColor(getBestConditions().waveHeightValue) === 'warning' ? '#ff9800' : '#f44336'
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
                          {getBestConditions().windSpeedValue}mph
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={getWindSpeedPercentage(getBestConditions().windSpeedValue)}
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          backgroundColor: 'rgba(0,0,0,0.1)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: getWindColor(getBestConditions().windSpeedValue) === 'success' ? '#4caf50' : 
                                           getWindColor(getBestConditions().windSpeedValue) === 'warning' ? '#ff9800' : '#f44336'
                          }
                        }}
                      />
                    </Box>
                    
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      {getBestConditions().score.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Tooltip>
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
                  onClick={() => goToSpotPage('3')} // TODO: Use actual spot ID
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6" color="primary" gutterBottom>
                        Cleanest Conditions
                      </Typography>
                      <Chip 
                        label="Good"
                        color="success"
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Box>
                    <Typography variant="h4" component="div" sx={{ fontWeight: "bold", mb: 1 }}>
                      Pleasure Point
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                      3-4ft • Glassy
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Perfect for all levels
                    </Typography>
                    
                    {/* Progress bars for conditions */}
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Wave Height
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          3.5ft
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={getWaveHeightPercentage(3.5)}
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          backgroundColor: 'rgba(0,0,0,0.1)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: '#4caf50'
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
                          5mph
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={getWindSpeedPercentage(5)}
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          backgroundColor: 'rgba(0,0,0,0.1)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: '#4caf50'
                          }
                        }}
                      />
                    </Box>
                    
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      Solid conditions
                    </Typography>
                  </CardContent>
                </Card>
              </Tooltip>
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
            <Grid item xs={12} sm={6} md={4}>
              <Tooltip title="View detailed wind forecast" arrow>
                <Card 
                  sx={{ 
                    height: "100%", 
                    bgcolor: hoveredCard === 'wind' ? 'rgba(30, 214, 230, 0.05)' : 'background.default',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    '&:hover': {
                      bgcolor: 'rgba(30, 214, 230, 0.05)',
                    }
                  }}
                  onMouseEnter={() => setHoveredCard('wind')}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6" color="primary" gutterBottom>
                        Wind Conditions
                      </Typography>
                      <Chip 
                        label="Light"
                        color={getWindColor(8)}
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Box>
                    <Typography variant="h4" component="div" sx={{ fontWeight: "bold", mb: 1 }}>
                      Light
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                      5-8 mph • Offshore
                    </Typography>
                    
                    {/* Progress bar for wind speed */}
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Wind Speed
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          6.5mph avg
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={getWindSpeedPercentage(6.5)}
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          backgroundColor: 'rgba(0,0,0,0.1)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: '#4caf50'
                          }
                        }}
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary">
                      Ideal for clean waves
                    </Typography>
                  </CardContent>
                </Card>
              </Tooltip>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Tooltip title="View tide schedule" arrow>
                <Card 
                  sx={{ 
                    height: "100%", 
                    bgcolor: hoveredCard === 'tide' ? 'rgba(30, 214, 230, 0.05)' : 'background.default',
                    cursor: 'pointer',
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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6" color="primary" gutterBottom>
                        Tide Status
                      </Typography>
                      <Chip 
                        label="Rising"
                        color="info"
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Box>
                    <Typography variant="h4" component="div" sx={{ fontWeight: "bold", mb: 1 }}>
                      Rising
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                      3.2ft • +0.5ft/hr
                    </Typography>
                    
                    {/* Progress bar for tide level */}
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Current Level
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          3.2ft
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={65} // 3.2ft out of ~5ft max
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
                      High tide in 2.5 hours
                    </Typography>
                  </CardContent>
                </Card>
              </Tooltip>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Tooltip title="View big wave spots" arrow>
                <Card 
                  sx={{ 
                    height: "100%", 
                    bgcolor: hoveredCard === 'waves' ? 'rgba(30, 214, 230, 0.05)' : 'background.default',
                    cursor: 'pointer',
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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6" color="primary" gutterBottom>
                        Highest Waves
                      </Typography>
                      <Chip 
                        label="Big"
                        color={getWaveHeightColor(9)}
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Box>
                    <Typography variant="h4" component="div" sx={{ fontWeight: "bold", mb: 1 }}>
                      8-10ft
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                      Mavericks • Big wave alert
                    </Typography>
                    
                    {/* Progress bar for wave height */}
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Wave Height
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          9ft
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={getWaveHeightPercentage(9)}
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          backgroundColor: 'rgba(0,0,0,0.1)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: '#f44336'
                          }
                        }}
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary">
                      Experienced surfers only
                    </Typography>
                  </CardContent>
                </Card>
              </Tooltip>
            </Grid>
          </Grid>
        </Item>

        {/* Quick Actions */}
        <Item sx={{ bgcolor: 'background.default', marginBottom: "20px", p: 3 }}>
          <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
            Quick Actions
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button 
              variant="contained" 
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