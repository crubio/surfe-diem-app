import React, { useState, useEffect } from 'react';
import { Alert, Box, Button, Fade, LinearProgress, Typography } from '@mui/material';
import { Cancel, CheckCircle, ThumbDown, ThumbUp } from '@mui/icons-material';
import { useSpotRating } from '../../../hooks/useSpotRating';
import type { ForecastRatingValue } from '../api/forecast-rating';

interface ForecastRatingProps {
  spotId: number;
  spotSlug: string;
  spotName: string;
  forecastData: Record<string, any>;
}

export const ForecastRatingComponent: React.FC<ForecastRatingProps> = ({
  spotId,
  spotSlug,
  spotName,
  forecastData,
}) => {
  const [showThankYou, setShowThankYou] = useState(false);
  const { submitRating, isLoading, error, isSuccess } = useSpotRating({ spotId, spotSlug, spotName });

  useEffect(() => {
    if (isSuccess) {
      setShowThankYou(true);
      const timer = setTimeout(() => setShowThankYou(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  const handleRating = (rating: ForecastRatingValue) => {
    if (isSuccess || isLoading) return;
    submitRating({ rating, forecastData });
  };

  const hasAlreadyRated = isSuccess || (error && (error as any).code === 'ALREADY_RATED');

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
      <Box>
        <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
          Was this forecast accurate?
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Your feedback trains the Surfe Diem Model.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {isLoading && <LinearProgress sx={{ width: 80 }} />}

        {!hasAlreadyRated && !isLoading && (
          <>
            <Button
              variant="contained"
              size="small"
              startIcon={<ThumbUp />}
              onClick={() => handleRating('accurate')}
              sx={{
                borderRadius: '999px',
                px: 2,
                py: 0.75,
                fontWeight: 600,
                backgroundColor: 'primary.main',
                '&:hover': { backgroundColor: 'primary.dark' },
              }}
            >
              Yes
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ThumbDown />}
              onClick={() => handleRating('not_accurate')}
              sx={{
                borderRadius: '999px',
                px: 2,
                py: 0.75,
                fontWeight: 600,
                borderColor: 'secondary.main',
                color: 'secondary.main',
                '&:hover': { borderColor: 'secondary.dark', backgroundColor: 'rgba(211,47,47,0.04)' },
              }}
            >
              No
            </Button>
          </>
        )}

        {(isSuccess || (error && (error as any).code === 'ALREADY_RATED')) && (
          <Typography variant="caption" color="success.main" sx={{ fontWeight: 500 }}>
            ✓ {isSuccess ? 'Thanks for rating!' : 'Already rated'}
          </Typography>
        )}
      </Box>

      {showThankYou && (
        <Fade in={showThankYou}>
          <Alert severity="success" icon={<CheckCircle />} sx={{ width: '100%', py: 1 }}>
            Thank you for your feedback! This helps us improve our forecasts.
          </Alert>
        </Fade>
      )}

      {error && (error as any).code !== 'ALREADY_RATED' && (
        <Alert severity="error" icon={<Cancel />} sx={{ width: '100%', py: 1 }}>
          Failed to submit rating. Please try again later.
        </Alert>
      )}
    </Box>
  );
};

export default ForecastRatingComponent;
