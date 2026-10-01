import { Box, Typography, useTheme } from '@mui/material';
import type { TideState } from 'utils/tides';
import { getTideDirectionDescription } from 'utils/tides';
import { formatNoaaTime12h } from '../utils';

interface TideInlineProps {
  /** undefined = station lookup still in flight; false = no usable station nearby. */
  tideAvailable?: boolean;
  currentState: TideState | null;
  isLoading?: boolean;
}

/**
 * Condensed single-line "current tide" readout — the de-emphasised
 * replacement for the standalone `TideSparklineCard` inside `SpotMetricBar`.
 * See .docs/forecast-spot-plan.md §3.D1 / §3.F1.
 */
export const TideInline = ({ tideAvailable, currentState, isLoading }: TideInlineProps) => {
  const theme = useTheme();

  if (isLoading || tideAvailable === undefined) return null;

  const label = (
    <Box component="span" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
      Tide
    </Box>
  );

  if (tideAvailable === false) {
    return (
      <Typography sx={{ fontSize: '0.8125rem', color: theme.palette.text.secondary }}>
        {label} · Tide unavailable
      </Typography>
    );
  }

  if (!currentState) return null;

  const nextLabel = currentState.nextType === 'H' ? 'High' : 'Low';

  return (
    <Typography sx={{ fontSize: '0.8125rem', color: theme.palette.text.secondary }}>
      {label} · {currentState.currentHeight.toFixed(1)} ft, {getTideDirectionDescription(currentState.direction)} →{' '}
      {nextLabel} {currentState.nextHeight.toFixed(1)} ft {formatNoaaTime12h(currentState.nextTime)}
    </Typography>
  );
};
