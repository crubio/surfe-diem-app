import { Box, Typography, Stack, Link, Divider, Chip } from '@mui/material';
import { Email, Share } from '@mui/icons-material';
import heroImageWebp from '../assets/trmp_dont_sarf.webp';
import { SEO, PageContainer, SectionContainer, ContentWrapper, HeroSection } from 'components';

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
      <HeroSection image={heroImageWebp} headline="About Surfe Diem" body="Free surf conditions for the community"/>

      <PageContainer maxWidth="MD" padding="MEDIUM">
        
        <Stack spacing={{ xs: 3, sm: 4 }}>
          {/* Mission Statement */}
          <SectionContainer 
            title="Our Mission"
            background="PAPER"
            spacing="NORMAL"
          >
            <Typography 
              variant="body1" 
              sx={{ 
                mb: { xs: 1.5, sm: 2 },
                fontSize: { xs: '0.9rem', sm: '1rem' },
                lineHeight: 1.6
              }}
            >
              Surfe Diem is dedicated to providing real-time surf conditions, forecasts, and spot information.
              Always free to the community - no ads, no signup, no login.
            </Typography>
          </SectionContainer>

          {/* Why Surfe Diem */}
          <SectionContainer 
            title="Why Surfe Diem?"
            background="PAPER"
            spacing="NORMAL"
          >
            <Typography 
              variant="body1" 
              sx={{ 
                mb: { xs: 2, sm: 3 },
                fontSize: { xs: '0.9rem', sm: '1rem' },
                lineHeight: 1.6
              }}
            >
              We focus on providing clean, reliable data without clutter. Our interface is designed for surfers who want 
              quick access to swell conditions, forecasts, tides & well known surf spot specific info.
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
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  🤖 Surfe Diem Predictive Model
                  <Chip label="BETA" size="small" color="primary" variant="outlined" sx={{ height: 18, fontSize: '0.65rem' }} />
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}
                >
                  At select spots, we layer in our own machine learning model trained on historical NDBC buoy observations
                  to provide short-range wave height forecasts. The model predicts significant wave height (WVHT) — the
                  average of the highest one-third of waves — alongside the latest buoy-observed reading. This feature is in beta and coverage
                  is expanding.
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
                  Hourly forecasts & predictions for well known spots.
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
                  Save your favorite spots and buoys for quick access.
                </Typography>
              </Box>
            </Stack>
          </SectionContainer>

          {/* Community & Growth */}
          <SectionContainer 
            title="Join Our Community"
            background="PAPER"
            spacing="NORMAL"
          >
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
                  <Chip label="Tell your friends" variant="outlined" />
                  <Chip label="Post on surf forums" variant="outlined" />
                </Stack>
              </Box>
            </Stack>
          </SectionContainer>

          {/* Data Sources */}
          <SectionContainer 
            title="Data Sources"
            background="PAPER"
            spacing="NORMAL"
          >
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
                • Community-contributed spot data
              </Typography>
            </Stack>
          </SectionContainer>

          {/* Open Models & Datasets */}
          <SectionContainer
            title="Open Models & Datasets"
            background="PAPER"
            spacing="NORMAL"
          >
            <Typography
              variant="body1"
              sx={{
                mb: { xs: 1.5, sm: 2 },
                fontSize: { xs: '0.9rem', sm: '1rem' },
                lineHeight: 1.6
              }}
            >
              We believe in open science. The machine learning model powering our wave height forecasts — along with
              the datasets used to train it — are publicly available on Hugging Face under the Surfe Diem organization.
              The training data is derived entirely from public NDBC buoy observations.
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2, fontSize: { xs: '0.85rem', sm: '0.875rem' } }}
            >
              Whether you're a researcher, developer, or curious surfer, you're welcome to explore, use, or build on
              what we've published.
            </Typography>
            <Link
              href="https://huggingface.co/surfe-diem"
              target="_blank"
              rel="noopener"
              underline="hover"
              sx={{ fontWeight: 500 }}
            >
              huggingface.co/surfe-diem →
            </Link>
          </SectionContainer>

          {/* Contact Section */}
          <SectionContainer 
            title="Get in Touch"
            background="PAPER"
            spacing="NORMAL"
          >
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
          </SectionContainer>

          {/* Ocean Stewardship */}
          <SectionContainer 
            title="Ocean Stewardship"
            background="PAPER"
            spacing="NORMAL"
          >
            <Typography variant="body1" sx={{ mb: 2 }}>
              Surfing connects us deeply to the ocean. As surfers, we have a unique responsibility to protect and preserve the marine environment that gives us so much.
            </Typography>
            <Typography variant="body1">
              Respect the oceans, respect each other, & pack your trash.
            </Typography>
          </SectionContainer>

          <Divider />

          {/* Footer */}
          <ContentWrapper padding="MD">
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="body2" color="text.secondary">
                © 2025 Surfe Diem. Made with 🌊 for the surfing community.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Version 1.0.0
              </Typography>
            </Box>
          </ContentWrapper>
        </Stack>
      </PageContainer>
    </>
  );
};

export default AboutPage; 