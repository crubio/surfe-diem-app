// src/features/cards/dashboard-card.tsx
import React from 'react';
import { Card, CardContent, Chip, LinearProgress, Tooltip, Typography, Box, useTheme } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { getWaveHeightColor, getWindColor } from 'utils/conditions';
import { getWaveHeightPercentage, getWindSpeedPercentage } from 'utils/formatting';
import { Loading } from 'components';

interface Score {
  label: string;
  color: 'success' | 'warning' | 'error' | 'info';
  description?: string;
}

interface DashboardCardProps {
  name: string;
  title: string;
  subtitle?: string | number;
  score?: Score;
  heightValue?: number;
  speedValue?: number;
  waveDirection?: string;
  wavePeriod?: string;
  onClick?: () => void;
  children?: React.ReactNode;
  tooltip?: string;
  description?: string;
  isLoading?: boolean;
  isError?: boolean;
  inverted?: boolean;
}

const NoData: React.FC<{ message: string }> = ({ message }) => (
  <Box sx={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    minHeight: '200px',
    gap: 1.5,
    py: 3
  }}>
    <ErrorOutlineIcon sx={{ fontSize: '2.5rem', color: 'text.secondary', opacity: 0.6 }} />
    <Typography variant="body1" color="text.secondary" align="center">
      {message}
    </Typography>
  </Box>
);

const DashboardCard: React.FC<DashboardCardProps> = ({
  name,
  title,
  subtitle,
  score,
  heightValue,
  speedValue,
  waveDirection,
  wavePeriod,
  onClick,
  children,
  description,
  isLoading,
  isError,
  inverted = false,
}) => {
  const theme = useTheme();
  const waveBarColor = heightValue !== undefined ? getWaveHeightColor(heightValue) : undefined;

  const colors = inverted ? {
    cardBg: `linear-gradient(155deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    title: 'rgba(255,255,255,0.8)',
    name: 'white',
    subtitle: 'rgba(255,255,255,0.9)',
    caption: 'rgba(255,255,255,0.6)',
    description: 'rgba(255,255,255,0.7)',
    progressBg: 'rgba(255,255,255,0.2)',
    progressBar: (_: string | undefined) => 'rgba(255,255,255,0.8)',
    chip: { backgroundColor: 'rgba(255,255,255,0.18)', color: 'white' },
  } : {
    cardBg: undefined,
    title: theme.palette.primary.main,
    name: theme.palette.text.primary,
    subtitle: theme.palette.text.primary,
    caption: theme.palette.text.secondary,
    description: theme.palette.text.secondary,
    progressBg: 'rgba(0,0,0,0.1)',
    progressBar: (bar: string | undefined) => bar,
    chip: {},
  };

  const cardContent = (
    <Card
      sx={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        ...(inverted ? {
          background: colors.cardBg,
          '&:hover': { filter: 'brightness(1.05)' },
        } : {
          bgcolor: 'background.paper',
          '&:hover': {
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
          },
        }),
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" gutterBottom sx={{ color: colors.title }}>
            {title}
          </Typography>
          {score && (
            <Chip
              label={score.label}
              color={score.color}
              size="small"
              sx={{ fontWeight: 'bold', ...colors.chip }}
            />
          )}
        </Box>

        <Typography variant="h1" component="div" sx={{ fontWeight: 'bold', mb: 1, fontSize: '1.8rem', color: colors.name }}>
          {name}
        </Typography>

        {subtitle && (
          <Typography variant="h2" sx={{ mb: 1, fontSize: '1.6rem', fontWeight: 'bold', color: colors.subtitle }}>
            {subtitle} {waveDirection && `• ${waveDirection}`} {wavePeriod && `• ${wavePeriod}`}
          </Typography>
        )}

        {heightValue !== undefined && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" sx={{ color: colors.caption }}>Wave Height</Typography>
              <Typography variant="caption" sx={{ color: colors.caption }}>{heightValue.toFixed(1)}ft</Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={getWaveHeightPercentage(heightValue)}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: colors.progressBg,
                '& .MuiLinearProgress-bar': {
                  backgroundColor: colors.progressBar(waveBarColor),
                },
              }}
            />
          </Box>
        )}

        {speedValue !== undefined && (
          <Box sx={{ mt: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" sx={{ color: colors.caption }}>Wind Speed</Typography>
              <Typography variant="caption" sx={{ color: colors.caption }}>{speedValue}mph</Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={getWindSpeedPercentage(speedValue)}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: colors.progressBg,
                '& .MuiLinearProgress-bar': {
                  backgroundColor: colors.progressBar(getWindColor(speedValue)),
                },
              }}
            />
          </Box>
        )}

        {description && (
          <Typography variant="body2" sx={{ mt: 1, color: colors.description }}>
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
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <NoData message="No data available" />
          </CardContent>
        </Card>
      ) : (
        cardContent
      )}
    </>
  )
};

export default DashboardCard;
