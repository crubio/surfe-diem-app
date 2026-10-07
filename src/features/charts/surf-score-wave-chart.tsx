import React from 'react';
import { DateTime } from 'luxon';
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot,
  TooltipContentProps,
} from 'recharts';
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';
import { Box, Paper, Typography, useTheme, type Theme } from '@mui/material';
import { useColorMode } from 'providers/theme-provider';
import { colorTokens } from 'config/theme';
import { TransformedNWSForecast } from 'hooks/useNWSForecast';
import { parseNoaaLocalTime } from '@features/tides/utils';
import type { TideChartPoint } from '@features/tides/api/tide-explorer';
import { DEFAULT_TIMEZONE } from 'utils/constants';

interface SurfScoreTimelineProps {
  data: TransformedNWSForecast | null;
  isLoading?: boolean;
  height?: number;
  noDataMessage?: string;
  /** Hourly tide curve (Tide Explorer /tides/predictions/chart). Omitted entirely when absent. */
  tideSeries?: TideChartPoint[];
  /** Spot's IANA timezone — keeps day/hour bucketing and labels in the spot's
   * local wall clock instead of the viewer's browser timezone, so the tide
   * join (keyed on station-local digits) lines up correctly. */
  timezone?: string;
}

type TooltipExtraProps = { theme: Theme; tokens: (typeof colorTokens)[keyof typeof colorTokens] };

const CustomTooltip = ({ active, payload, theme, tokens }: TooltipContentProps<ValueType, NameType> & TooltipExtraProps) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <Paper sx={{ p: 1.5, border: `1px solid ${theme.palette.divider}` }}>
      <Typography variant="caption" fontWeight={700} display="block">
        {d.timeLabel}
      </Typography>
      <Typography variant="caption" sx={{ color: theme.palette.primary.light, fontWeight: 700 }}>
        Primary: {d.primary?.toFixed(1)}ft
      </Typography>
      {d.secondary > 0 && (
        <Typography variant="caption" display="block" sx={{ color: tokens.secondarySwellColor, fontWeight: 700 }}>
          Secondary: {d.secondary?.toFixed(1)}ft
        </Typography>
      )}
      {d.tide != null && (
        <Typography variant="caption" display="block" sx={{ color: tokens.tideLine, fontWeight: 700 }}>
          Tide: {d.tide?.toFixed(1)}ft
        </Typography>
      )}
    </Paper>
  );
};

