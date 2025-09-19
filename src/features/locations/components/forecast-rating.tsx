import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Fade,
  Stack,
  LinearProgress,
} from '@mui/material';
import { CheckCircle, Cancel, ThumbUp, ThumbDown } from '@mui/icons-material';
import { useSpotRating } from '../../../hooks/useSpotRating';
import type { ForecastRatingValue } from '../api/forecast-rating';

interface ForecastRatingProps {
  spotId: number;
  spotSlug: string;
  spotName: string;
  forecastData: Record<string, any>;
  className?: string;
}

export const ForecastRatingComponent: React.FC<ForecastRatingProps> = ({
  spotId,
  spotSlug,
  spotName,
  forecastData,
  className,
}) => {
  const [showThankYou, setShowThankYou] = useState(false);

  const {
    submitRating,
    isLoading,
    error,
    isSuccess,
  } = useSpotRating({
    spotId,
    spotSlug,
    spotName,
  });

  useEffect(() => {
    if (isSuccess) {
      setShowThankYou(true);
      const timer = setTimeout(() => setShowThankYou(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  const handleRating = (rating: ForecastRatingValue) => {
    if (isSuccess || isLoading) return;

    submitRating({
      rating,
      forecastData,
    });
  };

  // Check if user has already rated (either success or already_rated error)
  const hasAlreadyRated = isSuccess || (error && (error as any).code === 'ALREADY_RATED');

  return (
    <Box className={className}>
      <Card elevation={1} sx={{ backgroundColor: 'background.paper', display: 'inline-block' }}>
        <CardContent sx={{ py: 2, px: 3, '&:last-child': { pb: 2 } }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 0.5 }}>
                Was this forecast accurate?
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Help us improve our forecasts
              </Typography>
            </Box>

            {isLoading && (
              <Box sx={{ width: 100 }}>
                <LinearProgress />
              </Box>
            )}

            {!hasAlreadyRated && !isLoading && (
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  startIcon={<ThumbUp />}
                  onClick={() => handleRating('accurate')}
                  disabled={isLoading}
                  size="small"
                  sx={{ 
                    minWidth: 'auto',
                    px: 2,
                    backgroundColor: 'primary.main', 
                    '&:hover': { backgroundColor: 'primary.dark' }
                  }}
                >
                  Yes
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<ThumbDown />}
                  onClick={() => handleRating('not_accurate')}
                  disabled={isLoading}
                  size="small"
                  sx={{ 
                    minWidth: 'auto',
                    px: 2,
                    borderColor: 'secondary.main',
                    color: 'secondary.main',
                    '&:hover': { 
                      borderColor: 'secondary.dark',
                      backgroundColor: 'rgba(211, 47, 47, 0.04)'
                    }
                  }}
                >
                  No
                </Button>
              </Stack>
            )}

            {isSuccess && !showThankYou && (
              <Typography variant="caption" color="success.main" sx={{ fontWeight: 500 }}>
                ✓ Thanks for rating!
              </Typography>
            )}

            {error && (error as any).code === 'ALREADY_RATED' && (
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                ✓ Already rated
              </Typography>
            )}
          </Stack>

          {showThankYou && (
            <Fade in={showThankYou}>
              <Alert 
                severity="success" 
                icon={<CheckCircle />}
                sx={{ mt: 2, py: 1 }}
              >
                <Typography variant="body2">
                  Thank you for your feedback! This helps us improve our forecasts.
                </Typography>
              </Alert>
            </Fade>
          )}

          {error && (error as any).code !== 'ALREADY_RATED' && (
            <Alert 
              severity="error" 
              icon={<Cancel />}
              sx={{ mt: 2, py: 1 }}
            >
              <Typography variant="body2">
                Failed to submit rating. Please try again later.
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ForecastRatingComponent;
