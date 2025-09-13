import { getSurfSpots } from "@features/locations/api/locations";
import { Spot } from "../types";
import { Box, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Item, LinkRouter, SEO, PageContainer, SectionContainer, ContentWrapper } from "components";
import { sortBy } from "lodash";
import surfImage from "assets/sharks1.jpg";
import NoDataFound from "components/common/not-found";

const SpotsPage = () => {
  const {data} = useQuery({
    queryKey: ['surf_spots'],
    queryFn: async () => getSurfSpots()
  });

    sortBy(data, ['subregion_name' ]);

    function sortBySubregion(data: Spot[]) {
        const sortedData: { [key: string]: Spot[] } = {}
        data.forEach(spot => {
            if (!sortedData[spot.subregion_name]) {
                sortedData[spot.subregion_name] = [];
            }
            sortedData[spot.subregion_name].push(spot);
        });
        return sortedData;
    }

    const spotsArray: Spot[] = Array.isArray(data) ? data : (data && data.status === "success" && Array.isArray(data.data) ? data.data : []);
    const sortedSpots = sortBySubregion(spotsArray);

    return (
        <>
          <SEO 
              title="Surf Spots - Surfe Diem"
              description="Browse surf spots by region. Get detailed information about surf locations, conditions, and forecasts."
              keywords="surf spots, surf locations, surf regions, surf spot directory, surf spot finder, surf spot guide"
              url="https://surfe-diem.com/spots"
          />
      <PageContainer maxWidth="XL" padding="MEDIUM" marginTop={{ xs: 1, sm: 0 }}>
        
        {/* Hero Section */}
        <Box sx={{
          backgroundColor: "#1ed6e6", 
          backgroundImage: `url(${surfImage})`, 
          backgroundRepeat: "no-repeat", 
          backgroundSize: "cover", 
          height: { xs: "200px", sm: "240px", md: "290px" },
          backgroundPosition: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center"
        }}>
          <Typography variant="h2" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
            Surf spots
          </Typography>
          <Typography variant="h5" sx={{ mb: 3, opacity: 0.9 }}>
            Explore surf spots by region, get detailed information about surf conditions, and find the best waves.
          </Typography>
        </Box>
        {/* Content Section */}
        <ContentWrapper margin="LG">
          <SectionContainer 
            title="Surf spots by region"
            background="DEFAULT"
            spacing="NORMAL"
          >
              {sortedSpots && Object.keys(sortedSpots).length > 0 ? (
                  Object.keys(sortedSpots).map((subregion) => (
                      <Box key={subregion} sx={{ 
                          marginBottom: { xs: "15px", sm: "20px" }, 
                          width: "100%" 
                      }}>
                          <Typography 
                              variant="h5" 
                              component="div" 
                              sx={{ 
                                  marginBottom: { xs: "8px", sm: "10px" },
                                  fontSize: { xs: "1.125rem", sm: "1.25rem" },
                                  fontWeight: 600,
                                  color: "text.secondary"
                              }}
                          >
                              {subregion}
                          </Typography>
                          <Box sx={{ 
                              display: 'flex', 
                              flexWrap: 'wrap', 
                              gap: { xs: 1, sm: 2 }
                          }}>
                              {sortedSpots[subregion].map((spot) => (
                                  <Item 
                                      key={spot.id} 
                                      sx={{ 
                                          width: { xs: '100%', sm: '300px' },
                                          padding: { xs: '12px', sm: '10px' },
                                          minHeight: { xs: '48px', sm: 'auto' }
                                      }}
                                  >
                                      <LinkRouter to={`/spot/${spot.slug || spot.id}`}>
                                          <Typography 
                                              variant="h6"
                                              sx={{
                                                  fontSize: { xs: '1rem', sm: '1.125rem' },
                                                  fontWeight: 500,
                                                  textAlign: { xs: 'center', sm: 'left' }
                                              }}
                                          >
                                              {spot.name}
                                          </Typography>
                                      </LinkRouter>
                                  </Item>
                              ))}
                          </Box>
                      </Box>
                  ))
              ) : <NoDataFound />}
          </SectionContainer>
        </ContentWrapper>
      </PageContainer>
        </>
    )
}

export default SpotsPage;