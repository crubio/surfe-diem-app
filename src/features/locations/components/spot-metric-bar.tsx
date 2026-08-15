import { Box, Divider, Paper, Typography, useTheme } from '@mui/material';
import { MetricTile } from 'components/common/metric-tile';
import { useColorMode } from 'providers/theme-provider';
import { colorTokens } from 'config/theme';
import { ParsedNWSCurrent } from 'utils/nws-parser';
import { formatDirection, kilometersPerHourToMph } from 'utils/formatting';
import { getCurrentTideValue } from 'utils/tides';
import { TidesDataCurrent } from '@features/tides/api/tides';


interface SpotMetricBarProps {
  current: ParsedNWSCurrent | null | undefined;
  currentTides: TidesDataCurrent | null | undefined;
  isNWSLoading: boolean;
  isTideLoading: boolean;
  children?: React.ReactNode;
}

export const SpotMetricBar = ({ current, currentTides, isNWSLoading, isTideLoading, children }: SpotMetricBarProps) => {
  const theme = useTheme();
  const { mode } = useColorMode();
  const tokens = colorTokens[mode];

  const tileProps = {
    accentColor: tokens.accentDark,
    bgColor: tokens.bgSoft,
    textTertiary: tokens.textTertiary,
    textSecondary: theme.palette.text.secondary,
  };

  const tideValue = currentTides ? getCurrentTideValue(currentTides) : null;

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
      value: tideValue != null ? `${tideValue.toFixed(1)}ft` : null,
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
            fontSize: 18,
            letterSpacing: '-0.02em',
          }}
        >
          NWS Forecast
        </Typography>
        <Typography sx={{ fontSize: 12, color: theme.palette.text.secondary, mt: 0.25 }}>
          National Weather Service
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
        {tiles.map((tile) => (
          <MetricTile key={tile.label} {...tile} {...tileProps} />
        ))}
      </Box>

      {children && (
        <>
          <Divider sx={{ mt: 2.5, mb: 2.5, borderColor: tokens.rule }} />
          {children}
        </>
      )}
    </Paper>
  );
};
