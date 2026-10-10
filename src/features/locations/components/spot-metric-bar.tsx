import { Box, Divider, Paper, Typography, useTheme } from '@mui/material';
import type { ReactNode } from 'react';
import { MetricTile } from 'components/common/metric-tile';
import { useColorMode } from 'providers/theme-provider';
import { colorTokens } from 'config/theme';
import { ParsedNWSCurrent } from 'utils/nws-parser';
import { formatDirection, kilometersPerHourToMph } from 'utils/formatting';
import { metersToFeet } from 'utils/nws-parser';
import { getDisplaySwell, formatSwellPower } from 'utils/swell-power';
import { formatLocationTime } from 'utils/timezone';
import { DEFAULT_TIMEZONE } from 'utils/constants';
import { SwellPowerInfo } from '@features/conditions';
import type { CurrentConditions } from '@/types/conditions';

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
  /** GET /conditions for this spot: swell power, and buoy swell when NWS has none */
  conditions?: CurrentConditions | null;
  isConditionsLoading?: boolean;
  /** Spot's IANA timezone, for the buoy reading time */
  timezone?: string;
  children?: ReactNode;
}

export const SpotMetricBar = ({
  current,
  tideHeightFt,
  isNWSLoading,
  isTideLoading,
  weather,
  tide,
  conditions,
  isConditionsLoading = false,
  timezone = DEFAULT_TIMEZONE,
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

  // Leading NWS swell: from /conditions when loaded (its period may be measured by a
  // buoy, and it's what swell power is computed from), else the forecast while it loads.
  const leading = conditions?.primary_swell_height != null
    ? {
        heightFt: metersToFeet(conditions.primary_swell_height),
        periodS: conditions.primary_swell_period,
        direction: conditions.primary_swell_direction,
        periodSource: conditions.primary_swell_period_source ?? null,
      }
    : current
      ? {
          heightFt: current.primary_swell_height,
          periodS: current.primary_swell_period,
          direction: current.primary_swell_direction,
          periodSource: null,
        }
      : null;

  // NWS has no primary swell right now (wave-height-only grid, or a forecast
  // run without the swell series): show the buoy-measured swell instead.
  const displaySwell = conditions ? getDisplaySwell(conditions) : null;
  const buoySwell = !leading?.heightFt && displaySwell?.station ? displaySwell : null;
  const buoyNote = buoySwell
    ? `Buoy ${buoySwell.station}${buoySwell.observedAt ? ` · ${formatLocationTime(buoySwell.observedAt, timezone)}` : ''}`
    : undefined;
  const measuredNote = conditions?.buoy_wave_station ? `Measured · buoy ${conditions.buoy_wave_station}` : 'Measured';

  const swellHeightFt = buoySwell ? metersToFeet(buoySwell.heightM) : leading?.heightFt;
  const swellPeriod = buoySwell ? buoySwell.periodS : leading?.periodS;
  const swellDirection = buoySwell ? buoySwell.direction : leading?.direction;
  const periodMeasured = !!buoySwell || leading?.periodSource === 'buoy';

  // Second NWS swell, when there is one worth showing (same 0.5 ft cut as the daily cards)
  const secondaryHeightFt = conditions?.secondary_swell_height != null
    ? metersToFeet(conditions.secondary_swell_height)
    : null;
  const secondaryPeriod = conditions?.secondary_swell_period;
  const secondaryDetail = [
    secondaryPeriod != null && secondaryPeriod > 0 ? `${Math.round(secondaryPeriod)}s` : null,
    conditions?.secondary_swell_direction != null ? formatDirection(conditions.secondary_swell_direction) : null,
    conditions?.secondary_swell_period_source === 'buoy' ? 'measured' : null,
  ].filter(Boolean).join(' · ');

  const tiles = [
    {
      label: 'Wave height',
      tooltip: buoySwell
        ? 'Measured at the nearest buoy reporting waves. NWS has no swell forecast here right now.'
        : 'Estimated average height of the highest one-third of the swells.',
      value: swellHeightFt ? `${swellHeightFt.toFixed(1)}ft` : null,
      sub: buoyNote,
      isLoading: !leading && (isNWSLoading || isConditionsLoading),
    },
    {
      label: 'Swell period',
      tooltip: periodMeasured
        ? 'Peak period in seconds of the dominant swell, measured right now by the nearest buoy.'
        : 'Peak period in seconds of the dominant swell, from the NWS forecast.',
      value: swellPeriod ? `${Math.round(swellPeriod)}s` : null,
      sub: periodMeasured && !buoySwell ? measuredNote : undefined,
      isLoading: !leading && (isNWSLoading || isConditionsLoading),
    },
    {
      label: 'Direction',
      tooltip: 'Compass direction the swells are coming from.',
      value: swellDirection ? formatDirection(swellDirection) : null,
      isLoading: !leading && (isNWSLoading || isConditionsLoading),
    },
    ...(secondaryHeightFt != null && secondaryHeightFt > 0.5
      ? [{
          label: 'Second swell',
          tooltip: 'The smaller of the two NWS swells. Its period shows when the forecast or a buoy has one.',
          value: `${secondaryHeightFt.toFixed(1)}ft`,
          sub: secondaryDetail || undefined,
          isLoading: false,
        }]
      : []),
    {
      label: 'Swell power',
      value: formatSwellPower(conditions?.swell_power),
      info: (
        <SwellPowerInfo
          power={conditions?.swell_power}
          heightM={displaySwell?.heightM}
          periodS={displaySwell?.periodS}
          totalPower={conditions?.total_power}
        />
      ),
      isLoading: isConditionsLoading,
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
