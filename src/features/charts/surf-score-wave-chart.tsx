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
import { ForecastDataHourlyResponse } from '@features/forecasts/types';
import { getEnhancedConditionScore } from '../../utils/conditions';
import { TooltipActionPayload } from 'recharts/types/state/tooltipSlice';

interface SurfScoreTimelineProps {
  data: ForecastDataHourlyResponse | null;
  isLoading?: boolean;
}

export const SurfScoreWaveChart: React.FC<SurfScoreTimelineProps> = ({ 
  data, 
  isLoading 
}) => {
  // Transform parallel arrays into array of objects for Recharts
  const chartData = React.useMemo(() => {
    if (!data?.hourly) return [];

    const { time, swell_wave_direction, swell_wave_period, swell_wave_height, wave_height, wave_direction, wave_period } = data.hourly;

    return time.map((timestamp, index) => {
      const swellHeight = swell_wave_height[index];
      const swellPeriod = swell_wave_period[index];
      
      const conditionScore = getEnhancedConditionScore({
        swellPeriod,
        waveHeight: swellHeight,
      });
      
      // Extract numeric score from description (e.g., "Prime conditions (85/100)")
      const scoreMatch = conditionScore.description.match(/\((\d+)\/100\)/);
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 50;
      
      return {
        time: new Date(timestamp).toLocaleString('en-US', { 
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
        }),
        score,
        level: conditionScore.level,
        label: conditionScore.label,
        timestamp,
        swellWaveHeight: swellHeight,
        swellWavePeriod: swellPeriod,
        swellWaveDirection: swell_wave_direction[index],
        waveHeight: wave_height[index],
        waveDirection: wave_direction[index],
        wavePeriod: wave_period[index],
      };
    });
  }, [data]);

  // Calculate max wave height for dynamic Y-axis domain (use both swell and wave height)
  const maxHeight = React.useMemo(() => {
    if (chartData.length === 0) return 10;
    const maxSwell = Math.max(...chartData.map(d => d.swellWaveHeight));
    const maxWave = Math.max(...chartData.map(d => d.waveHeight));
    return Math.ceil(Math.max(maxSwell, maxWave) * 1.1); // Add 10% padding
  }, [chartData]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: TooltipContentProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <Paper sx={{ p: 1.5, border: '1px solid #ccc' }}>
          <Typography variant="body2" fontWeight="bold">
            {new Date(data.timestamp).toLocaleString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
            })}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#2196f3',
              fontWeight: 'bold',
              mt: 0.5
            }}
          >
            Swell Height: {data.swellWaveHeight?.toFixed(1)}ft
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#4caf50',
              fontWeight: 'bold',
            }}
          >
            Wave Height: {data.waveHeight?.toFixed(1)}ft
          </Typography>
          <Box sx={{ mt: 1, fontSize: '0.75rem', color: 'text.secondary' }}>
            <div>Swell Period: {data.swellWavePeriod?.toFixed(1)}s</div>
            <div>Swell Direction: {data.swellWaveDirection?.toFixed(0)}°</div>
            <div 
              style={{ 
                color: data.level === 'excellent' ? '#4caf50' :
                       data.level === 'good' ? '#8bc34a' :
                       data.level === 'fair' ? '#ff9800' : '#f44336',
                fontWeight: 'bold',
                marginTop: '4px'
              }}
            >
              Conditions: {data.label} ({data.score}/100)
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

  if (!data || !data.hourly || chartData.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>No forecast data available</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: 400 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Swell Height Forecast
      </Typography>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 60 }}
        >
          <defs>
            <linearGradient id="colorWaveHeight" x1="0" y1="0" x2="0" y2="1">
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
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `${value}ft`}
          />
          <Tooltip content={CustomTooltip} />
          <Legend />
          
          {/* Reference lines for common wave height ranges */}
          <ReferenceLine 
            yAxisId="left"
            y={3} 
            stroke="#4caf50" 
            strokeDasharray="3 3" 
            opacity={0.3}
          />
          <ReferenceLine 
            yAxisId="left"
            y={6} 
            stroke="#ff9800" 
            strokeDasharray="3 3" 
            opacity={0.3}
          />
          
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="swellWaveHeight"
            name="Swell Height (ft)"
            stroke="#2196f3"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorWaveHeight)"
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="waveHeight"
            name="Wave Height (ft)"
            stroke="#4caf50"
            strokeWidth={2}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Box>
  );
};