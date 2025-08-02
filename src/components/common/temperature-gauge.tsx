import React from 'react';
import { Box, Typography } from '@mui/material';

interface TemperatureGaugeProps {
  temperature: number; // Celsius
  size?: number;
  showValue?: boolean;
}

const TemperatureGauge: React.FC<TemperatureGaugeProps> = ({ 
  temperature, 
  size = 120, 
  showValue = true 
}) => {
  // Temperature zones and colors
  const zones = [
    { min: 0, max: 10, color: '#f44336', label: 'Very Cold' },    // Red
    { min: 10, max: 15, color: '#ff9800', label: 'Cold' },        // Orange
    { min: 15, max: 20, color: '#2196f3', label: 'Cool' },        // Blue
    { min: 20, max: 25, color: '#4caf50', label: 'Warm' },        // Green
    { min: 25, max: 30, color: '#ff9800', label: 'Very Warm' },   // Orange
    { min: 30, max: 35, color: '#f44336', label: 'Hot' }          // Red
  ];

  // Calculate angle for needle (0° = top, 180° = bottom)
  const minTemp = 0;
  const maxTemp = 35;
  const tempRange = maxTemp - minTemp;
  const angle = Math.max(0, Math.min(180, ((temperature - minTemp) / tempRange) * 180));

  // Gauge dimensions
  const radius = size / 2;
  const strokeWidth = size / 12;
  const centerX = radius;
  const centerY = radius;

  // Create SVG path for the gauge arc
  const startAngle = 0;
  const endAngle = 180;
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;
  
  const x1 = centerX + radius * Math.cos(startRad);
  const y1 = centerY - radius * Math.sin(startRad);
  const x2 = centerX + radius * Math.cos(endRad);
  const y2 = centerY - radius * Math.sin(endRad);
  
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
  const arcPath = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${x2} ${y2}`;

  // Create zone arcs
  const createZoneArc = (startTemp: number, endTemp: number) => {
    const startAngle = ((startTemp - minTemp) / tempRange) * 180;
    const endAngle = ((endTemp - minTemp) / tempRange) * 180;
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    
    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY - radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY - radius * Math.sin(endRad);
    
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${x2} ${y2}`;
  };

  // Calculate needle position
  const needleAngle = (angle * Math.PI) / 180;
  const needleLength = radius * 0.8;
  const needleX = centerX + needleLength * Math.cos(needleAngle);
  const needleY = centerY - needleLength * Math.sin(needleAngle);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box sx={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background circle */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            stroke="rgba(0,0,0,0.1)"
            strokeWidth={strokeWidth}
          />
          
          {/* Temperature zones */}
          {zones.map((zone, index) => (
            <path
              key={index}
              d={createZoneArc(zone.min, zone.max)}
              fill="none"
              stroke={zone.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              opacity={0.7}
            />
          ))}
          
          {/* Needle */}
          <line
            x1={centerX}
            y1={centerY}
            x2={needleX}
            y2={needleY}
            stroke="#333"
            strokeWidth={3}
            strokeLinecap="round"
          />
          
          {/* Needle center point */}
          <circle
            cx={centerX}
            cy={centerY}
            r={4}
            fill="#333"
          />
        </svg>
        
        {/* Temperature value overlay */}
        {showValue && (
          <Box
            sx={{
              position: 'absolute',
              bottom: size * 0.15,
              left: '50%',
              transform: 'translateX(-50%)',
              textAlign: 'center'
            }}
          >
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                fontWeight: 'bold',
                color: 'text.primary',
                textShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}
            >
              {temperature.toFixed(1)}°C
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default TemperatureGauge; 