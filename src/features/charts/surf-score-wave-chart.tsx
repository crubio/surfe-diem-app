import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot,
  TooltipContentProps,
} from 'recharts';
import { Box, Paper, Typography, useTheme } from '@mui/material';
import { useColorMode } from 'providers/theme-provider';
import { colorTokens } from 'config/theme';
import { TransformedNWSForecast } from 'hooks/useNWSForecast';

interface SurfScoreTimelineProps {
  data: TransformedNWSForecast | null;
  isLoading?: boolean;
  height?: number;
  noDataMessage?: string;
}

const CustomTooltip = ({ active, payload }: TooltipContentProps<number, string>) => {
  const theme = useTheme();
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <Paper sx={{ p: 1.5, border: `1px solid ${theme.palette.divider}` }}>
      <Typography variant="caption" fontWeight={700} display="block">
        {new Date(d.timestamp).toLocaleString('en-US', {
          weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric',
        })}
      </Typography>
      <Typography variant="caption" sx={{ color: theme.palette.primary.light, fontWeight: 700 }}>
        Primary: {d.primary?.toFixed(1)}ft
      </Typography>
      {d.secondary > 0 && (
        <Typography variant="caption" display="block" sx={{ color: '#7ed992', fontWeight: 700 }}>
          Secondary: {d.secondary?.toFixed(1)}ft
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
}) => {
  const theme = useTheme();
  const { mode } = useColorMode();
  const tokens = colorTokens[mode];

  const chartData = React.useMemo(() => {
    if (!data?.hourly) return [];
    return data.hourly.slice(0, 72).map((point, i) => ({
      i,
      time: new Date(point.validTime).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        hour12: true,
      }),
      timestamp: point.validTime,
      primary: point.primarySwellHeightFt ?? 0,
      secondary: point.secondarySwellHeightFt ?? 0,
    }));
  }, [data]);

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
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
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
              fontSize: 22,
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
            <Typography sx={{ fontSize: 12, color: tokens.textTertiary }}>Primary swell</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box sx={{ width: 20, height: 2.5, borderRadius: 1, backgroundColor: '#7ed992' }} />
            <Typography sx={{ fontSize: 12, color: tokens.textTertiary }}>Secondary swell</Typography>
          </Box>
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
                <stop offset="5%" stopColor="#7ed992" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#7ed992" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="4 4"
              vertical={false}
              stroke={mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,90,110,0.08)'}
            />

            <XAxis
              dataKey="time"
              tick={{ fontSize: 11, fill: tokens.textTertiary }}
              tickLine={false}
              axisLine={false}
              interval={11}
            />

            <YAxis
              ticks={[0, 2, 4, 6]}
              tick={{ fontSize: 11, fill: tokens.textTertiary }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}ft`}
              width={36}
            />

            <Tooltip content={<CustomTooltip />} />

            <ReferenceLine
              x={0}
              stroke={tokens.textTertiary}
              strokeDasharray="4 4"
              label={{ value: 'NOW', position: 'top', fontSize: 10, fill: tokens.textTertiary }}
            />

            <Area
              type="basis"
              dataKey="primary"
              stroke={theme.palette.primary.light}
              strokeWidth={2.5}
              fill="url(#chartGradientPrimary)"
              dot={false}
              isAnimationActive={false}
            />

            <Area
              type="basis"
              dataKey="secondary"
              stroke="#7ed992"
              strokeWidth={2}
              strokeOpacity={0.8}
              fill="url(#chartGradientSecondary)"
              dot={false}
              isAnimationActive={false}
            />

            {nowDot && (
              <ReferenceDot
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
