import { LineChart } from '@mui/x-charts/LineChart';
import { useTheme } from '@mui/material';
import { formatDateHour } from 'utils/common';
import { round } from 'lodash';

interface ChartProps {
  waveHeightData: number[],
  wavePeriodData: number[],
  timeData: string[],
  tideData?: {
    predictions: {
      t: string;
      v: string;
      type: string;
    }[];
  },
}

// Interpolate tide data to match hourly wave forecast timeline
export const interpolateTideData = (tidePredictions: { t: string; v: string; type: string }[], waveTimeData: string[]): number[] => {
  if (!tidePredictions.length || !waveTimeData.length) return [];
  
  // Convert tide predictions to timestamps and values
  const tidePoints = tidePredictions.map(p => ({
    time: new Date(p.t).getTime(),
    value: parseFloat(p.v)
  }));
  
  // Convert wave time data to timestamps
  const waveTimes = waveTimeData.map(t => new Date(t).getTime());
  
  // Interpolate tide values for each wave timestamp
  return waveTimes.map(waveTime => {
    // Find the two tide points that bracket this wave time
    let beforePoint = null;
    let afterPoint = null;
    
    for (let i = 0; i < tidePoints.length - 1; i++) {
      if (waveTime >= tidePoints[i].time && waveTime <= tidePoints[i + 1].time) {
        beforePoint = tidePoints[i];
        afterPoint = tidePoints[i + 1];
        break;
      }
    }
    
    // If wave time is before first tide point, use first two points
    if (!beforePoint && waveTime < tidePoints[0].time && tidePoints.length >= 2) {
      beforePoint = tidePoints[0];
      afterPoint = tidePoints[1];
    }
    
    // If wave time is after last tide point, use last two points
    if (!beforePoint && waveTime > tidePoints[tidePoints.length - 1].time && tidePoints.length >= 2) {
      beforePoint = tidePoints[tidePoints.length - 2];
      afterPoint = tidePoints[tidePoints.length - 1];
    }
    
    // Linear interpolation
    if (beforePoint && afterPoint) {
      const timeDiff = afterPoint.time - beforePoint.time;
      const valueDiff = afterPoint.value - beforePoint.value;
      const timeRatio = (waveTime - beforePoint.time) / timeDiff;
      return beforePoint.value + (valueDiff * timeRatio);
    }
    
    // Fallback: use closest tide point
    const closestPoint = tidePoints.reduce((closest, point) => {
      return Math.abs(point.time - waveTime) < Math.abs(closest.time - waveTime) ? point : closest;
    });
    return closestPoint.value;
  });
};

export default function WaveChart(props: ChartProps) {
  const {waveHeightData, wavePeriodData, timeData, tideData} = props
  const theme = useTheme();
  
  const minWaveHeight = round(Math.min(...waveHeightData))
  const maxWaveHeight = round(Math.max(...waveHeightData))
  const minPeriod = round(Math.min(...wavePeriodData))
  const maxPeriod = round(Math.max(...wavePeriodData))
  
  // Process tide data if available
  let tideSeries = null;
  let minTide = 0;
  let maxTide = 0;
  
  if (tideData && tideData.predictions.length > 0) {
    const interpolatedTideValues = interpolateTideData(tideData.predictions, timeData);
    minTide = round(Math.min(...interpolatedTideValues));
    maxTide = round(Math.max(...interpolatedTideValues));
    
    tideSeries = {
      color: theme.palette.success.main,
      yAxisKey: 'tideAxis',
      data: interpolatedTideValues,
      label: 'tide level',
    };
  }
  
  const series = [
    {
      color: theme.palette.primary.main,
      yAxisKey: 'leftAxis',
      data: waveHeightData,
      label: 'wave height',
    },
    {
      color: theme.palette.secondary.main,
      yAxisKey: 'rightAxis',
      data: wavePeriodData,
      label: 'wave period',
    },
    ...(tideSeries ? [tideSeries] : []),
  ];

  const yAxis = [
    { id: 'leftAxis', scaleType: 'linear' as const, min: minWaveHeight, max: maxWaveHeight, data: waveHeightData, label: 'Wave Height (ft)' },
    { id: 'rightAxis', scaleType: 'linear' as const, min: minPeriod, max: maxPeriod, data: wavePeriodData, label: 'Wave Period (s)' },
    ...(tideSeries ? [{ id: 'tideAxis', scaleType: 'linear' as const, min: minTide, max: maxTide, data: tideSeries.data, label: 'Tide Level (ft)' }] : []),
  ];

  return (
    <LineChart 
      height={400}
      series={series}
      yAxis={yAxis}
      rightAxis="rightAxis"
      xAxis={[{ scaleType: 'point', data: timeData.map((item) => formatDateHour(item)) }]}
    />
  );
}