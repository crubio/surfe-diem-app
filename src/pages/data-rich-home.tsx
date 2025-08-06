import { Box, Container, Grid, Stack, Typography, Card, CardContent, Button, Chip, LinearProgress, ToggleButtonGroup, ToggleButton } from "@mui/material";
import manresaImage from "assets/manresa1.jpg";
import { useQuery } from "@tanstack/react-query";
import { getLocations, getSurfSpots, getBatchForecast, getSurfSpotClosest } from "@features/locations/api/locations";
import { getEnhancedConditionScore, getBatchRecommendationsFromAPI } from "utils/conditions";
import { Item, SEO, EnhancedSelect } from "components";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { getGeolocation } from "utils/geolocation";
import { useFavorites } from "../providers/favorites-provider";
import { FavoritesList } from "../components/favorites/favorites-list";
import { orderBy } from "lodash";
import { useState } from "react";
import { trackInteraction } from "utils/analytics";
import { getHomePageVariation } from "utils/ab-testing";
import { formatDirection } from "utils/formatting";

const DataRichHome = () => {
  const navigate = useNavigate();
  const { favorites } = useFavorites();
  const variation = getHomePageVariation();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Data queries
  const {data: buoys} = useQuery({
    queryKey: ['locations'],
    queryFn: async () => getLocations()
  });
  
  const {data: spots} = useQuery({
    queryKey: ['spots'],
    queryFn: async () => getSurfSpots()
  });
  
  const {data: geolocation} = useQuery({
    queryKey: ['geolocation'],
    queryFn: async () => getGeolocation()
  });

  // Get nearby spots for location-based features
  const {data: nearbySpots} = useQuery({
    queryKey: ['nearby_spots', geolocation?.latitude, geolocation?.longitude],
    queryFn: () => getSurfSpotClosest(geolocation!.latitude, geolocation!.longitude),
    enabled: !!geolocation?.latitude && !!geolocation?.longitude,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Get comprehensive batch recommendations
  const {data: batchRecommendations, isPending: recommendationsLoading} = useQuery({
    queryKey: ['batch_recommendations_data_rich'],
    queryFn: () => getBatchRecommendationsFromAPI([]),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Get batch forecast data for nearby and popular spots
  const {data: batchForecastData, isPending: batchForecastLoading} = useQuery({
    queryKey: ['batch_forecast_data_rich', nearbySpots?.slice(0, 3).map(s => s.id).join(','), spots?.slice(0, 9).map(s => s.id).join(',')],
    queryFn: () => {
      const spotIds = [];
      
      // Add nearby spots
      if (nearbySpots && nearbySpots.length > 0) {
        spotIds.push(...nearbySpots.slice(0, 3).map(s => s.id));
      }
      
      // Add popular spots to fill remaining slots
      const remainingSlots = 12 - (batchRecommendations ? 3 : 0) - (nearbySpots ? Math.min(nearbySpots.length, 3) : 0);
      if (remainingSlots > 0 && spots) {
        spotIds.push(...spots.slice(0, remainingSlots).map(s => s.id));
      }
      
      return getBatchForecast({ spot_ids: spotIds });
    },
    enabled: (!!nearbySpots || !!spots) && !recommendationsLoading,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Extract recommendations
  const bestConditions = batchRecommendations?.bestConditions || null;
  const cleanestConditions = batchRecommendations?.cleanestConditions || null;
  const highestWaves = batchRecommendations?.highestWaves || null;
  
  // Fetch current data for favorites
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
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Navigation functions
  const goToBuoyPage = (location_id: string) => {
    navigate(`/location/${location_id}`);
  };

  const goToSpotPage = (spot_id: string) => {
    const spot = spots?.find(s => s.id.toString() === spot_id);
    if (spot?.slug) {
      navigate(`/spot/${spot.slug}`);
    } else {
      navigate(`/spot/${spot_id}`);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'spots':
        navigate('/spots');
        break;
      case 'map':
        navigate('/map');
        break;
      case 'nearby':
        navigate('/nearby-spots');
        break;
    }
  };



  // Get comprehensive spot data for display
  const getComprehensiveSpotData = () => {
    const allSpots = [];
    
    // Add recommendations (these have real forecast data)
    if (bestConditions) allSpots.push({ ...bestConditions, category: 'Best Conditions', id: bestConditions.spotId });
    if (cleanestConditions) allSpots.push({ ...cleanestConditions, category: 'Cleanest', id: cleanestConditions.spotId });
    if (highestWaves) allSpots.push({ ...highestWaves, category: 'Biggest Waves', id: highestWaves.spotId });
    
    // Add nearby spots if available (these need forecast data)
    if (nearbySpots && nearbySpots.length > 0) {
      nearbySpots.slice(0, 3).forEach(spot => {
        allSpots.push({ 
          ...spot, 
          category: 'Near You',
          spot: spot.name,
          // These will be populated by the batch forecast query below
          waveHeight: null,
          swellDirection: null,
          swellPeriod: null,
          score: null
        });
      });
    }
    
    // Add popular spots to fill remaining slots (these need forecast data)
    const remainingSlots = 12 - allSpots.length;
    if (remainingSlots > 0 && spots) {
      spots.slice(0, remainingSlots).forEach(spot => {
        allSpots.push({ 
          ...spot, 
          category: 'Popular', 
          spot: spot.name,
          // These will be populated by the batch forecast query below
          waveHeight: null,
          swellDirection: null,
          swellPeriod: null,
          score: null
        });
      });
    }
    
    // Merge batch forecast data if available
    if (batchForecastData?.spots) {
      allSpots.forEach(spot => {
        const forecastSpot = batchForecastData.spots?.find(fs => fs.id === spot.id);
        if (forecastSpot?.weather?.swell) {
          const swell = forecastSpot.weather.swell;
          spot.waveHeight = `${swell.height.toFixed(1)}ft`;
          spot.direction = formatDirection(swell.direction);
          spot.swellPeriod = swell.period;
          // Calculate condition score
          spot.score = getEnhancedConditionScore({
            swellPeriod: swell.period,
            waveHeight: swell.height,
            windSpeed: 0 // We don't have wind data from this API
          });
        }
      });
    }
    
    // Filter out spots with no meaningful data
    const spotsWithData = allSpots.filter(spot => {
      // Recommendation spots always have data
      if (spot.category === 'Best Conditions' || spot.category === 'Cleanest' || spot.category === 'Biggest Waves') {
        return true;
      }
      
      // For nearby and popular spots, check if we have at least wave height data
      return spot.waveHeight && spot.waveHeight !== 'N/A';
    });
    
    return spotsWithData.slice(0, 12);
  };

  const getConditionScore = (spot: any) => {
    if (!spot.score) return null;
    return spot.score;
  };

  const getWaveHeight = (spot: any) => {
    if (!spot.waveHeight) return 'N/A';
    return spot.waveHeight;
  };

  const getWindDirection = (spot: any) => {
    if (!spot.direction) return 'N/A';
    return spot.direction;
  };

  const getSwellPeriod = (spot: any) => {
    if (!spot.swellPeriod) return 'N/A';
    return `${spot.swellPeriod}s`;
  };

  return (
    <>
      <SEO 
        title="Surfe Diem - Surf Intelligence"
        description="Comprehensive surf intelligence and regional conditions. Get detailed surf data and regional overviews."
        keywords="surf intelligence, regional surf conditions, surf data, comprehensive surf report, surf overview"
        url="https://surfe-diem.com"
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Surfe Diem",
            "description": "Comprehensive surf intelligence and data",
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
                Surf Intelligence
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
                Comprehensive surf data and analysis
              </Typography>
            </Box>
          </Box>
        </Item>

        {/* Search and Controls */}
        <Item sx={{ bgcolor: 'background.default', marginBottom: "20px", p: 3 }}>
          <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
            Search & Explore
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
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
          
          {/* View Controls */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              All Conditions
            </Typography>
            <Stack direction="row" spacing={1}>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(e, newMode) => newMode && setViewMode(newMode)}
                size="small"
              >
                <ToggleButton value="grid">Grid</ToggleButton>
                <ToggleButton value="list">List</ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          </Box>
        </Item>

                  {/* Comprehensive Data Grid/List */}
          <Item sx={{ bgcolor: 'background.default', marginBottom: "20px", p: 3 }}>
            {recommendationsLoading || batchForecastLoading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <LinearProgress sx={{ mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  Loading comprehensive surf data...
                </Typography>
              </Box>
            ) : viewMode === 'grid' ? (
              // Grid View
              <Grid container spacing={2}>
                {getComprehensiveSpotData().map((spot) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={spot.id}>
                    <Card 
                      sx={{ 
                        height: "100%", 
                        cursor: "pointer",
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        }
                      }} 
                      onClick={() => goToSpotPage(spot.id.toString())}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="h6" component="div" sx={{ fontWeight: "bold", flex: 1 }}>
                            {spot.spot}
                          </Typography>
                          {spot.category && (
                            <Chip 
                              label={spot.category} 
                              size="small" 
                              color="primary" 
                              variant="outlined"
                            />
                          )}
                        </Box>
                        
                        <Typography variant="h4" component="div" sx={{ fontWeight: "bold", color: "primary.main", mb: 1 }}>
                          {getWaveHeight(spot)}
                        </Typography>
                        
                        <Stack spacing={0.5}>
                          <Typography variant="body2" color="text.secondary">
                            Wind: {getWindDirection(spot)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Period: {getSwellPeriod(spot)}
                          </Typography>
                          {spot.distance && (
                            <Typography variant="body2" color="text.secondary">
                              {typeof spot.distance === 'number' ? `${(spot.distance as number).toFixed(1)} miles away` : `${spot.distance} away`}
                            </Typography>
                          )}
                        </Stack>
                        
                        {/* Condition Score Badge */}
                        {getConditionScore(spot) && (
                          <Box sx={{ mt: 1 }}>
                            <Chip 
                              label={getConditionScore(spot)?.label}
                              variant="outlined"
                              size="small"
                              sx={{ 
                                fontWeight: 'medium',
                                borderColor: `${getConditionScore(spot)?.color}.main`,
                                color: `${getConditionScore(spot)?.color}.main`,
                                '&:hover': {
                                  borderColor: `${getConditionScore(spot)?.color}.main`,
                                  backgroundColor: `${getConditionScore(spot)?.color}.main`,
                                  color: 'white'
                                }
                              }}
                            />
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              // List View
              <Stack spacing={1}>
                {getComprehensiveSpotData().map((spot) => (
                  <Card 
                    key={spot.id}
                    sx={{ 
                      cursor: "pointer",
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      }
                    }} 
                    onClick={() => goToSpotPage(spot.id.toString())}
                  >
                    <CardContent sx={{ py: 2, px: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        {/* Left side - Spot info */}
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                            <Typography variant="h6" component="div" sx={{ fontWeight: "bold" }}>
                              {spot.spot}
                            </Typography>
                            {spot.category && (
                              <Chip 
                                label={spot.category} 
                                size="small" 
                                color="primary" 
                                variant="outlined"
                              />
                            )}
                            {getConditionScore(spot) && (
                              <Chip 
                                label={getConditionScore(spot)?.label}
                                variant="outlined"
                                size="small"
                                sx={{ 
                                  fontWeight: 'medium',
                                  borderColor: `${getConditionScore(spot)?.color}.main`,
                                  color: `${getConditionScore(spot)?.color}.main`,
                                  '&:hover': {
                                    borderColor: `${getConditionScore(spot)?.color}.main`,
                                    backgroundColor: `${getConditionScore(spot)?.color}.main`,
                                    color: 'white'
                                  }
                                }}
                              />
                            )}
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Typography variant="body2" color="text.secondary">
                              Wave: {getWaveHeight(spot)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Wind: {getWindDirection(spot)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Period: {getSwellPeriod(spot)}
                            </Typography>
                            {spot.distance && (
                              <Typography variant="body2" color="text.secondary">
                                {typeof spot.distance === 'number' ? `${(spot.distance as number).toFixed(1)} miles away` : `${spot.distance} away`}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                        
                        {/* Right side - Primary metric */}
                        <Box sx={{ textAlign: 'right', minWidth: '80px' }}>
                          <Typography variant="h5" component="div" sx={{ fontWeight: "bold", color: "primary.main" }}>
                            {getWaveHeight(spot)}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}
          </Item>

        {/* Quick Tools */}
        <Item sx={{ bgcolor: 'background.default', marginBottom: "20px", p: 3 }}>
          <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
            Quick Tools
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Button 
                variant="contained" 
                size="large"
                fullWidth
                onClick={() => handleQuickAction('spots')}
                sx={{ height: "60px" }}
              >
                Browse All Spots
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Button 
                variant="outlined" 
                size="large"
                fullWidth
                onClick={() => handleQuickAction('map')}
                sx={{ height: "60px" }}
              >
                Interactive Map
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Button 
                variant="outlined" 
                size="large"
                fullWidth
                onClick={() => handleQuickAction('nearby')}
                disabled={!geolocation}
                sx={{ height: "60px" }}
              >
                Spots Near Me
              </Button>
            </Grid>
          </Grid>
        </Item>

        {/* My Dashboard */}
        <Item sx={{ bgcolor: 'background.default', marginBottom: "20px", p: 3 }}>
          <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
            My Dashboard
          </Typography>
          <FavoritesList 
            favorites={favorites}
            currentData={favoritesData}
            isLoading={favoritesLoading}
          />
        </Item>

      </Container>
    </>
  );
};

export default DataRichHome; 