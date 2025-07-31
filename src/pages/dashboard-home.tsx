import { Box, Container, Grid, Stack, Typography, Card, CardContent, Button } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { getLocations, getSurfSpots, getBatchForecast } from "@features/locations/api/locations";
// import { Spot } from "@features/locations/types";
import { Item, SEO, EnhancedSelect } from "components";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { getGeolocation } from "utils/geolocation";
// import SpotGlance from "@features/locations/spot-glance";
import { useFavorites } from "../providers/favorites-provider";
import { FavoritesList } from "../components/favorites/favorites-list";
import { orderBy } from "lodash";

const DashboardHome = () => {
  const navigate = useNavigate();
  const { favorites } = useFavorites();
  
  // Data queries - Updated to React Query v5 object syntax
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

  // Helper function to get best conditions
  const getBestConditions = () => {
    // TODO: Implement logic to find best current conditions
    // This could be based on wave height, wind, tide, etc.
    return {
      spot: "Steamer Lane",
      waveHeight: "4-6ft",
      conditions: "Clean",
      direction: "SW"
    };
  };

  // Helper function to get closest spot
  const getClosestSpot = () => {
    // TODO: Implement logic to find closest spot to user
    return {
      spot: "Pleasure Point",
      distance: "2.3 miles",
      waveHeight: "3-4ft"
    };
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

        {/* Current Conditions Grid */}
        <Grid container spacing={2} sx={{ marginBottom: "20px" }}>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: "100%", bgcolor: 'background.default' }}>
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>
                  Best Right Now
                </Typography>
                <Typography variant="h4" component="div" sx={{ fontWeight: "bold" }}>
                  {getBestConditions().spot}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {getBestConditions().waveHeight} • {getBestConditions().conditions}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {getBestConditions().direction} swell
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: "100%", bgcolor: 'background.default' }}>
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>
                  Closest to You
                </Typography>
                <Typography variant="h4" component="div" sx={{ fontWeight: "bold" }}>
                  {getClosestSpot().spot}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {getClosestSpot().waveHeight} • {getClosestSpot().distance}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {geolocation ? "Based on your location" : "Enable location for personalized results"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: "100%", bgcolor: 'background.default' }}>
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>
                  Wind Conditions
                </Typography>
                <Typography variant="h4" component="div" sx={{ fontWeight: "bold" }}>
                  Light
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  5-8 mph • Offshore
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ideal for clean waves
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: "100%", bgcolor: 'background.default' }}>
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>
                  Tide Status
                </Typography>
                <Typography variant="h4" component="div" sx={{ fontWeight: "bold" }}>
                  Rising
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  3.2ft • +0.5ft/hr
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  High tide in 2.5 hours
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: "100%", bgcolor: 'background.default' }}>
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>
                  Highest Waves
                </Typography>
                <Typography variant="h4" component="div" sx={{ fontWeight: "bold" }}>
                  8-10ft
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Mavericks • Big wave alert
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Experienced surfers only
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: "100%", bgcolor: 'background.default' }}>
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>
                  Cleanest Conditions
                </Typography>
                <Typography variant="h4" component="div" sx={{ fontWeight: "bold" }}>
                  Pleasure Point
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  3-4ft • Glassy
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Perfect for all levels
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Item sx={{ bgcolor: 'background.default', marginBottom: "20px", p: 3 }}>
          <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
            Quick Actions
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button 
              variant="contained" 
              size="large"
              onClick={() => navigate('/map')}
              sx={{ flex: 1 }}
            >
              View Map
            </Button>
            <Button 
              variant="outlined" 
              size="large"
              onClick={() => navigate('/spots')}
              sx={{ flex: 1 }}
            >
              Browse All Spots
            </Button>
            {geolocation && (
              <Button 
                variant="outlined" 
                size="large"
                sx={{ flex: 1 }}
              >
                Spots Near Me
              </Button>
            )}
          </Stack>
        </Item>

        {/* My Lineup (Favorites) */}
        <FavoritesList 
          favorites={favorites}
          currentData={favoritesData}
          isLoading={favoritesLoading}
        />

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