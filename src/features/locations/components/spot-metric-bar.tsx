import { Box, Divider, Paper, Typography, useTheme } from '@mui/material';
import type { ReactNode } from 'react';
import { MetricTile } from 'components/common/metric-tile';
import { useColorMode } from 'providers/theme-provider';
import { colorTokens } from 'config/theme';
import { ParsedNWSCurrent } from 'utils/nws-parser';
import { formatDirection, kilometersPerHourToMph } from 'utils/formatting';

interface SpotMetricBarProps {
  current: ParsedNWSCurrent | null | undefined;
  /** Current tide height in feet — derived from Tide Explorer hi/lo data, or null/undefined when unavailable/loading. */
  tideHeightFt: number | null | undefined;
  isNWSLoading: boolean;
  isTideLoading: boolean;
  /** Condensed inline weather readout — replaces the old standalone WeatherWind card. */
  weather?: ReactNode;
  /** Condensed inline tide readout — replaces the old standalone TideSparklineCard on this bar. */
  tide?: ReactNode;
  children?: ReactNode;
}

export const SpotMetricBar = ({
  current,
  tideHeightFt,
  isNWSLoading,
  isTideLoading,
  weather,
  tide,
  children,
}: SpotMetricBarProps) => {
  const theme = useTheme();
  const { mode } = useColorMode();
  const tokens = colorTokens[mode];

  const tileProps = {
    accentColor: tokens.accentDark,
    bgColor: tokens.bgSoft,
    textTertiary: tokens.textTertiary,
    textSecondary: theme.palette.text.secondary,
  };

  const tiles = [
    {
      label: 'Wave height',
      tooltip: 'Estimated average height of the highest one-third of the swells.',
      value: current?.primary_swell_height ? `${current.primary_swell_height.toFixed(1)}ft` : null,
      isLoading: isNWSLoading,
    },
    {
      label: 'Swell period',
      tooltip: 'Peak period in seconds of the dominant swell.',
      value: current?.primary_swell_period ? `${current.primary_swell_period}s` : null,
      isLoading: isNWSLoading,
    },
    {
      label: 'Direction',
      tooltip: 'Compass direction the swells are coming from.',
      value: current?.primary_swell_direction ? formatDirection(current.primary_swell_direction) : null,
      isLoading: isNWSLoading,
    },
    {
      label: 'Wind',
      tooltip: 'Current wind speed.',
      value: current?.wind_speed ? `${Math.round(kilometersPerHourToMph(current.wind_speed))}mph` : null,
      isLoading: isNWSLoading,
    },
    {
      label: 'Tide',
      tooltip: 'Current tide height in feet.',
      value: tideHeightFt != null ? `${tideHeightFt.toFixed(1)}ft` : null,
      isLoading: isTideLoading,
    },
  ];

  return (
    <Paper sx={{ p: 3.5 }}>
      <Box sx={{ mb: 2.5 }}>
        <Typography
          sx={{
            fontFamily: '"Bricolage Grotesque", Inter, sans-serif',
            fontWeight: 700,
            fontSize: '1.125rem',
            letterSpacing: '-0.02em',
          }}
        >
          Forecast right now
        </Typography>
        <Typography sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary, mt: 0.25 }}>
          NWS — National Weather Service forecast
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
        {tiles.map((tile) => (
          <MetricTile key={tile.label} {...tile} {...tileProps} />
        ))}
      </Box>

      {(weather || tide) && (
        <>
          <Divider sx={{ mt: 2.5, mb: 2, borderColor: tokens.rule }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {weather}
            {tide}
          </Box>
        </>
      )}

      {children && (
        <>
          <Divider sx={{ mt: 2.5, mb: 2.5, borderColor: tokens.rule }} />
          {children}
        </>
      )}
    </Paper>
  );
};
