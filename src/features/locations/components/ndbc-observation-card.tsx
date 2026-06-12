import { Box, Paper, Typography, useTheme } from '@mui/material';
import { useColorMode } from 'providers/theme-provider';
import { colorTokens } from 'config/theme';
import { BuoyLocationLatestObservation } from 'types';

interface NDBCObservationCardProps {
  stationId: string;
  observation: BuoyLocationLatestObservation;
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
      <Typography sx={{ fontSize: 12, color: textTertiary, fontWeight: 500 }}>{label}</Typography>
      <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{value}</Typography>
    </Box>
  );
};

export const NDBCObservationCard = ({ stationId, observation }: NDBCObservationCardProps) => {
  const theme = useTheme();
  const { mode } = useColorMode();
  const tokens = colorTokens[mode];

  return (
    <Paper sx={{ p: 3.5 }}>
      <Box sx={{ mb: 2.5 }}>
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
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
            fontSize: 22,
            letterSpacing: '-0.025em',
            color: theme.palette.text.primary,
          }}
        >
          Buoy Conditions
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        <MetricRow label="Wave Height" value={observation.wave_height} textTertiary={tokens.textTertiary} />
        <MetricRow label="Swell Height" value={observation.swell_height} textTertiary={tokens.textTertiary} />
        <MetricRow label="Peak Period" value={observation.peak_period} textTertiary={tokens.textTertiary} />
        <MetricRow label="Period" value={observation.period} textTertiary={tokens.textTertiary} />
        <MetricRow label="Direction" value={observation.direction} textTertiary={tokens.textTertiary} />
        <MetricRow label="Wind Wave Height" value={observation.wind_wave_height} textTertiary={tokens.textTertiary} />
        <MetricRow label="Water Temp" value={observation.water_temp} textTertiary={tokens.textTertiary} />
        <MetricRow label="Air Temp" value={observation.air_temp} textTertiary={tokens.textTertiary} />
      </Box>
    </Paper>
  );
};
