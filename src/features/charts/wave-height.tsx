import { LineChart } from '@mui/x-charts/LineChart';
import { useTheme } from '@mui/material';
import { formatDateHour } from 'utils/common';
import { round } from 'lodash';

interface ChartProps {
  waveHeightData: number[],
  wavePeriodData: number[],
  timeData: string[],
}

export default function WaveChart(props: ChartProps) {
  const {waveHeightData, wavePeriodData, timeData} = props
  const minWaveHeight = round(Math.min(...waveHeightData))
  const maxWaveHeight = round(Math.max(...waveHeightData))
  const minPeriod = round(Math.min(...wavePeriodData))
  const maxPeriod = round(Math.max(...wavePeriodData))
  const series = [
    {
      color: useTheme().palette.primary.main,
      yAxisKey: 'leftAxis',
      data: waveHeightData,
      label: 'wave height',
    },
    {
      color: useTheme().palette.secondary.main,
      yAxisKey: 'rightAxis',
      data: wavePeriodData,
      label: 'wave period',
    },
  ];

  return (
    <LineChart 
      height={400}
      series={series}
      yAxis={[
        { id: 'leftAxis', scaleType: 'linear', min: minWaveHeight, max: maxWaveHeight, data: waveHeightData },
        { id: 'rightAxis', scaleType: 'linear', min: minPeriod, max: maxPeriod,  data: wavePeriodData },
      ]}
      rightAxis="rightAxis"
      xAxis={[{ scaleType: 'point', data: timeData.map((item) => formatDateHour(item)) }]}
    />
  );
}