import { Box, Button, Chip, Typography, useTheme } from '@mui/material';
import { Favorite as FavoriteIcon, FavoriteBorder as FavoriteBorderIcon } from '@mui/icons-material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { useFavorites } from 'providers/favorites-provider';
import { colorTokens } from 'config/theme';
import { useColorMode } from 'providers/theme-provider';
import { getEnhancedConditionScore } from 'utils/conditions';
import { formatCoordinates } from 'utils/formatting';
import { getSwellDirectionText } from 'utils/swell';
import type { ParsedNWSCurrent, NWSHourlyPoint } from 'utils/nws-parser';
import type { Favorite } from 'types';

interface SpotHeroProps {
  spotId: number;
  spotName: string;
  subregionName: string;
  latitude: number;
  longitude: number;
  timezone: string;
  current: ParsedNWSCurrent | null;
  hourly: NWSHourlyPoint[];
}

const SpotHero = ({
  spotId,
  spotName,
  subregionName,
  latitude,
  longitude,
  timezone,
  current,
  hourly,
}: SpotHeroProps) => {
  const theme = useTheme();
  const { mode } = useColorMode();
  const tokens = colorTokens[mode];
  const { isFavorited, addFavorite, removeFavorite } = useFavorites();

  const favorited = isFavorited(String(spotId), 'spot');

  const handleFavoriteToggle = () => {
    if (favorited) {
      removeFavorite(String(spotId), 'spot');
    } else {
      const fav: Omit<Favorite, 'addedAt'> = {
        id: String(spotId),
        type: 'spot',
        name: spotName,
        subregion_name: subregionName,
        latitude,
        longitude,
      };
      addFavorite(fav);
    }
  };

  const chartData = hourly.slice(0, 72).map((pt, i) => ({
    i,
    primary: pt.primarySwellHeightFt ?? 0,
    secondary: pt.secondarySwellHeightFt ?? 0,
  }));

  const waveHeight = current?.primary_swell_height ?? current?.wave_height ?? null;
  const period = current?.primary_swell_period ?? current?.wave_period ?? null;
  const direction = current?.primary_swell_direction ?? current?.wave_direction ?? null;

  const conditionScore = current
    ? getEnhancedConditionScore({
        waveHeight: waveHeight ?? undefined,
        swellPeriod: period ?? undefined,
      })
    : null;


  return (
    <Box
      sx={{
        height: { xs: 'auto', md: '360px' },
        overflow: 'hidden',
        position: 'relative',
        background: `linear-gradient(180deg, ${theme.palette.primary.dark} 0%, #051218 100%)`,
      }}
    >
      {/* Background chart */}
      <Box sx={{ position: 'absolute', inset: 0, opacity: 0.55 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="heroGradientPrimary" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={theme.palette.primary.light} stopOpacity={0.45} />
                <stop offset="100%" stopColor={theme.palette.primary.light} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="heroGradientSecondary" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7ed992" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#7ed992" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="i" hide />
            <YAxis hide />
            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(255,255,255,0.06)" />
            <ReferenceLine x={0} stroke={theme.palette.primary.light} strokeDasharray="4 4" strokeOpacity={0.7} />
            <Area
              type="basis"
              dataKey="primary"
              stroke={theme.palette.primary.light}
              strokeWidth={2.5}
              fill="url(#heroGradientPrimary)"
              dot={false}
              isAnimationActive={false}
            />
            <Area
              type="basis"
              dataKey="secondary"
              stroke="#7ed992"
              strokeWidth={2}
              strokeOpacity={0.8}
              fill="url(#heroGradientSecondary)"
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>

      {/* Left darkening gradient */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, rgba(5,18,24,0.72) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      {/* Foreground content */}
      <Box
        sx={{
          position: 'relative',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: { xs: '24px', md: '32px 48px' },
        }}
      >
        {/* Top row: save button pinned top-right */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant={favorited ? 'contained' : 'outlined'}
            size="small"
            startIcon={favorited ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            onClick={handleFavoriteToggle}
            sx={{
              borderRadius: '999px',
              px: 2,
              py: 0.75,
              fontWeight: 600,
              fontSize: 13,
              ...(favorited ? {
                backgroundColor: theme.palette.primary.main,
                color: 'white',
                '&:hover': { backgroundColor: theme.palette.primary.dark },
              } : {
                borderColor: theme.palette.primary.light,
                color: theme.palette.primary.light,
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  backgroundColor: 'rgba(30,214,230,0.08)',
                },
              }),
            }}
          >
            {favorited ? 'Saved' : 'Save'}
          </Button>
        </Box>

        {/* Bottom: condition chip + spot name + readout + meta pills */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {conditionScore && (
            <Box>
              <Chip
                label={conditionScore.label}
                size="small"
                sx={{
                  backgroundColor: theme.palette[conditionScore.color]?.main ?? theme.palette.info.main,
                  color: 'white',
                  fontWeight: 700,
                  fontSize: 11,
                }}
              />
            </Box>
          )}

          <Typography
            component="h1"
            sx={{
              fontFamily: '"Bricolage Grotesque", Inter, sans-serif',
              fontWeight: 700,
              fontSize: { xs: '48px', md: '72px', lg: '84px' },
              lineHeight: 0.94,
              letterSpacing: '-0.035em',
              color: 'white',
            }}
          >
            {spotName}
          </Typography>

          {waveHeight !== null && (
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
              <Typography
                sx={{
                  fontFamily: '"Bricolage Grotesque", Inter, sans-serif',
                  fontWeight: 700,
                  fontSize: { xs: '28px', md: '36px' },
                  color: theme.palette.primary.light,
                  letterSpacing: '-0.04em',
                  lineHeight: 1,
                }}
              >
                {waveHeight.toFixed(1)}
                <Box component="span" sx={{ fontSize: '0.45em', color: 'rgba(255,255,255,0.65)', ml: 0.5 }}>ft</Box>
              </Typography>
              {period !== null && direction !== null && (
                <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', ml: 1 }}>
                  {getSwellDirectionText(direction)} · {period.toFixed(1)}s
                </Typography>
              )}
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {[formatCoordinates(latitude, longitude), subregionName, timezone].map((label) => (
              <Chip
                key={label}
                label={label}
                size="small"
                sx={{
                  backgroundColor: tokens.bgSoft,
                  color: theme.palette.text.secondary,
                  fontSize: 11,
                  fontWeight: 500,
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default SpotHero;
