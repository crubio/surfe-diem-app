import { Box, Container, Typography, Paper, Stack, Link, Divider, Button, Chip } from '@mui/material';
import { Email, GitHub, Language, Favorite, Support, Share } from '@mui/icons-material';
import heroImageJpeg from '../assets/trmp_dont_sarf_optimized.jpeg';
import heroImageWebp from '../assets/trmp_dont_sarf.webp';
import { SEO } from 'components';

const AboutPage = () => {
  return (
    <>
      <SEO 
        title="About Surfe Diem - Free Surf Conditions for the Community"
        description="Learn about Surfe Diem's mission to provide free surf conditions and forecasts. Ocean stewardship and community-driven surf intelligence."
        keywords="about surfe diem, surf community, ocean stewardship, free surf data, surf culture, surf forecast community"
        url="https://surfe-diem.com/about"
      />
      {/* Hero Section */}
      <Box
        sx={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${heroImageWebp})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          minHeight: { xs: '40vh', sm: '50vh', md: '60vh' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 } }}>
          <Typography 
            variant="h2" 
            component="h1" 
            sx={{ 
              textAlign: 'center', 
              color: 'white',
              textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
              fontWeight: 'bold',
              mb: { xs: 1, sm: 2 },
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
            }}
          >
            About Surfe Diem
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              textAlign: 'center', 
              color: 'white',
              textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
              fontStyle: 'italic',
              fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
              px: { xs: 1, sm: 2 }
            }}
          >
            Free surf conditions for the community
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 2, sm: 3 } }}>

      <Stack spacing={{ xs: 3, sm: 4 }}>
        {/* Mission Statement */}
        <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography 
            variant="h5" 
            component="h2" 
            sx={{ 
              mb: { xs: 1.5, sm: 2 }, 
              color: 'primary.main',
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
              fontWeight: 600
            }}
          >
            Our Mission
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              mb: { xs: 1.5, sm: 2 },
              fontSize: { xs: '0.9rem', sm: '1rem' },
              lineHeight: 1.6
            }}
          >
            Surfe Diem is dedicated to helping surfers catch waves by providing real-time 
            surf conditions, forecasts, and spot information. Always free to the community - no ads, no signup, no login.
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              fontStyle: 'italic',
              fontSize: { xs: '0.9rem', sm: '1rem' },
              color: 'text.secondary'
            }}
          >
            "Carpe Diem" - seize the day, and with Surfe Diem, seize the waves.
          </Typography>
        </Paper>

        {/* Why Surfe Diem */}
        <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography 
            variant="h5" 
            component="h2" 
            sx={{ 
              mb: { xs: 1.5, sm: 2 }, 
              color: 'primary.main',
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
              fontWeight: 600
            }}
          >
            Why Surfe Diem?
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              mb: { xs: 2, sm: 3 },
              fontSize: { xs: '0.9rem', sm: '1rem' },
              lineHeight: 1.6
            }}
          >
            We focus on providing clean, reliable data without the clutter. Our interface is designed for surfers who want 
            quick access to the information that matters most - swell conditions, forecasts, and spot details.
          </Typography>
          
          <Stack spacing={{ xs: 1.5, sm: 2 }}>
            <Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: { xs: 0.5, sm: 1 },
                  fontSize: { xs: '1rem', sm: '1.125rem' },
                  fontWeight: 600
                }}
              >
                🌊 Real-Time Conditions
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}
              >
                Live swell data, wind conditions, and tide information from NOAA buoys and weather stations.
              </Typography>
            </Box>
            <Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: { xs: 0.5, sm: 1 },
                  fontSize: { xs: '1rem', sm: '1.125rem' },
                  fontWeight: 600
                }}
              >
                📊 Detailed Forecasts
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}
              >
                Hourly and daily surf forecasts to help you plan your sessions.
              </Typography>
            </Box>
            <Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: { xs: 0.5, sm: 1 },
                  fontSize: { xs: '1rem', sm: '1.125rem' },
                  fontWeight: 600
                }}
              >
                🗺️ Spot Discovery
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}
              >
                Find new surf spots and explore different regions with our interactive map.
              </Typography>
            </Box>
            <Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: { xs: 0.5, sm: 1 },
                  fontSize: { xs: '1rem', sm: '1.125rem' },
                  fontWeight: 600
                }}
              >
                ⭐ Personal Favorites
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}
              >
                Save your favorite spots and buoys for quick access to current conditions.
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Community & Growth */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h5" component="h2" sx={{ mb: 2, color: 'primary.main' }}>
            Join Our Community
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Surfe Diem is growing, and we want you to be part of our journey. Whether you're a daily user or just discovering us, 
            there are several ways to get involved and help us build something amazing for the surfing community.
          </Typography>
          
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Share color="primary" />
                Spread the Word
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Help us reach more surfers by sharing Surfe Diem with your friends, local surf shops, and social media.
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label="Share on Instagram" variant="outlined" />
                <Chip label="Tell your surf buddies" variant="outlined" />
                <Chip label="Post on surf forums" variant="outlined" />
              </Stack>
            </Box>
            

          </Stack>
        </Paper>

        {/* Data Sources */}
        <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography 
            variant="h5" 
            component="h2" 
            sx={{ 
              mb: { xs: 1.5, sm: 2 }, 
              color: 'primary.main',
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
              fontWeight: 600
            }}
          >
            Data Sources
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              mb: { xs: 1.5, sm: 2 },
              fontSize: { xs: '0.9rem', sm: '1rem' },
              lineHeight: 1.6
            }}
          >
            We aggregate data from multiple reliable sources to provide comprehensive surf information:
          </Typography>
          <Stack spacing={{ xs: 1, sm: 1.5 }}>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}
            >
              • <Link href="https://www.ndbc.noaa.gov/" target="_blank" rel="noopener" sx={{ color: 'inherit' }}>NOAA National Data Buoy Center (NDBC)</Link>
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}
            >
              • <Link href="https://www.weather.gov/" target="_blank" rel="noopener" sx={{ color: 'inherit' }}>National Weather Service (NWS)</Link>
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}
            >
              • <Link href="https://openweathermap.org/" target="_blank" rel="noopener" sx={{ color: 'inherit' }}>OpenWeatherMap API</Link>
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}
            >
              • <Link href="https://open-meteo.com/" target="_blank" rel="noopener" sx={{ color: 'inherit' }}>Open-Meteo</Link> - Weather data and forecasts
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}
            >
              • Community-contributed spot data
            </Typography>
          </Stack>
        </Paper>

        {/* Contact Section */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h5" component="h2" sx={{ mb: 2, color: 'primary.main' }}>
            Get in Touch
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Have questions, suggestions, or want to report an issue? We'd love to hear from you!
          </Typography>
          
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Email color="primary" />
              <Link href="mailto:contact@surfe-diem.com" underline="hover">
                contact@surfe-diem.com
              </Link>
            </Box>
          </Stack>
        </Paper>

        {/* Surf Culture */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h5" component="h2" sx={{ mb: 2, color: 'primary.main' }}>
            Ocean Stewardship
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Surfing is more than just an activity - it's a way of life that connects us deeply to the ocean. 
            As surfers, we have a unique responsibility to protect and preserve the marine environment that gives us so much.
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            We're committed to ocean stewardship and environmental awareness. Every wave we catch reminds us 
            of our duty to care for the ocean, reduce our impact, and advocate for marine conservation.
          </Typography>
          <Typography variant="body1">
            Remember: Respect the oceans, respect each other, pack your trash, and always prioritize safety.
          </Typography>
        </Paper>

        <Divider />

        {/* Footer */}
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="body2" color="text.secondary">
            © 2025 Surfe Diem. Made with 🌊 for the surfing community.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Version 1.0.0
          </Typography>
        </Box>
      </Stack>
      </Container>
    </>
  );
};

export default AboutPage; 