import {Box, Container, Grid, Stack, Typography} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { getLocations, getSurfSpots, getBatchForecast } from "@features/locations/api/locations";
import { isEmpty } from "lodash";
import { Spot } from "@features/locations/types";
import { Item, SEO, EnhancedSelect } from "components";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { FEATURED_SPOTS } from "utils/constants";
import SpotSummary from "@features/locations/spot-summary"
import { getGeolocation } from "utils/geolocation";
import SpotGlance from "@features/locations/spot-glance";
import surfingImage from "assets/manresa1.jpg";
import surfImage2 from "assets/pismo_landscape.jpg";
import { orderBy } from "lodash";
import { useFavorites } from "../providers/favorites-provider";
import { FavoritesList } from "../components/favorites/favorites-list";

const Home = () => {
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
  
  const buoysData = orderBy(buoys, ["name"], ["asc"]) || []
  const spotsData = orderBy(spots, ["subregion_name", "name"], ["asc"]) || []
  const featuredSpots = spots?.flatMap((spot: Spot) => {
    return FEATURED_SPOTS.includes(spot.name) ? spot : []
  }) || []

  function renderSpots(data: Spot[], n = 3) {
    return (
      <>
        {data.slice(0, n).map((spot: Spot) => {
          return (
            <SpotSummary key={spot.id} {...spot} />   
          )
        })}
      </>
    )
  }

  function goToBuoyPage(location_id: string) {
    navigate(`/location/${location_id}`)
  }

  function goToSpotPage(spot_id: string) {
    // This function is used by the EnhancedSelect component
    // We need to find the spot by ID and use its slug
    const spot = spots?.find(s => s.id.toString() === spot_id);
    if (spot?.slug) {
      navigate(`/spot/${spot.slug}`);
    } else {
      navigate(`/spot/${spot_id}`); // fallback to ID if no slug
    }
  }

  return (
    <>
      <SEO 
        title="Surfe Diem - Free Surf Conditions for the Community"
        description="Get real-time surf conditions, forecasts, and spot information. Free surf data for surfers - no ads, no signup required."
        keywords="surf conditions, surf forecast, surf spots, wave height, surf report, free surf data, surf buoys, tide information, real-time surf data"
        url="https://surfe-diem.com"
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Surfe Diem",
            "description": "Free surf conditions and forecasts for the surfing community",
            "url": "https://surfe-diem.com"
          })}
        </script>
      </Helmet>
      <Container maxWidth="xl" sx={{ 
        marginTop: { xs: '10px', sm: '20px' }, 
        padding: { xs: "12px", sm: "20px" }, 
        paddingTop: { xs: "4px", sm: "4px" }
      }}>
        <Item sx={{ bgcolor: 'primary.dark', marginTop: "20px"}}>
          <Box sx={{
            backgroundColor: "#1ed6e6", 
            backgroundImage: `url(${surfImage2})`, 
            backgroundRepeat: "no-repeat", 
            backgroundSize: "cover",
            backgroundPosition: "center",
            height: { xs: "200px", sm: "240px", md: "290px" },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            px: { xs: 2, sm: 3, md: 4 }
          }} >
            <Typography 
              variant="h3" 
              component="div" 
              sx={{ 
                paddingTop: { xs: "10px", sm: "20px" },
                color: "white", 
                textAlign: "center", 
                textShadow: "#1ed6e6 1px 0 2px",
                fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
                fontWeight: "bold",
                mb: { xs: 1, sm: 2 }
              }}
            >
              surfe diem
            </Typography>
            <Typography 
              variant="h5" 
              component="div" 
              sx={{ 
                marginBottom: { xs: "10px", sm: "20px" },
                color: "white", 
                textAlign: "center",
                fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" },
                fontWeight: 400,
                lineHeight: 1.2,
                maxWidth: { xs: "280px", sm: "400px", md: "500px" }
              }}
            >
              get the latest surf forecasts near you
            </Typography>
          </Box>
        </Item>
        {/* Favorites Section */}
        <FavoritesList 
          favorites={favorites}
          currentData={favoritesData}
          isLoading={favoritesLoading}
        />
        {geolocation ? (
          <Box sx={{ marginTop: "20px", marginBottom: "20px" }}>
            {/* TODO: link to page with the complete list and all other spots */}
            <Typography variant="h5" sx={{marginBottom: "10px", paddingLeft: "8px"}}>Surf spots nearby</Typography>
            <SpotGlance latitude={geolocation.latitude} longitude={geolocation.longitude} renderNumber={10} />
          </Box>
        ): null}
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ marginBottom: "20px" }}>
          <Grid item xs={12} md={6}>
            <Item sx={{ 
              bgcolor: 'background.default', 
              marginTop: { xs: "10px", sm: "20px" },
              p: { xs: 2, sm: 3 }
            }}>
              <Typography variant="h5" component="h2" sx={{ 
                mb: { xs: 1.5, sm: 2 },
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
                fontWeight: 600
              }}>
                Buoys
              </Typography>
              <Box>
                {buoysData && buoysData.length > 0 && (
                  <EnhancedSelect 
                    label="Select a buoy" 
                    items={buoysData} 
                    selectValueKey="location_id" 
                    doOnSelect={goToBuoyPage}
                    type="buoy"
                    placeholder="Search buoys..."
                  />
                )}
              </Box>
            </Item>
          </Grid>
          <Grid item xs={12} md={6}>
            <Item sx={{ 
              bgcolor: 'background.default', 
              marginTop: { xs: "10px", sm: "20px" },
              p: { xs: 2, sm: 3 }
            }}>
              <Typography variant="h5" component="h2" sx={{ 
                mb: { xs: 1.5, sm: 2 },
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
                fontWeight: 600
              }}>
                Spots
              </Typography>
              <Box>
                {spotsData && spotsData.length > 0 && (
                  <EnhancedSelect 
                    label="Select a surf spot" 
                    items={spotsData} 
                    selectValueKey="id" 
                    doOnSelect={goToSpotPage}
                    type="spot"
                    placeholder="Search surf spots..."
                  />
                )}
              </Box>
            </Item>
          </Grid>
        </Grid>
        
        <Item sx={{ 
          bgcolor: 'background.default', 
          marginTop: { xs: "10px", sm: "20px" }
        }}>
          <Box sx={{
            backgroundImage:`url(${surfingImage})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "center",
            minHeight: { xs: "150px", sm: "200px" }
          }}>
            <Box sx={{
              padding: { xs: "16px", sm: "20px" },
            }}>
              <Typography 
                variant="h5" 
                sx={{
                  marginBottom: { xs: "8px", sm: "10px" },
                  fontSize: { xs: "1.25rem", sm: "1.5rem" },
                  fontWeight: 600,
                  color: "white",
                  textShadow: "2px 2px 4px rgba(0,0,0,0.7)"
                }}
              >
                Featured spots
              </Typography>
              <Item sx={{ 
                bgcolor: 'primary.light', 
                marginTop: { xs: "10px", sm: "20px" },
                p: { xs: 2, sm: 3 }
              }}>
                <Stack 
                  direction={{ xs: 'column', sm: 'column', md: 'row' }} 
                  spacing={{ xs: 1.5, sm: 2 }}
                  sx={{ width: '100%' }}
                >
                  {spots && !isEmpty(spots)? (
                    renderSpots(featuredSpots, 5)
                  ): (
                    <Typography sx={{ p: 2, textAlign: 'center' }}>
                      No data available
                    </Typography>
                  )}
                </Stack>
              </Item>
            </Box>
          </Box>
        </Item>
      </Container>
    </>
  );
}

export default Home;