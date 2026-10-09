import { Box, Paper, Typography, useTheme } from '@mui/material';
import { useColorMode } from 'providers/theme-provider';
import { colorTokens } from 'config/theme';
import { BuoyLocationLatestObservation } from 'types';
import { formatLocationTime } from 'utils/timezone';
import { DEFAULT_TIMEZONE } from 'utils/constants';

const BUOY_MAX_AGE_MS = 4 * 60 * 60 * 1000;

interface NDBCObservationCardProps {
  stationId: string;
  observation: BuoyLocationLatestObservation;
  /** Spot's IANA timezone */
  timezone?: string;
}

interface MetricRowProps {
  label: string;
  value: string | undefined;
  textTertiary: string;
}

const MetricRow = ({ label, value, textTertiary }: MetricRowProps) => {
  if (!value) return null;
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <Typography sx={{ fontSize: '0.75rem', color: textTertiary, fontWeight: 500 }}>{label}</Typography>
      <Typography sx={{ fontSize: '0.875rem', fontWeight: 700 }}>{value}</Typography>
    </Box>
  );
};

export const NDBCObservationCard = ({ stationId, observation, timezone = DEFAULT_TIMEZONE }: NDBCObservationCardProps) => {
  const theme = useTheme();
  const { mode } = useColorMode();
  const tokens = colorTokens[mode];
  const observedAt = formatLocationTime(observation.observed_at, timezone);
  // Same 4 h cutoff the API applies to buoy readings in /conditions; this
  // endpoint doesn't filter, so flag it instead of presenting it as current
  const isStale = observation.observed_at
    ? Date.now() - new Date(observation.observed_at).getTime() > BUOY_MAX_AGE_MS
    : false;

  return (
    <Paper sx={{ p: 3.5 }}>
      <Box sx={{ mb: 2.5 }}>
        <Typography
          sx={{
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.16em',
            textTransform: 'none',
            color: tokens.textTertiary,
            mb: 0.5,
          }}
        >
          Latest Observation · NDBC {stationId}
        </Typography>
        <Typography
          sx={{
            fontFamily: '"Bricolage Grotesque", Inter, sans-serif',
            fontWeight: 700,
            fontSize: '1.375rem',
            letterSpacing: '-0.025em',
            color: theme.palette.text.primary,
          }}
        >
          Buoy Conditions
        </Typography>
        {observedAt && (
          <Typography sx={{ fontSize: '0.75rem', color: tokens.textTertiary, mt: 0.5 }}>
            As of {observedAt}{isStale ? ' · over 4 h old, buoy may be offline' : ''}
          </Typography>
        )}
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        <MetricRow label="Wave height" value={observation.wave_height} textTertiary={tokens.textTertiary} />
        <MetricRow label="Swell height" value={observation.swell_height} textTertiary={tokens.textTertiary} />
        <MetricRow label="Peak period" value={observation.peak_period} textTertiary={tokens.textTertiary} />
        <MetricRow label="Period" value={observation.period} textTertiary={tokens.textTertiary} />
        <MetricRow label="Direction" value={observation.direction} textTertiary={tokens.textTertiary} />
        <MetricRow label="Wind wave height" value={observation.wind_wave_height} textTertiary={tokens.textTertiary} />
        <MetricRow label="Water temp" value={observation.water_temp} textTertiary={tokens.textTertiary} />
        <MetricRow label="Air temp" value={observation.air_temp} textTertiary={tokens.textTertiary} />
      </Box>
    </Paper>
  );
};
