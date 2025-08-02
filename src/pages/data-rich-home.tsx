import { Box, Container, Grid, Stack, Typography, Card, CardContent, Button, Chip } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { getLocations, getSurfSpots, getBatchForecast } from "@features/locations/api/locations";
import { Item, SEO, EnhancedSelect } from "components";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { getGeolocation } from "utils/geolocation";
import { useFavorites } from "../providers/favorites-provider";
import { FavoritesList } from "../components/favorites/favorites-list";
import { orderBy } from "lodash";

const DataRichHome = () => {
  const navigate = useNavigate();
  const { favorites } = useFavorites();
  
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

  // Get regional conditions summary
  const getRegionalConditions = () => {
    return [
      { region: 'California', conditions: '3-5ft', quality: 'Clean', color: 'success' },
      { region: 'Oregon', conditions: '8-12ft', quality: 'Windy', color: 'warning' },
      { region: 'Hawaii', conditions: '2-4ft', quality: 'Clean', color: 'success' },
      { region: 'Florida', conditions: '1-3ft', quality: 'Small', color: 'info' },
    ];
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
              Comprehensive surf data and regional insights
            </Typography>
          </Box>
        </Item>

        {/* Regional Overview */}
        <Item sx={{ bgcolor: 'background.default', marginBottom: "20px", p: 3 }}>
          <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
            Regional Overview
          </Typography>
          <Box sx={{ 
            height: { xs: "200px", sm: "300px" }, 
            backgroundColor: "#f5f5f5", 
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 2
          }}>
            <Typography variant="body1" color="text.secondary">
              Interactive map showing conditions by region
            </Typography>
          </Box>
          <Grid container spacing={2}>
            {getRegionalConditions().map((region) => (
              <Grid item xs={12} sm={6} md={3} key={region.region}>
                <Card sx={{ height: "100%" }}>
                  <CardContent>
                    <Typography variant="h6" component="div" sx={{ fontWeight: "bold", mb: 1 }}>
                      {region.region}
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ fontWeight: "bold", color: "primary.main", mb: 1 }}>
                      {region.conditions}
                    </Typography>
                    <Chip 
                      label={region.quality} 
                      color={region.color as any}
                      size="small"
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Item>

        {/* Conditions Summary */}
        <Item sx={{ bgcolor: 'background.default', marginBottom: "20px", p: 3 }}>
          <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
            Conditions Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="div" sx={{ fontWeight: "bold", mb: 2 }}>
                    Current Swell
                  </Typography>
                  <Stack spacing={1}>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography>Primary Swell</Typography>
                      <Typography variant="body2" color="text.secondary">SW 3-5ft @ 12s</Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography>Secondary Swell</Typography>
                      <Typography variant="body2" color="text.secondary">W 2-3ft @ 8s</Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography>Wind</Typography>
                      <Typography variant="body2" color="text.secondary">NW 5-8mph</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="div" sx={{ fontWeight: "bold", mb: 2 }}>
                    Tide Information
                  </Typography>
                  <Stack spacing={1}>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography>Current Tide</Typography>
                      <Typography variant="body2" color="text.secondary">3.2ft (Rising)</Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography>High Tide</Typography>
                      <Typography variant="body2" color="text.secondary">5.8ft @ 2:30 PM</Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography>Low Tide</Typography>
                      <Typography variant="body2" color="text.secondary">0.5ft @ 8:45 AM</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
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

        {/* Quick Tools */}
        <Item sx={{ bgcolor: 'background.default', marginTop: "20px", p: 3 }}>
          <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
            Quick Tools
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Button 
                variant="contained" 
                size="large"
                fullWidth
                onClick={() => navigate('/spots')}
                sx={{ height: "60px" }}
              >
                Spot Search
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Button 
                variant="outlined" 
                size="large"
                fullWidth
                onClick={() => navigate('/map')}
                sx={{ height: "60px" }}
              >
                Buoy Data
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Button 
                variant="outlined" 
                size="large"
                fullWidth
                onClick={() => navigate('/spots')}
                sx={{ height: "60px" }}
              >
                Forecast
              </Button>
            </Grid>
          </Grid>
        </Item>

      </Container>
    </>
  );
};

export default DataRichHome; 