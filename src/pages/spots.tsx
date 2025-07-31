import { getSurfSpots } from "@features/locations/api/locations";
import { Spot } from "@features/locations/types";
import { Box, Container, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Item, LinkRouter, SEO } from "components";
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

    const sortedSpots = sortBySubregion(data || []);

    return (
        <>
            <SEO 
                title="Surf Spots - Surfe Diem"
                description="Browse surf spots by region. Get detailed information about surf locations, conditions, and forecasts."
                keywords="surf spots, surf locations, surf regions, surf spot directory, surf spot finder, surf spot guide"
                url="https://surfe-diem.com/spots"
            />
            <Container sx={{
                marginBottom: { xs: "10px", sm: "20px" },
                px: { xs: 2, sm: 3 }
            }}>
            <Item sx={{ bgcolor: 'primary.dark', marginTop: { xs: "10px", sm: "20px" }}}>
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
                            fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" }
                        }}
                    >
                        get the latest surf forecasts near you
                    </Typography>
                </Box>
            </Item>
            <Box sx={{ 
                marginTop: { xs: "10px", sm: "20px" }, 
                padding: { xs: "8px", sm: "10px" }, 
                borderRadius: "8px" 
            }}>
                <Typography 
                    variant="h5" 
                    sx={{
                        marginBottom: { xs: "8px", sm: "10px" },
                        fontSize: { xs: "1.25rem", sm: "1.5rem" },
                        fontWeight: 600
                    }}
                >
                    Surf spots by region
                </Typography>
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
                                    color: "primary.main"
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
            </Box>
        </Container>
        </>
    )
}

export default SpotsPage;