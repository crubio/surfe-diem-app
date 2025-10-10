// src/features/cards/dashboard-card.tsx
import React from 'react';
import { Card, CardContent, Chip, LinearProgress, Tooltip, Typography, Box } from '@mui/material';
import { getWaveHeightColor, getWindColor } from 'utils/conditions';
import { getWaveHeightPercentage, getWindSpeedPercentage } from 'utils/formatting';
import { Loading } from 'components';
import { NoData } from './no_data';

interface Score {
  label: string;
  color: 'success' | 'warning' | 'error' | 'info';
  description?: string;
}

interface DashboardCardProps {
  name: string;
  title: string;
  subtitle?: string;
  score?: Score;
  heightValue?: number;
  speedValue?: number;
  onClick?: () => void;
  children?: React.ReactNode;
  tooltip?: string;
  description?: string;
  isLoading?: boolean;
  isError?: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  name,
  title,
  subtitle,
  score,
  heightValue,
  speedValue,
  onClick,
  children,
  description,
  isLoading,
  isError,
}) => {
  const getSwellHeightColor = (heightValue !== undefined ? getWaveHeightColor(heightValue) : undefined);

  const cardContent = (
    <Card
      sx={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        bgcolor: 'background.paper',
        '&:hover': {
          bgcolor: (theme) =>
            theme.palette.mode === 'dark'
              ? 'rgba(255,255,255,0.04)'
              : 'rgba(0,0,0,0.02)',
        },
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" color="primary" gutterBottom>
            {title}
          </Typography>
          {score && (
            <Chip
              label={score.label}
              color={score.color}
              size="small"
              sx={{ fontWeight: 'bold' }}
            />
          )}
        </Box>

        <Typography variant="h4" component="div" sx={{ fontWeight: "bold", mb: 1 }}>
          {name}
        </Typography>

        {subtitle && (
          <Typography variant="body1" color="text.secondary" sx={{ mb: 1, fontSize: "1.4rem", fontWeight: "bold"  }}>
            {subtitle}
          </Typography>
        )}

        {heightValue !== undefined && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">Wave Height</Typography>
              <Typography variant="caption" color="text.secondary">{heightValue.toFixed(1)}ft</Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={getWaveHeightPercentage(heightValue)}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: 'rgba(0,0,0,0.1)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getSwellHeightColor
                },
              }}
            />
          </Box>
        )}

        {speedValue !== undefined && (
          <Box sx={{ mt: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">Wind Speed</Typography>
              <Typography variant="caption" color="text.secondary">{speedValue.toFixed(1)}mph</Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={getWindSpeedPercentage(speedValue)}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: 'rgba(0,0,0,0.1)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor:
                    getWindColor(speedValue)
                },
              }}
            />
          </Box>
        )}

        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {description}
          </Typography>
        )}

        {children}
      </CardContent>
    </Card>
  );

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : isError ? (
        <Card>
          <CardContent>
            <Typography variant="h6" color="text.primary" gutterBottom>
              {title}
            </Typography>
            <NoData message="No data available for this location" />
          </CardContent>
        </Card>
      ) : (
        cardContent
      )}
    </>
  )
};

export default DashboardCard;