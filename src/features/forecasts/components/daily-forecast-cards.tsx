import { Box, Paper, Typography, useTheme } from '@mui/material';
import { useColorMode } from 'providers/theme-provider';
import { colorTokens } from 'config/theme';
import { getSwellDirectionText } from 'utils/swell';
import { formatNoaaTime12h } from '@features/tides/utils';
import type { DailyForecastDay } from '../utils/build-daily-forecast';

interface DailyForecastCardsProps {
  days: DailyForecastDay[];
  /** undefined = still resolving the tide station; false = no usable station nearby. */
  tideAvailable?: boolean;
  isLoading?: boolean;
}

/**
 * Text-based multi-day forecast — a card per day, dense by design (this is the
 * "simplify" ask, not a second hero widget). Desktop: a grid, one column per
 * day. Mobile: a horizontal scroll-snap strip.
 */
export const DailyForecastCards = ({ days, tideAvailable = true, isLoading }: DailyForecastCardsProps) => {
  const theme = useTheme();
  const { mode } = useColorMode();
  const tokens = colorTokens[mode];

  if (isLoading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography color="text.secondary">Loading 5-day forecast...</Typography>
      </Paper>
    );
  }

  if (!days.length) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography color="text.secondary">No multi-day forecast available.</Typography>
      </Paper>
    );
  }

  return (
    <Box
      sx={{
        display: { xs: 'flex', md: 'grid' },
        gridTemplateColumns: { md: `repeat(${days.length}, 1fr)` },
        gap: 1.5,
        overflowX: { xs: 'auto', md: 'visible' },
        scrollSnapType: { xs: 'x mandatory', md: 'none' },
        pb: { xs: 1, md: 0 },
      }}
    >
      {days.map((day) => (
        <Paper
          key={day.dateKey}
          sx={{
            p: 2.25,
            minWidth: { xs: '78%', sm: '45%', md: 0 },
            flex: { xs: '0 0 auto', md: 'initial' },
            scrollSnapAlign: 'start',
          }}
        >
          {/* Day + date */}
          <Typography
            sx={{
              fontFamily: '"Bricolage Grotesque", Inter, sans-serif',
              fontWeight: 700,
              fontSize: '0.9375rem',
              mb: 0.25,
            }}
          >
            {day.dayLabel}
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: tokens.textTertiary, mb: 1.5 }}>
            {day.shortDate}
          </Typography>

          {/* Primary swell — peak height + time, period, direction */}
          {day.primary.peakFt != null ? (
            <Box sx={{ mb: 1.25 }}>
              <Typography
                sx={{
                  fontFamily: '"Bricolage Grotesque", Inter, sans-serif',
                  fontWeight: 700,
                  fontSize: '1.5rem',
                  letterSpacing: '-0.03em',
                  lineHeight: 1,
                  color: tokens.accentDark,
                }}
              >
                {day.primary.peakFt.toFixed(1)}
                <Box component="span" sx={{ fontSize: '0.875rem', fontWeight: 500, ml: 0.4, color: tokens.textTertiary }}>
                  ft
                </Box>
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary, mt: 0.25 }}>
                {day.primary.peakTime ? `@ ${day.primary.peakTime.toFormat('h a')}` : ''}
                {day.primary.periodS != null ? ` · ${Math.round(day.primary.periodS)}s` : ''}
                {day.primary.directionDeg != null ? ` · ${getSwellDirectionText(day.primary.directionDeg)}` : ''}
              </Typography>
            </Box>
          ) : (
            <Typography sx={{ fontSize: '0.8125rem', color: tokens.textTertiary, mb: 1.25 }}>
              No swell data
            </Typography>
          )}

          {/* Secondary swell + wvht */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1.5 }}>
            {day.secondaryMaxFt != null && day.secondaryMaxFt > 0.5 && (
              <Typography sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary }}>
                Secondary <strong>{day.secondaryMaxFt.toFixed(1)} ft</strong>
              </Typography>
            )}
            {day.wvht.minFt != null && day.wvht.maxFt != null && (
              <Typography sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary }}>
                Wave height (wvht) <strong>{day.wvht.minFt.toFixed(1)}–{day.wvht.maxFt.toFixed(1)} ft</strong>
              </Typography>
            )}
          </Box>

          {/* Tide */}
          <Box sx={{ pt: 1.25, borderTop: `1px solid ${tokens.rule}`, display: 'flex', flexDirection: 'column', gap: 0.4 }}>
            {!tideAvailable ? (
              <Typography sx={{ fontSize: '0.75rem', color: tokens.textTertiary }}>Tide unavailable</Typography>
            ) : day.tides.length ? (
              day.tides.map((tide, i) => (
                <Typography key={i} sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary }}>
                  {tide.type === 'H' ? 'High' : 'Low'} {tide.ft.toFixed(1)} ft · {formatNoaaTime12h(tide.time)}
                </Typography>
              ))
            ) : (
              <Typography sx={{ fontSize: '0.75rem', color: tokens.textTertiary }}>No tide events</Typography>
            )}
          </Box>
        </Paper>
      ))}
    </Box>
  );
};
