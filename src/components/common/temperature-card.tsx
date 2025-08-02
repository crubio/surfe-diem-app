import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { getWaterTempColor, getWaterTempQualityDescription, getWaterTempComfortLevel } from 'utils/water-temp';

interface TemperatureCardProps {
  temperature: number; // Celsius
  showFahrenheit?: boolean;
  showComfortLevel?: boolean;
}

const TemperatureCard: React.FC<TemperatureCardProps> = ({ 
  temperature, 
  showFahrenheit = true,
  showComfortLevel = true
}) => {
  const tempColor = getWaterTempColor(temperature);
  const qualityDescription = getWaterTempQualityDescription(temperature);
  const comfortLevel = getWaterTempComfortLevel(temperature);
  
  // Format temperature
  const formatTemp = (temp: number, unit: 'C' | 'F') => {
    if (unit === 'F') {
      const tempF = (temp * 9/5) + 32;
      return `${tempF.toFixed(1)}°F`;
    }
    return `${temp.toFixed(1)}°C`;
  };

  // Get color values for styling
  const getColorValue = (color: string) => {
    switch (color) {
      case 'success': return '#4caf50';
      case 'warning': return '#ff9800';
      case 'error': return '#f44336';
      case 'info': return '#2196f3';
      default: return '#757575';
    }
  };

  const colorValue = getColorValue(tempColor);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 120,
        p: 2,
        borderRadius: 2,
        background: `linear-gradient(135deg, ${colorValue}15 0%, ${colorValue}08 100%)`,
        border: `2px solid ${colorValue}30`,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `linear-gradient(90deg, ${colorValue} 0%, ${colorValue}80 100%)`,
        }
      }}
    >
      {/* Small visual indicator - temperature zone indicator */}
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          width: 12,
          height: 12,
          borderRadius: '50%',
          backgroundColor: colorValue,
          opacity: 0.8,
          boxShadow: `0 0 8px ${colorValue}40`
        }}
      />

      {/* Primary: Large temperature display */}
      <Typography 
        variant="h2" 
        component="div" 
        sx={{ 
          fontWeight: 'bold',
          color: colorValue,
          textShadow: `0 2px 4px ${colorValue}20`,
          mb: 0.5,
          fontSize: { xs: '2.5rem', sm: '3rem' }
        }}
      >
        {showFahrenheit ? formatTemp(temperature, 'F') : formatTemp(temperature, 'C')}
      </Typography>

      {/* Secondary: Celsius and comfort info */}
      <Typography 
        variant="body1" 
        color="text.secondary" 
        sx={{ 
          mb: 1,
          textAlign: 'center',
          fontSize: '0.9rem'
        }}
      >
        {showFahrenheit ? formatTemp(temperature, 'C') : formatTemp(temperature, 'F')}
        {showComfortLevel && ` • ${comfortLevel}`}
      </Typography>

      {/* Quality chip */}
      <Chip 
        label={qualityDescription}
        color={tempColor}
        size="small"
        sx={{ 
          fontWeight: 'bold',
          fontSize: '0.75rem',
          height: 24
        }}
      />

      {/* Subtle background pattern */}
      <Box
        sx={{
          position: 'absolute',
          bottom: -10,
          right: -10,
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${colorValue}10 0%, transparent 70%)`,
          opacity: 0.6
        }}
      />
    </Box>
  );
};

export default TemperatureCard; 