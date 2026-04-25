import React from 'react';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
  TooltipContentProps,
} from 'recharts';
import { Box, Typography, Paper } from '@mui/material';
import { TransformedNWSForecast } from 'hooks/useNWSForecast';
import { getEnhancedConditionScore } from '../../utils/conditions';

interface SurfScoreTimelineProps {
  data: TransformedNWSForecast | null;
  isLoading?: boolean;
  height?: number;
}

export const SurfScoreWaveChart: React.FC<SurfScoreTimelineProps> = ({
  data,
  isLoading,
  height = 400,
}) => {
  const chartData = React.useMemo(() => {
    if (!data?.hourly) return [];

    return data.hourly.map((point) => {
      const conditionScore = getEnhancedConditionScore({
        swellPeriod: point.primarySwellPeriod ?? undefined,
        waveHeight: point.primarySwellHeightFt ?? undefined,
      });

      const scoreMatch = conditionScore.description.match(/\((\d+)\/100\)/);
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 50;

      return {
        time: new Date(point.validTime).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
        }),
        timestamp: point.validTime,
        score,
        level: conditionScore.level,
        label: conditionScore.label,
        primarySwellHeightFt: point.primarySwellHeightFt,
        primarySwellPeriod: point.primarySwellPeriod,
        primarySwellDirection: point.primarySwellDirection,
        secondarySwellHeightFt: point.secondarySwellHeightFt,
      };
    });
  }, [data]);

  const maxHeight = React.useMemo(() => {
    if (chartData.length === 0) return 10;
    const maxPrimary = Math.max(...chartData.map(d => d.primarySwellHeightFt ?? 0));
    const maxSecondary = Math.max(...chartData.map(d => d.secondarySwellHeightFt ?? 0));
    return parseFloat((Math.max(maxPrimary, maxSecondary) * 1.1).toFixed(1));
  }, [chartData]);

  const CustomTooltip = ({ active, payload }: TooltipContentProps<number, string>) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;

      return (
        <Paper sx={{ p: 1.5, border: '1px solid #ccc' }}>
          <Typography variant="body2" fontWeight="bold">
            {new Date(d.timestamp).toLocaleString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
            })}
          </Typography>
          <Typography variant="body2" sx={{ color: '#2196f3', fontWeight: 'bold', mt: 0.5 }}>
            Primary Swell: {d.primarySwellHeightFt?.toFixed(1)}ft
          </Typography>
          {d.secondarySwellHeightFt != null && (
            <Typography variant="body2" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
              Secondary Swell: {d.secondarySwellHeightFt.toFixed(1)}ft
            </Typography>
          )}
          <Box sx={{ mt: 1, fontSize: '0.75rem', color: 'text.secondary' }}>
            <div>Period: {d.primarySwellPeriod?.toFixed(1)}s</div>
            <div>Direction: {d.primarySwellDirection?.toFixed(0)}°</div>
            <div
              style={{
                color: d.level === 'excellent' ? '#4caf50' :
                       d.level === 'good' ? '#8bc34a' :
                       d.level === 'fair' ? '#ff9800' : '#f44336',
                fontWeight: 'bold',
                marginTop: '4px',
              }}
            >
              Conditions: {d.label} ({d.score}/100)
            </div>
          </Box>
        </Paper>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading forecast...</Typography>
      </Box>
    );
  }

  if (!data?.hourly || chartData.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>No forecast data available</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Swell Height Forecast
      </Typography>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 60 }}
        >
          <defs>
            <linearGradient id="colorPrimarySwell" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2196f3" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#2196f3" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            yAxisId="left"
            domain={[0, maxHeight]}
            allowDecimals={true}
            tickCount={6}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `${parseFloat(value).toFixed(1)}ft`}
          />
          <Tooltip content={CustomTooltip} />
          <Legend />

          <ReferenceLine yAxisId="left" y={3} stroke="#4caf50" strokeDasharray="3 3" opacity={0.3} />
          <ReferenceLine yAxisId="left" y={6} stroke="#ff9800" strokeDasharray="3 3" opacity={0.3} />

          <Area
            yAxisId="left"
            type="basis"
            dataKey="primarySwellHeightFt"
            name="Primary Swell (ft)"
            stroke="#2196f3"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorPrimarySwell)"
          />
          <Line
            yAxisId="left"
            type="basis"
            dataKey="secondarySwellHeightFt"
            name="Secondary Swell (ft)"
            stroke="#4caf50"
            strokeWidth={2}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Box>
  );
};
