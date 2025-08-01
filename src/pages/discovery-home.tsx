import { Box, Container, Grid, Stack, Typography, Card, CardContent, Button } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { getLocations, getSurfSpots, getBatchForecast } from "@features/locations/api/locations";
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

const DiscoveryHome = () => {
  const navigate = useNavigate();
  const { favorites } = useFavorites();
  const variation = getHomePageVariation();
  
  // Track page view on mount
  useEffect(() => {
    trackPageView(variation, 'discovery-home');
  }, [variation]);
  
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
        // Handle spots near me
        break;
    }
  };

  // Get trending spots (spots with good conditions)
  const getTrendingSpots = () => {
    // TODO: Implement logic to find trending spots
    // This could be based on wave height, wind, tide, etc.
    return spots?.slice(0, 6) || [];
  };

  // Get spots near user's location
  const getNearbySpots = () => {
    // TODO: Implement logic to find nearby spots
    return spots?.slice(0, 4) || [];
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
        </Item>

        {/* Location-Based Discovery */}
        <Item sx={{ bgcolor: 'background.default', marginBottom: "20px", p: 3 }}>
          <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
            {geolocation ? `Spots near you` : 'Popular spots'}
          </Typography>
          <Grid container spacing={2}>
            {getNearbySpots().map((spot) => (
              <Grid item xs={12} sm={6} md={3} key={spot.id}>
                <Card sx={{ height: "100%", cursor: "pointer" }} onClick={() => goToSpotPage(spot.id.toString())}>
                  <CardContent>
                    <Typography variant="h6" component="div" sx={{ fontWeight: "bold" }}>
                      {spot.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {spot.subregion_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {spot.latitude.toFixed(2)}, {spot.longitude.toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Item>

        {/* Trending Spots */}
        <Item sx={{ bgcolor: 'background.default', marginBottom: "20px", p: 3 }}>
          <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
            What's firing right now
          </Typography>
          <Grid container spacing={2}>
            {getTrendingSpots().map((spot) => (
              <Grid item xs={12} sm={6} md={4} key={spot.id}>
                <Card sx={{ height: "100%", cursor: "pointer" }} onClick={() => goToSpotPage(spot.id.toString())}>
                  <CardContent>
                    <Typography variant="h6" component="div" sx={{ fontWeight: "bold" }}>
                      {spot.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {spot.subregion_name}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1, fontWeight: "bold", color: "primary.main" }}>
                      3-5ft • Clean
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      SW swell • Light wind
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
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