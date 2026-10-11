import { Box, Divider, Paper, Typography, useTheme } from '@mui/material';
import { LinkRouter } from 'components';
import { useColorMode } from 'providers/theme-provider';
import { colorTokens } from 'config/theme';
import { formatMiles } from 'config/seo-meta';

export interface NearbyPlace {
  key: string | number;
  label: string;
  to: string;
  distance: number;
}

interface NearbyPlacesProps {
  title: string;
  subtitle?: string;
  /** Short paragraph above the lists, e.g. what forecast covers the spot */
  intro?: string;
  groups: { heading: string; places: NearbyPlace[] }[];
}

// Crawlable links to nearby spots and buoys. prerender.js writes the same
// lists into the static HTML (same 100 mi radius and limits, config/seo-meta).
export const NearbyPlaces = ({ title, subtitle, intro, groups }: NearbyPlacesProps) => {
  const theme = useTheme();
  const { mode } = useColorMode();
  const tokens = colorTokens[mode];
  const visible = groups.filter((group) => group.places.length > 0);

  if (!intro && visible.length === 0) return null;

  return (
    <Paper sx={{ p: 3.5 }}>
      <Box sx={{ mb: 2.5 }}>
        <Typography
          component="h2"
          sx={{
            fontFamily: '"Bricolage Grotesque", Inter, sans-serif',
            fontWeight: 700,
            fontSize: '1.125rem',
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary, mt: 0.25 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      <Divider sx={{ mb: 2.5, borderColor: tokens.rule }} />

      {intro && (
        <Typography sx={{ fontSize: '0.875rem', color: theme.palette.text.secondary, mb: visible.length ? 2.5 : 0 }}>
          {intro}
        </Typography>
      )}

      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: `repeat(${Math.max(visible.length, 1)}, 1fr)` } }}>
        {visible.map((group) => (
          <Box key={group.heading}>
            <Typography
              component="h3"
              sx={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.16em', color: tokens.textTertiary, mb: 1 }}
            >
              {group.heading}
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              {group.places.map((place) => (
                <Box
                  component="li"
                  key={place.key}
                  sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, py: 0.75, borderBottom: `1px solid ${tokens.rule}` }}
                >
                  <LinkRouter
                    to={place.to}
                    sx={{ fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                  >
                    {place.label}
                  </LinkRouter>
                  <Typography component="span" sx={{ fontSize: '0.75rem', color: tokens.textTertiary, whiteSpace: 'nowrap' }}>
                    {formatMiles(place.distance)}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};
