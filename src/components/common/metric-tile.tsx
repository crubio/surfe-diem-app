import { Box, Tooltip, Typography } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Loading } from 'components/layout/loading';

export interface MetricTileProps {
  label: string;
  value: string | null | undefined;
  isLoading: boolean;
  bgColor: string;
  textTertiary: string;
  accentColor: string;
  tooltip?: string;
  sub?: string;
  textSecondary?: string;
}

export const MetricTile = ({
  label,
  value,
  isLoading,
  bgColor,
  textTertiary,
  accentColor,
  tooltip,
  sub,
  textSecondary,
}: MetricTileProps) => (
  <Box
    sx={{
      flex: 1,
      minWidth: { xs: '40%', sm: 0 },
      px: 2.5,
      py: 2,
      borderRadius: '12px',
      backgroundColor: bgColor,
    }}
  >
    {isLoading ? (
      <Loading />
    ) : (
      <>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.75 }}>
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'none',
              color: textTertiary,
            }}
          >
            {label}
          </Typography>
          {tooltip && (
            <Tooltip title={tooltip} placement="bottom" arrow>
              <InfoOutlinedIcon sx={{ fontSize: '0.8rem', color: textTertiary, cursor: 'help' }} />
            </Tooltip>
          )}
        </Box>
        <Typography
          sx={{
            fontFamily: '"Bricolage Grotesque", Inter, sans-serif',
            fontWeight: 700,
            fontSize: 30,
            letterSpacing: '-0.03em',
            lineHeight: 1,
            color: value ? accentColor : textTertiary,
          }}
        >
          {value ?? '—'}
        </Typography>
        {sub && textSecondary && (
          <Typography sx={{ fontSize: 12, color: textSecondary, mt: 0.5 }}>
            {sub}
          </Typography>
        )}
      </>
    )}
  </Box>
);
