import { Box, Card, CardContent, Typography, useTheme } from "@mui/material"
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, LabelList } from "recharts"
import type { ReactNode } from "react"

interface TideSparklineCardProps {
  predictions: Array<{ t: string; v: string }>
}

export const TideSparklineCard = ({ predictions }: TideSparklineCardProps) => {
  const theme = useTheme()
  const points = predictions.slice(0, 4)
  const data = points.map((p) => ({
    time: new Date(p.t).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    value: parseFloat(parseFloat(p.v).toFixed(1)),
  }))
  const min = Math.min(...predictions.map((p) => parseFloat(p.v)))
  const max = Math.max(...predictions.map((p) => parseFloat(p.v)))
  const padding = (max - min) * 0.3

  return (
    <Card sx={{ textAlign: 'center' }}>
      <CardContent sx={{ py: 1, px: 2 }}>
        <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold', fontSize: '2.25rem', mb: 0.5 }}>
          {min.toFixed(1)}-{max.toFixed(1)}ft
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Today's Range
        </Typography>
        <Box sx={{ pt: 2 }}>
          <ResponsiveContainer width="100%" height={80}>
            <AreaChart data={data} margin={{ top: 16, right: 16, left: 16, bottom: 0 }}>
              <defs>
                <linearGradient id="tideGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                </linearGradient>
              </defs>
              <YAxis domain={[min - padding, max + padding]} hide />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: theme.palette.text.secondary }} />
              <Area
                type="monotone"
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
                  style={{ fontSize: 11, fill: theme.palette.text.primary }}
                />
              </Area>
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  )
}
