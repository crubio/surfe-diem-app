import { Box, Card, CardContent, Typography, Link } from "@mui/material"
import { WeatherResponse } from "../types"

interface WeatherWindProps {
  weatherData: WeatherResponse
  isLoading?: boolean
}

export const WeatherWind = ({ weatherData, isLoading = false }: WeatherWindProps) => {
  if (isLoading || !weatherData) {
    return null
  }

  // Extract current temperature (first item in temperature array)
  const currentTemp = weatherData.data?.temperature?.[0]
  
  // Extract current weather condition (first item in weather array)
  const currentWeather = weatherData.data?.weather?.[0] || "Clear"
  
  // Extract wind info from first text description
  const windInfo = weatherData.data?.text?.[0] || ""
  
  // Extract hazard information
  const hazards = weatherData.data?.hazard || []
  const hazardUrls = weatherData.data?.hazardUrl || []
  
  // Parse wind data from text (simple extraction)
  const windMatch = windInfo.match(/([NSEW]+)\s+wind\s+(\d+)\s+to\s+(\d+)\s+kt/)
  const windDirection = windMatch ? windMatch[1] : ""
  const windSpeedMin = windMatch ? windMatch[2] : ""
  const windSpeedMax = windMatch ? windMatch[3] : ""

  return (
    <Box>
      <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', mb: 3 }}>
        Current Weather
      </Typography>
      <Card sx={{ textAlign: 'center' }}>
        <CardContent sx={{ py: 1, px: 2 }}>
        {/* Current Temperature and Weather */}
        <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold', fontSize: '2.25rem', mb: 0.5 }}>
          {currentTemp}°F
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          {currentWeather || "Clear"}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.875rem' }}>
          {windInfo}
        </Typography>
        
        {/* Wind Information */}
        {windDirection && (
          <Box sx={{ pt: 1, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle1" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              {windDirection} wind {windSpeedMin}-{windSpeedMax} kt
            </Typography>
          </Box>
        )}
        
        {/* Hazards */}
        {hazards.length > 0 && (
          <Box sx={{ pt: 1, borderTop: 1, borderColor: 'divider' }}>
            {hazards.map((hazard: string, index: number) => (
              <Link
                key={index}
                href={hazardUrls[index] || "#"}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ 
                  display: 'block',
                  color: 'warning.main',
                  textDecoration: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}
              >
                ⚠️ {hazard}
              </Link>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
    </Box>
  )
} 