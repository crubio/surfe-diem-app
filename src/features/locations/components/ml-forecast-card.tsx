import { Box, Chip, Divider, Paper, Tooltip, Typography, useTheme } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useColorMode } from 'providers/theme-provider';
import { colorTokens } from 'config/theme';
import { MLForecastResponse } from '@/types';

interface MLForecastCardProps {
  data: MLForecastResponse;
}

export const MLForecastCard = ({ data }: MLForecastCardProps) => {
  const theme = useTheme();
  const { mode } = useColorMode();
  const tokens = colorTokens[mode];

  const observed = data.observed_wave_height;
  const predicted = data.forecast;

  if (!observed && !predicted) return null;

  return (
    <Paper
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { xs: 'flex-start', md: 'center' },
        px: { xs: 2, md: 3.5 },
        py: 2.5,
        gap: 0,
        overflow: 'hidden',
      }}
    >
      {/* Left cell — label */}
      <Box
        sx={{
          minWidth: { md: 200 },
          pr: { md: 3 },
          mr: { md: 3 },
          borderRight: { md: `1px solid ${theme.palette.divider}` },
          pb: { xs: 2, md: 0 },
          mb: { xs: 2, md: 0 },
          borderBottom: { xs: `1px solid ${theme.palette.divider}`, md: 'none' },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Typography
            sx={{
              fontFamily: '"Bricolage Grotesque", Inter, sans-serif',
              fontWeight: 700,
              fontSize: 16,
              letterSpacing: '-0.02em',
            }}
          >
            Surfe Diem Model
          </Typography>
          <Chip
            label="BETA"
            size="small"
            color="primary"
            sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em' }}
          />
          <Tooltip
            title="Wave height forecast from the Surfe Diem ML model, trained on NDBC buoy observations. Only available at select spots."
            placement="right"
            arrow
          >
            <InfoOutlinedIcon sx={{ fontSize: '0.95rem', color: 'text.disabled', cursor: 'help' }} />
          </Tooltip>
        </Box>
        <Typography
          sx={{
            fontFamily: 'monospace',
            fontSize: 12,
            color: tokens.textTertiary,
          }}
        >
          WVHT · multi-horizon
        </Typography>
      </Box>

      {/* Data cells */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 0,
          flex: 1,
        }}
      >
        {/* Observed */}
        {observed?.value_ft != null && (
          <>
            <Box sx={{ px: { xs: 0, md: 3 }, py: { xs: 1, md: 0 }, textAlign: 'center', minWidth: 80 }}>
              <Typography
                sx={{
                  fontFamily: '"Bricolage Grotesque", Inter, sans-serif',
                  fontWeight: 700,
                  fontSize: 32,
                  letterSpacing: '-0.04em',
                  lineHeight: 1,
                  color: tokens.accentDark,
                }}
              >
                {observed.value_ft.toFixed(1)}
                <Box component="span" sx={{ fontSize: 14, fontWeight: 500, ml: 0.5, color: tokens.textTertiary }}>ft</Box>
              </Typography>
              <Typography
                sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: tokens.textTertiary, mt: 0.5 }}
              >
                Observed
              </Typography>
            </Box>

            {predicted && predicted.length > 0 && (
              <ArrowForwardIcon sx={{ color: tokens.textTertiary, fontSize: '1.1rem', mx: 1, display: { xs: 'none', md: 'block' } }} />
            )}
          </>
        )}

        {/* Forecast cells */}
        {predicted?.map((row, idx) => (
          <Box key={idx} sx={{ display: 'flex', alignItems: 'center' }}>
            <Divider orientation="vertical" flexItem sx={{ mx: { xs: 1.5, md: 2.5 }, display: { xs: 'none', md: 'block' } }} />
            <Box sx={{ px: { xs: 1.5, md: 0 }, py: { xs: 1, md: 0 }, textAlign: 'center', minWidth: 72 }}>
              <Typography
                sx={{
                  fontFamily: '"Bricolage Grotesque", Inter, sans-serif',
                  fontWeight: 700,
                  fontSize: 32,
                  letterSpacing: '-0.04em',
                  lineHeight: 1,
                  color: theme.palette.text.primary,
                }}
              >
                {row.value_ft != null ? row.value_ft.toFixed(1) : '—'}
                <Box component="span" sx={{ fontSize: 14, fontWeight: 500, ml: 0.5, color: tokens.textTertiary }}>ft</Box>
              </Typography>
              <Typography
                sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: tokens.textTertiary, mt: 0.5 }}
              >
                {row.horizon_hours}hr
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};
