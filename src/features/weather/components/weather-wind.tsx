import { Box, Chip, Link, Paper, Typography, useTheme } from "@mui/material"
import { useColorMode } from 'providers/theme-provider'
import { colorTokens } from 'config/theme'
import { WeatherResponse } from "../types"

interface WeatherWindProps {
  weatherData: WeatherResponse
  isLoading?: boolean
}

export const WeatherWind = ({ weatherData, isLoading = false }: WeatherWindProps) => {
  const theme = useTheme()
  const { mode } = useColorMode()
  const tokens = colorTokens[mode]

  if (isLoading || !weatherData) return null

  const currentTemp = weatherData.data?.temperature?.[0]
  const currentWeather = weatherData.data?.weather?.[0] || "Clear"
  const windInfo = weatherData.data?.text?.[0] || ""
  const hazards = weatherData.data?.hazard || []
  const hazardUrls = weatherData.data?.hazardUrl || []

  const feelsLike = weatherData.currentobservation?.AirTemp
  const uvIndex = null // not in API response currently

  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: tokens.textTertiary,
          mb: 1.5,
        }}
      >
        Current Weather
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.5 }}>
        <Typography
          sx={{
            fontFamily: '"Bricolage Grotesque", Inter, sans-serif',
            fontWeight: 700,
            fontSize: 72,
            letterSpacing: '-0.04em',
            lineHeight: 1,
            color: tokens.accentDark,
          }}
        >
          {currentTemp ? `${currentTemp}°F` : '—'}
        </Typography>
      </Box>

      <Typography sx={{ fontSize: 15, color: theme.palette.text.primary, mb: 0.5 }}>
        {currentWeather}
      </Typography>

      {feelsLike && (
        <Typography sx={{ fontSize: 13, color: theme.palette.text.secondary, mb: 1.5 }}>
          Feels like {feelsLike}°
          {uvIndex !== null ? ` · UV ${uvIndex} of 10` : ''}
        </Typography>
      )}

      {windInfo && (
        <Typography sx={{ fontSize: 13, color: theme.palette.text.secondary, mb: 1.5, lineHeight: 1.5 }}>
          {windInfo}
        </Typography>
      )}

      {hazards.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
          {hazards.map((hazard: string, index: number) => (
            <Chip
              key={index}
              label={`⚠ ${hazard}`}
              size="small"
              component={hazardUrls[index] ? Link : 'div'}
              href={hazardUrls[index] || undefined}
              target={hazardUrls[index] ? '_blank' : undefined}
              rel={hazardUrls[index] ? 'noopener noreferrer' : undefined}
              clickable={!!hazardUrls[index]}
              sx={{
                backgroundColor: 'rgba(255,152,0,0.1)',
                color: theme.palette.warning.main,
                fontWeight: 600,
                fontSize: 11,
                border: `1px solid rgba(255,152,0,0.25)`,
              }}
            />
          ))}
        </Box>
      )}
    </Paper>
  )
}
