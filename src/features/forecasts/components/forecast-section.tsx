import { useState, type MouseEvent } from 'react';
import { Box, ToggleButton, ToggleButtonGroup, useMediaQuery, useTheme } from '@mui/material';
import { useColorMode } from 'providers/theme-provider';
import { colorTokens } from 'config/theme';
import { SurfScoreWaveChart } from '@features/charts/surf-score-wave-chart';
import type { TideChartPoint } from '@features/tides/api/tide-explorer';
import type { TransformedNWSForecast } from 'hooks/useNWSForecast';
import { DailyForecastCards } from './daily-forecast-cards';
import type { DailyForecastDay } from '../utils/build-daily-forecast';

const VIEW_STORAGE_KEY = 'forecast-view';
type ForecastView = 'chart' | 'list';

const readStoredView = (): ForecastView => {
  try {
    const stored = window.localStorage.getItem(VIEW_STORAGE_KEY);
    return stored === 'chart' || stored === 'list' ? stored : 'chart';
  } catch {
    // localStorage can throw (private browsing, disabled site data) — fall back quietly.
    return 'chart';
  }
};

interface ForecastSectionProps {
  nwsData: TransformedNWSForecast | null;
  isNWSLoading: boolean;
  dailyForecastDays: DailyForecastDay[];
  isDailyForecastLoading: boolean;
  /** undefined = tide station lookup still in flight; false = no usable station nearby. */
  tideAvailable?: boolean;
  tideChartSeries?: TideChartPoint[];
  /** Spot's IANA timezone, forwarded to the chart so its day/hour bucketing matches the tide join. */
  timezone?: string;
}

/**
 * Owns the chart ↔ 5-day-list layout: both are shown together on desktop, and
 * toggled on mobile (locked decision, see .docs/forecast-spot-plan.md §3.C / §5.6).
 * The mobile view choice is persisted so it sticks across visits (§5.8).
 */
export const ForecastSection = ({
  nwsData,
  isNWSLoading,
  dailyForecastDays,
  isDailyForecastLoading,
  tideAvailable,
  tideChartSeries,
  timezone,
}: ForecastSectionProps) => {
  const theme = useTheme();
  const { mode } = useColorMode();
  const tokens = colorTokens[mode];
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const [view, setView] = useState<ForecastView>(readStoredView);

  const handleViewChange = (_event: MouseEvent<HTMLElement>, next: ForecastView | null) => {
    if (!next) return;
    setView(next);
    try {
      window.localStorage.setItem(VIEW_STORAGE_KEY, next);
    } catch {
      // ignore — see readStoredView
    }
  };

  const chart = (
    <SurfScoreWaveChart
      data={nwsData}
      isLoading={isNWSLoading}
      height={250}
      tideSeries={tideAvailable ? tideChartSeries : undefined}
      timezone={timezone}
    />
  );

  const dailyCards = (
    <DailyForecastCards
      days={dailyForecastDays}
      isLoading={isDailyForecastLoading}
      tideAvailable={tideAvailable}
    />
  );

  if (isDesktop) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {chart}
        {dailyCards}
      </Box>
    );
  }

  return (
    <Box>
      <ToggleButtonGroup
        value={view}
        exclusive
        onChange={handleViewChange}
        size="small"
        fullWidth
        sx={{
          mb: 1.5,
          '& .MuiToggleButton-root': {
            borderRadius: '999px !important',
            border: `1px solid ${tokens.rule} !important`,
            fontSize: 12,
            fontWeight: 700,
            py: 0.75,
            color: tokens.textTertiary,
            '&.Mui-selected': {
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              '&:hover': { backgroundColor: theme.palette.primary.dark },
            },
          },
        }}
      >
        <ToggleButton value="chart">Chart</ToggleButton>
        <ToggleButton value="list">5-day</ToggleButton>
      </ToggleButtonGroup>
      {view === 'chart' ? chart : dailyCards}
    </Box>
  );
};
