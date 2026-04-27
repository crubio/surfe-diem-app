import { Box, Chip, Divider, Paper, Tooltip, Typography } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { MLForecastResponse } from '@/types';

interface MLForecastCardProps {
  data: MLForecastResponse;
}

export const MLForecastCard = ({ data }: MLForecastCardProps) => {
  const observed = data.wave_data.observed_wave_height[0];
  const predicted = data.wave_data.predicted_wave_height[0];

  if (!observed && !predicted) return null;

  return (
    <Paper
      variant="outlined"
      sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, px: 3, py: 2, gap: 2 }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
          Surfe Diem Model
        </Typography>
        <Chip label="BETA" size="small" color="primary" variant="outlined" sx={{ height: 18, fontSize: '0.65rem' }} />
        <Tooltip
          title="Wave height forecast from the Surfe Diem ML model, trained on NDBC buoy observations. Only available at select spots."
          placement="right"
          arrow
        >
          <InfoOutlinedIcon sx={{ fontSize: '0.95rem', color: 'text.disabled', cursor: 'help' }} />
        </Tooltip>
      </Box>

      <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />

      <Tooltip
        title="Significant wave height is approximately equal to the average of the highest one-third of the waves, as measured from the trough to the crest of the waves."
        placement="bottom"
        arrow
      >
        <Typography variant="caption" color="text.secondary" sx={{ cursor: 'help', textDecoration: 'underline dotted' }}>
          WVHT
        </Typography>
      </Tooltip>

      <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />

      {observed && (
        <Box sx={{ textAlign: { xs: 'left', sm: 'center' } }}>
          <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold', lineHeight: 1 }}>
            {observed.value_ft.toFixed(1)}ft
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Observed
          </Typography>
        </Box>
      )}

      {observed && predicted && (
        <ArrowForwardIcon sx={{ color: 'text.disabled', fontSize: '1.1rem', display: { xs: 'none', sm: 'block' } }} />
      )}

      {predicted && (
        <Box sx={{ textAlign: { xs: 'left', sm: 'center' } }}>
          <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold', lineHeight: 1 }}>
            {predicted.value_ft.toFixed(1)}ft
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {predicted.horizon_hours}hr forecast
          </Typography>
        </Box>
      )}
    </Paper>
  );
};
