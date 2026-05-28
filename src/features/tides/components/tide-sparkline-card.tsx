import { Box, Divider, Paper, Typography, useTheme } from "@mui/material"
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, LabelList } from "recharts"
import { useColorMode } from 'providers/theme-provider'
import { colorTokens } from 'config/theme'
import type { ReactNode } from "react"

interface TideSparklineCardProps {
  predictions: Array<{ t: string; v: string }>
  stationId?: string
}

export const TideSparklineCard = ({ predictions, stationId }: TideSparklineCardProps) => {
  const theme = useTheme()
  const { mode } = useColorMode()
  const tokens = colorTokens[mode]

  const points = predictions.slice(0, 4)
  const data = points.map((p) => ({
    time: new Date(p.t).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    value: parseFloat(parseFloat(p.v).toFixed(1)),
  }))

  const allValues = predictions.map((p) => parseFloat(p.v))
  const min = Math.min(...allValues)
  const max = Math.max(...allValues)
  const padding = (max - min) * 0.3

  // Build tide events from the 4 key points
  const tideEvents = points.map((p) => ({
    time: new Date(p.t).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    value: parseFloat(parseFloat(p.v).toFixed(1)),
    label: parseFloat(p.v) >= (min + max) / 2 ? 'High' : 'Low',
  }))

  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
        <Box>
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: tokens.textTertiary,
              mb: 0.5,
            }}
          >
            Tide Status
          </Typography>
          {stationId && (
            <Typography sx={{ fontSize: 11, color: tokens.textTertiary }}>
              Station {stationId}
            </Typography>
          )}
        </Box>
      </Box>

      <Typography
        sx={{
          fontFamily: '"Bricolage Grotesque", Inter, sans-serif',
          fontWeight: 700,
          fontSize: 56,
          letterSpacing: '-0.04em',
          lineHeight: 1,
          color: tokens.accentDark,
          mb: 0.5,
        }}
      >
        {min.toFixed(1)}–{max.toFixed(1)}ft
      </Typography>
      <Typography sx={{ fontSize: 12, color: tokens.textTertiary, mb: 2 }}>
        Today's range
      </Typography>

      {/* Sparkline */}
      <Box sx={{ width: '100%', height: 90, mb: 2 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 18, right: 16, left: 16, bottom: 0 }}>
            <defs>
              <linearGradient id="tideGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.25} />
                <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis domain={[min - padding, max + padding]} hide />
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: tokens.textTertiary }}
            />
            <Area
              type="natural"
              dataKey="value"
              stroke={theme.palette.primary.main}
              strokeWidth={2}
              fill="url(#tideGradient)"
              dot={{ fill: theme.palette.primary.main, r: 3, strokeWidth: 0 }}
              isAnimationActive={false}
            >
              <LabelList
                dataKey="value"
                position="top"
                formatter={(v: ReactNode) => `${v}ft`}
                style={{ fontSize: 11, fill: tokens.textTertiary }}
              />
            </Area>
          </AreaChart>
        </ResponsiveContainer>
      </Box>

      {/* Tide events row */}
      <Divider sx={{ mb: 2, borderColor: tokens.rule }} />
      <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${tideEvents.length}, 1fr)`, gap: 1 }}>
        {tideEvents.map((event, i) => (
          <Box key={i} sx={{ textAlign: 'center' }}>
            <Typography
              sx={{
                fontFamily: '"Bricolage Grotesque", Inter, sans-serif',
                fontWeight: 700,
                fontSize: 16,
                color: tokens.accentDark,
                lineHeight: 1,
              }}
            >
              {event.value}ft
            </Typography>
            <Typography sx={{ fontSize: 11, color: tokens.textTertiary, mt: 0.25 }}>
              {event.label}
            </Typography>
            <Typography sx={{ fontSize: 11, color: theme.palette.text.secondary, mt: 0.25 }}>
              {event.time}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  )
}
