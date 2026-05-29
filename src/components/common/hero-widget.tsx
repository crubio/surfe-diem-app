import { Box, Typography, useTheme } from "@mui/material";
import { useColorMode } from "../../providers/theme-provider";
import { colorTokens } from "../../config/theme";
import { ConditionScore } from "utils/conditions";

interface HeroWidgetRow {
  label: string;
  spot?: string;
  value: string;
  score?: ConditionScore;
}

interface HeroWidgetProps {
  rows: HeroWidgetRow[];
}

const HeroWidget = ({ rows }: HeroWidgetProps) => {
  const theme = useTheme();
  const { mode } = useColorMode();

  const isDark = mode === 'dark';
  const tokens = colorTokens[mode];

  const colors = {
    bg: tokens.bgSoft,
    border: tokens.rule,
    label: isDark ? theme.palette.text.secondary : theme.palette.text.secondary,
    spotName: isDark ? theme.palette.text.primary : theme.palette.text.primary,
    divider: theme.palette.divider,
    accent: isDark ? theme.palette.primary.light : theme.palette.primary.dark,
    header: isDark ? theme.palette.primary.main : theme.palette.primary.main,
  };

  const conditionDotColor: Record<string, string> = {
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
    info: theme.palette.info.main,
  };

  return (
    <Box
      sx={{
        backgroundColor: colors.bg,
        borderRadius: '12px',
        border: `1px solid ${colors.border}`,
        p: '24px',
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Typography sx={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: colors.header,
        }}>
          Right Now
        </Typography>
      </Box>

      {/* Rows */}
      {rows.map((row, i) => (
        <Box key={i}>
          {i > 0 && (
            <Box sx={{ borderTop: `1px solid ${colors.divider}`, my: 1.5 }} />
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            {/* Left: label + spot name */}
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: colors.label,
                mb: 0.25,
              }}>
                {row.label}
              </Typography>
              {row.spot && (
                <Typography sx={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: colors.spotName,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {row.spot}
                </Typography>
              )}
            </Box>

            {/* Right: value + condition dot */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
              <Typography sx={{
                fontFamily: '"Bricolage Grotesque", Inter, sans-serif',
                fontWeight: 700,
                fontSize: 22,
                color: colors.accent,
                letterSpacing: '-0.02em',
              }}>
                {row.value}
              </Typography>
              {row.score && (
                <Box sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: conditionDotColor[row.score.color] ?? theme.palette.info.main,
                  flexShrink: 0,
                }} />
              )}
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default HeroWidget;
