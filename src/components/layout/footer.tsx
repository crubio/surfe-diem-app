import { Box, Container, Link, Typography } from "@mui/material";
import { LinkRouter } from "components";
import SdBanner from '../../assets/sd_banner.svg?react';
import { useColorMode } from '../../providers/theme-provider';
import { colorTokens } from '../../config/theme';

export default function Footer() {
  const { mode } = useColorMode();
  const tokens = colorTokens[mode];

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: tokens.bgSoft,
        borderTop: `1px solid ${tokens.rule}`,
        mt: 'auto',
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          py: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        {/* Logo */}
        <SdBanner
          style={{
            height: 24,
            width: 'auto',
            color: mode === 'light' ? '#0097a7' : '#1ed6e6',
            display: 'block',
          }}
        />

        {/* Nav links */}
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
          <LinkRouter to="/" sx={{ fontSize: 13, color: tokens.textTertiary, textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>Dashboard</LinkRouter>
          <LinkRouter to="/spots" sx={{ fontSize: 13, color: tokens.textTertiary, textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>Spots</LinkRouter>
          <LinkRouter to="/map" sx={{ fontSize: 13, color: tokens.textTertiary, textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>Map</LinkRouter>
          <LinkRouter to="/about" sx={{ fontSize: 13, color: tokens.textTertiary, textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>About</LinkRouter>
          <Link href="mailto:contact@surfe-diem.com" sx={{ fontSize: 13, color: tokens.textTertiary, textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>Contact</Link>
        </Box>

        {/* Copyright */}
        <Typography sx={{ fontSize: 12, color: tokens.textTertiary }}>
          © {new Date().getFullYear()} Surfe Diem
        </Typography>
      </Container>
    </Box>
  );
}
