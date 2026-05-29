import { Box, Button, Typography } from "@mui/material";
import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useColorMode } from "../../providers/theme-provider";

interface HeroCta {
  label: string;
  href: string;
  variant?: 'contained' | 'outlined';
}

interface HeroSectionProps {
  image: string;
  widget?: ReactNode;
  heading?: ReactNode;
  body?: string;
  ctas?: HeroCta[];
}

const DEFAULT_HEADING = (
  <>
    What's the surf{' '} <br />like
    <Box component="span" sx={{ fontStyle: 'italic', color: '#6aebf5' }}>
      {' '}now?
    </Box>
  </>
);

const DEFAULT_CTAS: HeroCta[] = [
  { label: 'Surf spots', href: '/spots', variant: 'contained' },
  { label: 'Explore', href: '/map', variant: 'outlined' },
];

const HeroSection = ({ image, widget, heading = DEFAULT_HEADING, body = 'Real-time conditions and current forecasts.', ctas = DEFAULT_CTAS }: HeroSectionProps) => {
  const navigate = useNavigate();
  const { mode } = useColorMode();

  const overlay = mode === 'dark'
    ? 'linear-gradient(110deg, rgba(6,22,29,0.95) 0%, rgba(6,22,29,0.6) 55%, rgba(6,22,29,0.75) 100%)'
    : 'linear-gradient(110deg, rgba(6,22,29,0.92) 0%, rgba(6,22,29,0.55) 55%, rgba(6,22,29,0.7) 100%)';

  return (
    <Box
      sx={{
        height: '640px',
        position: 'relative',
        backgroundImage: `${overlay}, url(${image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 50%',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Content grid: left text column + right widget column */}
      <Box
        sx={{
          height: '100%',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 420px' },
          gap: '60px',
          px: { xs: '32px', md: '72px' },
          py: '64px',
          alignItems: 'center',
        }}
      >
        {/* Left column */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* H1 */}
          <Typography
            component="h1"
            sx={{
              fontFamily: '"Bricolage Grotesque", Inter, sans-serif',
              fontWeight: 700,
              fontSize: { xs: '48px', md: '72px', lg: '84px' },
              lineHeight: 0.94,
              letterSpacing: '-0.035em',
              color: 'white',
            }}
          >
            {heading}
          </Typography>

          {/* Body */}
          <Typography sx={{ fontSize: 17, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5, maxWidth: '480px' }}>
            {body}
          </Typography>

          {/* CTAs */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {ctas.map((cta) => (
              <Button
                key={cta.href}
                variant={cta.variant ?? 'contained'}
                onClick={() => navigate(cta.href)}
                sx={cta.variant === 'outlined' ? {
                  borderRadius: '999px',
                  px: 3,
                  py: 1.25,
                  borderColor: 'rgba(255,255,255,0.4)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: 15,
                  backdropFilter: 'blur(10px)',
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  '&:hover': {
                    borderColor: 'rgba(255,255,255,0.7)',
                    backgroundColor: 'rgba(255,255,255,0.14)',
                  },
                } : {
                  borderRadius: '999px',
                  px: 3,
                  py: 1.25,
                  backgroundColor: 'white',
                  color: '#006978',
                  fontWeight: 700,
                  fontSize: 15,
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' },
                }}
              >
                {cta.label}
              </Button>
            ))}
          </Box>
        </Box>

        {/* Right column — widget */}
        <Box>
          {widget}
        </Box>
      </Box>
    </Box>
  );
};

export default HeroSection;