export const SurfScoreWaveChart: React.FC<SurfScoreTimelineProps> = ({
  data,
  isLoading,
  height = 280,
  noDataMessage = 'No forecast data available',
  tideSeries,
  timezone = DEFAULT_TIMEZONE,
}) => {
  const theme = useTheme();
  const { mode } = useColorMode();
  const tokens = colorTokens[mode];

  // Tide points keyed by local "YYYY-MM-DDTHH" so they can be joined onto the
  // NWS hourly series without any timezone conversion — see tides/utils.ts.
  const tideByHourKey = React.useMemo(() => {
    if (!tideSeries?.length) return null;
    const map = new Map<string, number>();
    for (const p of tideSeries) {
      const parsed = parseNoaaLocalTime(p.t);
      const value = parseFloat(p.v);
      if (!parsed || Number.isNaN(value)) continue;
      map.set(`${parsed.dateKey}T${String(parsed.hour).padStart(2, '0')}`, value);
    }
    return map.size ? map : null;
  }, [tideSeries]);

  const chartData = React.useMemo(() => {
    if (!data?.hourly) return [];
    return data.hourly.slice(0, 72).map((point, i) => {
      // Read validTime in the spot's own timezone (not the viewer's browser
      // zone) so this lines up with tideByHourKey, which is keyed on NOAA's
      // station-local digits — see parseNoaaLocalTime in tides/utils.ts.
      const dt = DateTime.fromISO(point.validTime, { zone: timezone });
      const dateKey = dt.toFormat('yyyy-LL-dd');
      const hourKey = `${dateKey}T${dt.toFormat('HH')}`;
      return {
        i,
        dateKey,
        dayLabel: dt.toFormat('ccc L/d'),
        timeLabel: dt.setLocale('en-US').toFormat('ccc, LLL d, h a ZZZZ'),
        primary: point.primarySwellHeightFt ?? 0,
        secondary: point.secondarySwellHeightFt ?? 0,
        tide: tideByHourKey?.get(hourKey) ?? null,
      };
    });
  }, [data, tideByHourKey, timezone]);

  // One reference line + axis tick per day boundary (skip index 0 — the "NOW" line already marks it).
  const dayBoundaries = React.useMemo(() => {
    const result: { index: number; label: string }[] = [];
    let lastDateKey: string | null = null;
    chartData.forEach((point) => {
      if (point.dateKey !== lastDateKey) {
        result.push({ index: point.i, label: point.dayLabel });
        lastDateKey = point.dateKey;
      }
    });
    return result;
  }, [chartData]);

  const nowDot = chartData[0];

  if (isLoading) {
    return (
      <Paper sx={{ p: 3.5 }}>
        <Typography color="text.secondary">Loading forecast...</Typography>
      </Paper>
    );
  }

  if (!data?.hourly || chartData.length === 0) {
    return (
      <Paper sx={{ p: 3.5 }}>
        <Typography color="text.secondary">{noDataMessage}</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3.5 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Box>
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
            Forecast
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
            Swell Height — next 72 hours
          </Typography>
        </Box>

        {/* Legend */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box sx={{ width: 20, height: 2.5, borderRadius: 1, backgroundColor: theme.palette.primary.light }} />
            <Typography sx={{ fontSize: '0.75rem', color: tokens.textTertiary }}>Primary swell</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box sx={{ width: 20, height: 2.5, borderRadius: 1, backgroundColor: tokens.secondarySwellColor }} />
            <Typography sx={{ fontSize: '0.75rem', color: tokens.textTertiary }}>Secondary swell</Typography>
          </Box>
          {tideByHourKey && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Box sx={{ width: 20, height: 1.5, borderRadius: 1, backgroundColor: tokens.tideLine }} />
              <Typography sx={{ fontSize: '0.75rem', color: tokens.textTertiary }}>Tide</Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Chart */}
      <Box sx={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="chartGradientPrimary" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={theme.palette.primary.light} stopOpacity={0.3} />
                <stop offset="95%" stopColor={theme.palette.primary.light} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="chartGradientSecondary" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={tokens.secondarySwellColor} stopOpacity={0.2} />
                <stop offset="95%" stopColor={tokens.secondarySwellColor} stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="4 4"
              vertical={false}
              stroke={mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,90,110,0.08)'}
            />

            <XAxis
              dataKey="i"
              type="number"
              domain={[0, chartData.length - 1]}
              ticks={dayBoundaries.map((b) => b.index)}
              tickFormatter={(i: number) => dayBoundaries.find((b) => b.index === i)?.label ?? ''}
              tick={{ fontSize: 11, fill: tokens.textTertiary }}
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              yAxisId="swell"
              ticks={[0, 2, 4, 6]}
              tick={{ fontSize: 11, fill: tokens.textTertiary }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}ft`}
              width={36}
            />

            {tideByHourKey && (
              <YAxis yAxisId="tide" orientation="right" domain={['dataMin - 1', 'dataMax + 1']} hide />
            )}

            <Tooltip content={(props) => <CustomTooltip {...props} theme={theme} tokens={tokens} />} />

            {/* Day boundaries — subtle separators between calendar days (skip index 0: "NOW" already marks it) */}
            {dayBoundaries.filter((b) => b.index > 0).map((b) => (
              <ReferenceLine key={b.index} yAxisId="swell" x={b.index} stroke={tokens.rule} strokeDasharray="2 4" />
            ))}

            <ReferenceLine
              yAxisId="swell"
              x={0}
              stroke={tokens.textTertiary}
              strokeDasharray="4 4"
              label={{ value: 'NOW', position: 'top', fontSize: 10, fill: tokens.textTertiary }}
            />

            <Area
              yAxisId="swell"
              type="basis"
              dataKey="primary"
              stroke={theme.palette.primary.light}
              strokeWidth={2.5}
              fill="url(#chartGradientPrimary)"
              dot={false}
              isAnimationActive={false}
            />

            <Area
              yAxisId="swell"
              type="basis"
              dataKey="secondary"
              stroke={tokens.secondarySwellColor}
              strokeWidth={2}
              strokeOpacity={0.8}
              fill="url(#chartGradientSecondary)"
              dot={false}
              isAnimationActive={false}
            />

            {tideByHourKey && (
              <Line
                yAxisId="tide"
                type="monotone"
                dataKey="tide"
                stroke={tokens.tideLine}
                strokeWidth={1.5}
                dot={false}
                connectNulls
                isAnimationActive={false}
              />
            )}

            {nowDot && (
              <ReferenceDot
                yAxisId="swell"
                x={nowDot.i}
                y={nowDot.primary}
                r={5}
                fill={theme.palette.primary.light}
                stroke={theme.palette.background.paper}
                strokeWidth={2}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};
