import { Box, Container, Grid, Stack, Typography, Card, CardContent, Button, Chip } from "@mui/material";
import manresaImage from "assets/manresa1.jpg";
import { useQuery } from "@tanstack/react-query";
import { getLocations, getSurfSpots, getBatchForecast, getSurfSpotClosest } from "@features/locations/api/locations";
import { getEnhancedConditionScore, calculateOverallScore, getSwellPeriodScore, getWindQualityScore, getWaveHeightScore } from "utils/conditions";
import { Item, SEO, EnhancedSelect } from "components";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { getGeolocation } from "utils/geolocation";
import { useFavorites } from "../providers/favorites-provider";
import { FavoritesList } from "../components/favorites/favorites-list";
import { orderBy } from "lodash";
import { useEffect } from "react";
import { trackPageView, trackInteraction } from "utils/analytics";
import { getHomePageVariation } from "utils/ab-testing";
import { formatDistance } from "utils/common";
import { formatDirection } from "utils/formatting";

const DiscoveryHome = () => {
  const navigate = useNavigate();
  const { favorites } = useFavorites();
  const variation = getHomePageVariation();
  
  // Track page view on mount
  // useEffect(() => {
  //   trackPageView(variation, 'discovery-home');
  // }, [variation]);
  
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
  
  // Get nearby spots using API's distance calculation
  const {data: nearbySpots, isPending: nearbySpotsLoading} = useQuery({
    queryKey: ['nearby_spots', geolocation?.latitude, geolocation?.longitude],
    queryFn: () => getSurfSpotClosest(geolocation!.latitude, geolocation!.longitude),
    enabled: !!geolocation?.latitude && !!geolocation?.longitude,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
  
  // Filter to reasonable distance and limit results
  const nearbySpotsForForecast = nearbySpots
    ?.filter(spot => spot.distance && spot.distance <= 50)
    .slice(0, 4) || [];
  
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

  // Fetch current conditions for nearby spots
  const {data: nearbySpotsData, isPending: nearbySpotsDataLoading} = useQuery({
    queryKey: ['nearby-spots-batch-data', nearbySpotsForForecast.map(s => s.id).join(',')],
    queryFn: () => {
      if (nearbySpotsForForecast.length === 0) return { spots: [] };
      
      const spotIds = nearbySpotsForForecast.map(spot => spot.id);
      
      return getBatchForecast({
        spot_ids: spotIds,
      });
    },
    enabled: nearbySpotsForForecast.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch current conditions for trending spots
  const {data: trendingSpotsData} = useQuery({
    queryKey: ['trending-spots-batch-data'],
    queryFn: () => {
      if (!spots || spots.length === 0) return { spots: [] };
      
      // Fetch conditions for first 20 spots, we'll filter to top 10 with data
      const spotIds = spots.slice(0, 20).map(spot => spot.id);
      
      return getBatchForecast({
        spot_ids: spotIds,
      });
    },
    enabled: !!spots && spots.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
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
      case 'spots':
        navigate('/spots');
        break;
      case 'map':
        navigate('/map');
        break;
      case 'near_me':
        navigate('/nearby-spots');
        break;
    }
  };

  // Get trending spots with condition scoring
  const getTrendingSpots = () => {
    if (!trendingSpotsData?.spots) return [];
    
    return trendingSpotsData.spots
      .filter(spot => spot.weather?.swell) // Only spots with swell data
      .map(spot => {
        const swell = spot.weather.swell!; // We know it exists due to filter
        const score = getEnhancedConditionScore({
          swellPeriod: swell.period,
          windSpeed: spot.weather.wind?.speed,
          waveHeight: swell.height
        });
        
        // Calculate overall score for sorting
        const overallScore = calculateOverallScore({
          swellPeriod: getSwellPeriodScore(swell.period),
          windQuality: getWindQualityScore(spot.weather.wind?.speed || 0),
          waveHeight: getWaveHeightScore(swell.height)
        });
        
        return {
          ...spot,
          score,
          overallScore
        };
      })
      .sort((a, b) => b.overallScore - a.overallScore) // Best conditions first
      .slice(0, 8); // Max 8 spots
  };

  return (
    <>
      <SEO 
        title="Surfe Diem - Discover Your Next Session"
        description="Find new surf spots and discover where the waves are firing. Explore surf conditions and plan your next session."
        keywords="surf spots, discover surf, surf conditions, find waves, surf discovery, trending surf spots"
        url="https://surfe-diem.com"
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Surfe Diem",
            "description": "Discover surf spots and find your next session",
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
                Discover Your Next Session
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
                Find new spots and see what's firing right now
              </Typography>
            </Box>
          </Box>
        </Item>

        {/* Location-Based Discovery */}
        <Item sx={{ bgcolor: 'background.default', marginBottom: "20px", p: 3 }}>
          <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
            {geolocation ? `Spots near you` : 'Popular spots'}
          </Typography>
          <Grid container spacing={2}>
            {nearbySpotsForForecast.map((spot) => {
              // Find current conditions for this spot
              const spotData = nearbySpotsData?.spots?.find(s => s.id === spot.id);
              const currentConditions = spotData?.weather?.swell;
              
              return (
                <Grid item xs={12} sm={6} md={3} key={spot.id}>
                  <Card sx={{ height: "100%", cursor: "pointer" }} onClick={() => goToSpotPage(spot.id.toString())}>
                    <CardContent>
                      <Typography variant="h6" component="div" sx={{ fontWeight: "bold" }}>
                        {spot.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {spot.subregion_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {spot.distance ? `${formatDistance(spot.distance)} away` : 'Distance unknown'}
                      </Typography>
                      {currentConditions ? (
                        <Typography variant="h6" sx={{ fontWeight: "bold", color: "primary.main" }}>
                          {currentConditions.height.toFixed(1)}ft • {currentConditions.period.toFixed(0)}s • {formatDirection(currentConditions.direction)}
                        </Typography>
                      ) : nearbySpotsLoading || nearbySpotsDataLoading ? (
                        <Typography variant="body2" color="text.secondary">
                          Loading conditions...
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No current data
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Item>

        {/* Trending Spots */}
        <Item sx={{ bgcolor: 'background.default', marginBottom: "20px", p: 3 }}>
          <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
            What's firing right now
          </Typography>
          <Grid container spacing={2}>
            {getTrendingSpots().map((spot) => {
              const swell = spot.weather.swell!;
              return (
                <Grid item xs={12} sm={6} md={3} key={spot.id}>
                  <Card sx={{ height: "100%", cursor: "pointer" }} onClick={() => goToSpotPage(spot.id.toString())}>
                    <CardContent>
                      <Typography variant="h6" component="div" sx={{ fontWeight: "bold" }}>
                        {spot.name}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: "bold", color: "primary.main" }}>
                        {swell.height.toFixed(1)}ft • {swell.period.toFixed(0)}s • {formatDirection(swell.direction)}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip 
                          label={`${spot.score.label} (${spot.overallScore}/100)`}
                          color={spot.score.color}
                          size="small"
                          sx={{ fontWeight: 'bold' }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Item>

        {/* Search & Explore */}
        <Item sx={{ bgcolor: 'background.default', marginBottom: "20px", p: 3 }}>
          <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
            Search & Explore
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button 
              variant="contained" 
              size="large"
              onClick={() => handleQuickAction('spots')}
              sx={{ flex: 1 }}
            >
              Browse All Spots
            </Button>
            <Button 
              variant="outlined" 
              size="large"
              onClick={() => handleQuickAction('map')}
              sx={{ flex: 1 }}
            >
              View Map
            </Button>
            {geolocation && (
              <Button 
                variant="outlined" 
                size="large"
                onClick={() => handleQuickAction('near_me')}
                sx={{ flex: 1 }}
              >
                Spots Near Me
              </Button>
            )}
          </Stack>
        </Item>

        {/* My Saved Spots */}
        <Box sx={{ marginBottom: "20px" }}>
          <FavoritesList 
            favorites={favorites}
            currentData={favoritesData}
            isLoading={favoritesLoading}
          />
        </Box>

        {/* Search Sections */}
        <Item sx={{ bgcolor: 'background.default', marginTop: "20px" }}>
          <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
            Quick Search
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

export default DiscoveryHome; 