// src/features/cards/dashboard-card.tsx
import React from 'react';
import { Card, CardContent, Chip, Typography, Box, useTheme } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
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
  waveDirection?: string;
  wavePeriod?: string;
  /** Wind readout, shown on its own line under the height/direction/period line, e.g. "8 mph wind". */
  wind?: string;
  onClick?: () => void;
  children?: React.ReactNode;
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
  waveDirection,
  wavePeriod,
  wind,
  onClick,
  children,
  description,
  isLoading,
  isError,
  inverted = false,
}) => {
  const theme = useTheme();

  const colors = inverted ? {
    cardBg: `linear-gradient(155deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    title: 'rgba(255,255,255,0.8)',
    name: 'white',
    subtitle: 'rgba(255,255,255,0.9)',
    caption: 'rgba(255,255,255,0.6)',
    description: 'rgba(255,255,255,0.7)',
    chip: { backgroundColor: 'rgba(255,255,255,0.18)', color: 'white' },
  } : {
    cardBg: undefined,
    title: theme.palette.primary.main,
    name: theme.palette.text.primary,
    subtitle: theme.palette.text.primary,
    caption: theme.palette.text.secondary,
    description: theme.palette.text.secondary,
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

        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', mb: 1, fontSize: '2rem', color: colors.name }}>
          {name}
        </Typography>

        {subtitle && (
          <Typography variant="h6" sx={{ mb: 1, fontSize: '1.5rem', fontWeight: 'bold', color: colors.subtitle }}>
            {subtitle} {waveDirection && `• ${waveDirection}`} {wavePeriod && `• ${wavePeriod}`}
          </Typography>
        )}

        {wind && (
          <Typography variant="body1" sx={{ mb: 1, fontWeight: 600, color: colors.subtitle }}>
            {wind}
          </Typography>
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
