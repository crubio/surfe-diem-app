import { Box, Divider, Paper, Tooltip, Typography } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Loading } from 'components/layout/loading';
import { NoData } from '@features/cards/no_data';
import { ParsedNWSCurrent } from 'utils/nws-parser';
import { formatDirection, kilometersPerHourToMph } from 'utils/formatting';
import { getCurrentTideValue } from 'utils/tides';
import { TidesDataCurrent } from '@features/tides/api/tides';

interface MetricProps {
  label: string;
  tooltip: string;
  value: React.ReactNode;
  isLoading: boolean;
}

const Metric = ({ label, tooltip, value, isLoading }: MetricProps) => (
  <Box sx={{ flex: 1, textAlign: 'center', px: 2, py: 1.5 }}>
    {isLoading ? (
      <Loading />
    ) : value ? (
      <>
        <Typography variant="h5" color="primary.main" sx={{ fontWeight: 'bold' }}>
          {value}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mt: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
          <Tooltip title={tooltip} placement="bottom" arrow>
            <InfoOutlinedIcon sx={{ fontSize: '0.85rem', color: 'text.disabled', cursor: 'help' }} />
          </Tooltip>
        </Box>
      </>
    ) : (
      <NoData />
    )}
  </Box>
);

interface SpotMetricBarProps {
  current: ParsedNWSCurrent | null | undefined;
  currentTides: TidesDataCurrent | null | undefined;
  isNWSLoading: boolean;
  isTideLoading: boolean;
}

export const SpotMetricBar = ({ current, currentTides, isNWSLoading, isTideLoading }: SpotMetricBarProps) => {
  const tideValue = currentTides ? getCurrentTideValue(currentTides) : null;

  const metrics: MetricProps[] = [
    {
      label: 'Primary swell',
      tooltip: 'This is the estimated average height of the highest one-third of the swells.',
      value: current?.primary_swell_height ? `${current.primary_swell_height.toFixed(1)}ft` : null,
      isLoading: isNWSLoading,
    },
    {
      label: 'Swell period',
      tooltip: 'This is the peak period in seconds of the swells. If more than one swell is present, this is the period of the swell containing the maximum energy.',
      value: current?.primary_swell_period ? `${current.primary_swell_period}s` : null,
      isLoading: isNWSLoading,
    },
    {
      label: 'Direction',
      tooltip: 'Compass direction that the swells are coming from. Direction is given on a 16 point compass scale',
      value: current?.primary_swell_direction ? formatDirection(current.primary_swell_direction) : null,
      isLoading: isNWSLoading,
    },
    {
      label: 'Wind',
      tooltip: 'Current wind speed.',
      value: current?.wind_speed ? `${Math.round(kilometersPerHourToMph(current.wind_speed))} mph` : null,
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
    <Paper variant="outlined" sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'stretch' }}>
      {metrics.map((metric, i) => (
        <>
          <Box key={metric.label} sx={{ flex: 1 }}>
            <Metric {...metric} />
          </Box>
          {i < metrics.length - 1 && (
            <>
              <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
              <Divider sx={{ display: { xs: 'block', sm: 'none' } }} />
            </>
          )}
        </>
      ))}
    </Paper>
  );
};
