import { Box, Chip, Typography, useTheme } from '@mui/material';
import { WeatherResponse } from '../types';
import { parseForecastNarrative } from '../utils';

interface WeatherInlineProps {
  weatherData: WeatherResponse | undefined;
  isLoading?: boolean;
}

/**
 * Condensed single-line weather readout — the de-emphasised replacement for
 * the standalone `WeatherWind` card inside `SpotMetricBar`. See
 * .docs/forecast-spot-plan.md §3.D1.
 */
export const WeatherInline = ({ weatherData, isLoading }: WeatherInlineProps) => {
  const theme = useTheme();

  if (isLoading || !weatherData) return null;

  const temp = weatherData.data?.temperature?.[0];
  const { wind, sky } = parseForecastNarrative(weatherData.data?.text?.[0]);
  const hazards = weatherData.data?.hazard ?? [];
  const hazardUrls = weatherData.data?.hazardUrl ?? [];

  const parts = [temp ? `${temp}°F` : null, sky, wind].filter((v): v is string => !!v);
  if (!parts.length) return null;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
      <Typography sx={{ fontSize: '0.8125rem', color: theme.palette.text.secondary }}>
        <Box component="span" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
          Weather
        </Box>{' '}
        · {parts.join(' · ')}
      </Typography>
      {hazards.map((hazard, i) => (
        <Chip
          key={hazard + i}
          label={`⚠ ${hazard}`}
          size="small"
          component={hazardUrls[i] ? 'a' : 'div'}
          href={hazardUrls[i] || undefined}
          target={hazardUrls[i] ? '_blank' : undefined}
          rel={hazardUrls[i] ? 'noopener noreferrer' : undefined}
          clickable={!!hazardUrls[i]}
          sx={{
            height: 20,
            fontSize: '0.7rem',
            fontWeight: 600,
            backgroundColor: 'rgba(255,152,0,0.1)',
            color: theme.palette.warning.main,
            border: '1px solid rgba(255,152,0,0.25)',
          }}
        />
      ))}
    </Box>
  );
};
