import { Box, Divider, Theme, Typography } from '@mui/material';
import { colorTokens } from 'config/theme';
import { MLForecastItem } from '@/types';
import { getSwellDirectionText } from 'utils/swell';
import { DirectionArrow } from './direction-arrow';

type ColorTokens = (typeof colorTokens)[keyof typeof colorTokens];

interface ForecastCellProps {
  row: MLForecastItem;
  theme: Theme;
  tokens: ColorTokens;
}

export const ForecastCell = ({ row, theme, tokens }: ForecastCellProps) => {
  const hasDirection =
    row.ground_swell_direction_deg != null && row.ground_swell_direction_confidence != null;
  const lowConfidence = (row.ground_swell_direction_confidence ?? 1) < 0.5;

  return (
    <Box sx={{ display: 'flex', alignItems: 'stretch' }}>
      <Divider
        orientation="vertical"
        flexItem
        sx={{ mx: { xs: 1.5, md: 2 }, display: { xs: 'none', md: 'block' } }}
      />
      <Box
        sx={{
          px: { xs: 1.5, md: 0 },
          py: { xs: 1, md: 0 },
          textAlign: 'center',
          minWidth: 72,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.25,
        }}
      >
        <Typography
          sx={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: tokens.textTertiary,
          }}
        >
          {row.horizon_hours}hr
        </Typography>

        <Typography
          sx={{
            fontFamily: '"Bricolage Grotesque", Inter, sans-serif',
            fontWeight: 700,
            fontSize: 28,
            letterSpacing: '-0.04em',
            lineHeight: 1,
            color: theme.palette.text.primary,
          }}
        >
          {row.value_ft != null ? row.value_ft.toFixed(1) : '—'}
          <Box component="span" sx={{ fontSize: 13, fontWeight: 500, ml: 0.4, color: tokens.textTertiary }}>
            ft
          </Box>
        </Typography>

        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 600,
            color: tokens.textTertiary,
            lineHeight: 1.2,
          }}
        >
          {row.dominant_period_s != null ? `${row.dominant_period_s.toFixed(1)}s` : '—'}
        </Typography>

        {hasDirection ? (
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 600,
              color: lowConfidence ? tokens.textTertiary : theme.palette.text.secondary,
              lineHeight: 1.2,
              opacity: lowConfidence ? 0.55 : 1,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <DirectionArrow deg={row.ground_swell_direction_deg!} lowConfidence={lowConfidence} />
            {getSwellDirectionText(row.ground_swell_direction_deg!)}
          </Typography>
        ) : (
          <Typography sx={{ fontSize: 11, color: tokens.textTertiary }}>—</Typography>
        )}
      </Box>
    </Box>
  );
};
