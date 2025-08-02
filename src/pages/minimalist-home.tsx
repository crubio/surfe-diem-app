import { Box, Container, Grid, Stack, Typography, Card, CardContent, Button, TextField, InputAdornment } from "@mui/material";
import { Search } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { getLocations, getSurfSpots, getBatchForecast } from "@features/locations/api/locations";
import { Item, SEO, EnhancedSelect } from "components";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { getGeolocation } from "utils/geolocation";
import { useFavorites } from "../providers/favorites-provider";
import { FavoritesList } from "../components/favorites/favorites-list";
import { orderBy } from "lodash";
import { useState } from "react";

const MinimalistHome = () => {
  const navigate = useNavigate();
  const { favorites } = useFavorites();
  const [searchQuery, setSearchQuery] = useState("");
  
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

  // Get current highlights (best conditions)
  const getCurrentHighlights = () => {
    // TODO: Implement logic to find best current conditions
    return spots?.slice(0, 4) || [];
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // TODO: Implement search functionality
  
    }
  };

  return (
    <>
      <SEO 
        title="Surfe Diem - Surf Conditions"
        description="Get surf conditions quickly. Search spots, buoys, or locations for real-time surf data."
        keywords="surf conditions, surf search, wave height, surf report, quick surf data"
        url="https://surfe-diem.com"
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Surfe Diem",
            "description": "Quick surf conditions and search",
            "url": "https://surfe-diem.com"
          })}
        </script>
      </Helmet>
      
      <Container maxWidth="lg" sx={{ 
        marginTop: { xs: '10px', sm: '20px' }, 
        padding: { xs: "12px", sm: "20px" }, 
        paddingTop: { xs: "4px", sm: "4px" }
      }}>
        
        {/* Hero Section with Search */}
        <Item sx={{ bgcolor: 'primary.dark', marginBottom: "30px" }}>
          <Box sx={{
            backgroundColor: "#1ed6e6", 
            background: "linear-gradient(135deg, #1ed6e6 0%, #0ea5e9 100%)",
            height: { xs: "200px", sm: "250px" },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            px: { xs: 2, sm: 3, md: 4 }
          }}>
            <Typography 
              variant="h2" 
              component="div" 
              sx={{ 
                color: "white", 
                textAlign: "center", 
                fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
                fontWeight: "bold",
                mb: 2
              }}
            >
              Surf Conditions
            </Typography>
            
            <Box sx={{ width: "100%", maxWidth: "600px", mb: 2 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search spots, buoys, or locations"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: 'white' }} />
                    </InputAdornment>
                  ),
                  sx: {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'transparent',
                      },
                      '&:hover fieldset': {
                        borderColor: 'transparent',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'transparent',
                      },
                    },
                  }
                }}
              />
            </Box>
            
            <Typography 
              variant="body1" 
              component="div" 
              sx={{ 
                color: "white", 
                textAlign: "center",
                opacity: 0.9
              }}
            >
              Get real-time surf data instantly
            </Typography>
          </Box>
        </Item>

        {/* Quick Access */}
        <Item sx={{ bgcolor: 'background.default', marginBottom: "30px", p: 3 }}>
          <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 600, textAlign: "center" }}>
            Quick Access
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Button 
                variant="outlined" 
                size="large"
                fullWidth
                onClick={() => navigate('/spots')}
                sx={{ height: "80px", flexDirection: "column" }}
              >
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                  Browse Spots
                </Typography>
              </Button>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Button 
                variant="outlined" 
                size="large"
                fullWidth
                onClick={() => navigate('/map')}
                sx={{ height: "80px", flexDirection: "column" }}
              >
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                  View Map
                </Typography>
              </Button>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Button 
                variant="outlined" 
                size="large"
                fullWidth
                onClick={() => navigate('/spots')}
                sx={{ height: "80px", flexDirection: "column" }}
              >
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                  Popular
                </Typography>
              </Button>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Button 
                variant="outlined" 
                size="large"
                fullWidth
                onClick={() => navigate('/spots')}
                sx={{ height: "80px", flexDirection: "column" }}
              >
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                  Favorites
                </Typography>
              </Button>
            </Grid>
          </Grid>
        </Item>

        {/* Current Highlights */}
        <Item sx={{ bgcolor: 'background.default', marginBottom: "30px", p: 3 }}>
          <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 600, textAlign: "center" }}>
            Best conditions right now
          </Typography>
          <Grid container spacing={2}>
            {getCurrentHighlights().map((spot) => (
              <Grid item xs={12} sm={6} md={3} key={spot.id}>
                <Card sx={{ height: "100%", cursor: "pointer" }} onClick={() => goToSpotPage(spot.id.toString())}>
                  <CardContent sx={{ textAlign: "center" }}>
                    <Typography variant="h6" component="div" sx={{ fontWeight: "bold", mb: 1 }}>
                      {spot.name}
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ fontWeight: "bold", color: "primary.main", mb: 1 }}>
                      3-5ft
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Clean • SW swell
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Item>

        {/* My Lineup (Favorites) */}
        <FavoritesList 
          favorites={favorites}
          currentData={favoritesData}
          isLoading={favoritesLoading}
        />

      </Container>
    </>
  );
};

export default MinimalistHome; 