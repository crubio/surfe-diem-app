import { Box, Container, Grid, Typography, Card, CardContent, Button, LinearProgress } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getGeolocation } from "utils/geolocation";
import { getSurfSpotClosest, getBatchForecast } from "@features/locations/api/locations";
import { SEO, Loading } from "components";
import { getWaveHeightColor } from "utils/conditions";
import { getSwellDirectionText, formatSwellHeight, formatSwellPeriod } from "utils/swell";
import { formatWaterTemp } from "utils/water-temp";
import { trackPageView, trackInteraction } from "utils/analytics";
import { useEffect } from "react";
import heroImageJpeg from '../assets/manresa1.jpg';

const NearbySpotsPage = () => {
  const navigate = useNavigate();
  
  // Track page view on mount
  useEffect(() => {
    trackPageView('nearby-spots', 'nearby-spots');
  }, []);
  
  // Get user's geolocation
  const {data: geolocation, isPending: geolocationLoading} = useQuery({
    queryKey: ['geolocation'],
    queryFn: async () => getGeolocation()
  });

  // Get closest spots to user's geolocation
  const {data: closestSpots, isPending: spotsLoading} = useQuery({
    queryKey: ['closest_spots', geolocation?.latitude, geolocation?.longitude],
    queryFn: () => getSurfSpotClosest(geolocation!.latitude, geolocation!.longitude),
    enabled: !!geolocation?.latitude && !!geolocation?.longitude,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get batch forecast data for all closest spots
  const {data: batchForecastData, isPending: forecastLoading} = useQuery({
    queryKey: ['nearby_spots_forecast', closestSpots?.slice(0, 10).map(s => s.id).join(',')],
    queryFn: () => {
      if (!closestSpots || closestSpots.length === 0) return { spots: [] };
      
      const spotIds = closestSpots.slice(0, 10).map(spot => Number(spot.id));
      return getBatchForecast({
        spot_ids: spotIds,
      });
    },
    enabled: !!closestSpots && closestSpots.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleSpotClick = (spot: any) => {
    trackInteraction('nearby-spots', 'spot_click', { spot_id: spot.id, spot_name: spot.name });
    if (spot.slug) {
      navigate(`/spot/${spot.slug}`);
    } else {
      navigate(`/spot/${spot.id}`);
    }
  };

  const isLoading = geolocationLoading || spotsLoading || forecastLoading;

  return (
    <>
      <SEO 
        title="Nearby Surf Spots - Surfe Diem"
        description="Discover the closest surf spots to your location with current conditions and forecasts."
        keywords="nearby surf spots, local surf spots, surf spots near me, surf conditions"
        url="https://surfe-diem.com/nearby-spots"
      />
      
      {/* Hero Section */}
      <Box
        sx={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${heroImageJpeg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          height: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          textAlign: 'center',
          position: 'relative'
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h2" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
            Nearby Surf Spots
          </Typography>
          <Typography variant="h5" sx={{ mb: 3, opacity: 0.9 }}>
            Discover the best waves closest to you
          </Typography>
          {geolocationLoading && (
            <Typography variant="body1" sx={{ opacity: 0.8 }}>
              Getting your location...
            </Typography>
          )}
          {geolocation && (
            <Typography variant="body1" sx={{ opacity: 0.8 }}>
              Showing spots near your location
            </Typography>
          )}
        </Container>
      </Box>

      {/* Content Section */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {isLoading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Loading />
            <Typography variant="body1" sx={{ mt: 2 }}>
              Finding surf spots near you...
            </Typography>
          </Box>
        ) : !geolocation ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Location Access Required!
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Please enable location access to see nearby surf spots.
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => window.location.reload()}
              sx={{ mr: 2 }}
            >
              Try Again
            </Button>
          </Box>
        ) : !closestSpots || closestSpots.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              No Spots Found
            </Typography>
            <Typography variant="body1">
              No surf spots found near your location.
            </Typography>
          </Box>
        ) : (
          <>
            <Typography variant="h4" component="h2" sx={{ mb: 3, fontWeight: 'bold' }}>
              Closest Surf Spots
            </Typography>
            
            <Grid container spacing={3}>
              {batchForecastData?.spots?.map((spot) => {
                const swellData = spot.weather?.swell;
                const waterTempData = spot.weather?.current?.sea_surface_temperature;
                
                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={spot.id}>
                    <Card 
                      sx={{ 
                        height: '100%',
                        cursor: 'pointer',
                        bgcolor: 'background.default',
                        transition: 'all 0.2s ease-in-out',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        '&:hover': {
                          bgcolor: 'rgba(30, 214, 230, 0.05)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        }
                      }}
                      onClick={() => handleSpotClick(spot)}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                            {spot.name}
                          </Typography>
                        </Box>

                        {swellData && (
                          <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                Wave Height
                              </Typography>
                              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                {formatSwellHeight(swellData.height)}
                              </Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={Math.min((swellData.height / 8) * 100, 100)}
                              sx={{ 
                                height: 4, 
                                borderRadius: 2,
                                backgroundColor: 'rgba(0,0,0,0.1)',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: getWaveHeightColor(swellData.height)
                                }
                              }}
                            />
                          </Box>
                        )}

                        {swellData && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Period
                            </Typography>
                            <Typography variant="body2">
                              {formatSwellPeriod(swellData.period)}
                            </Typography>
                          </Box>
                        )}

                        {swellData && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Direction
                            </Typography>
                            <Typography variant="body2">
                              {getSwellDirectionText(swellData.direction)}
                            </Typography>
                          </Box>
                        )}

                        {waterTempData && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Water Temp
                            </Typography>
                            <Typography variant="body2">
                              {formatWaterTemp(waterTempData)}
                            </Typography>
                          </Box>
                        )}

                        {spot.weather?.current?.wind_wave_height && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Wind
                            </Typography>
                            <Typography variant="body2">
                              {spot.weather.current.wind_wave_height.toFixed(1)}
                            </Typography>
                          </Box>
                        )}

                        <Button 
                          variant="outlined" 
                          size="small" 
                          fullWidth
                          sx={{ mt: 'auto' }}
                        >
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </>
        )}
      </Container>
    </>
  );
};

export default NearbySpotsPage; 