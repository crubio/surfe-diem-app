import { Box, Button, Typography, Stack, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { setHomePageVariation, resetHomePageVariation, getHomePageVariation } from "./ab-testing";
import { getABTestMetrics, clearAnalyticsData } from "./analytics";
import { useState, useEffect } from "react";

/**
 * Debug component for A/B testing
 * Only show in development mode
 */
export const ABTestingDebug = () => {
  const [metrics, setMetrics] = useState<any>({});
  const [expanded, setExpanded] = useState<string | false>(false);

  useEffect(() => {
    refreshMetrics();
    const interval = setInterval(refreshMetrics, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const currentVariation = getHomePageVariation();

  const handleVariationChange = (variation: string) => {
    setHomePageVariation(variation as any);
    window.location.reload();
  };

  const handleReset = () => {
    resetHomePageVariation();
    window.location.reload();
  };

  const handleClearAnalytics = () => {
    clearAnalyticsData();
    setMetrics({});
  };

  const refreshMetrics = () => {
    setMetrics(getABTestMetrics());
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        padding: 2,
        borderRadius: 1,
        zIndex: 9999,
        fontSize: '12px',
        maxWidth: '300px',
        maxHeight: '80vh',
        overflow: 'auto',
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
        A/B Test Debug
      </Typography>
      <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
        Current: {currentVariation}
      </Typography>
      
      <Stack spacing={0.5} sx={{ mb: 2 }}>
        <Button
          size="small"
          variant="outlined"
          onClick={() => handleVariationChange('dashboard')}
          sx={{ fontSize: '10px', py: 0.5 }}
        >
          Dashboard
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={() => handleVariationChange('discovery')}
          sx={{ fontSize: '10px', py: 0.5 }}
        >
          Discovery
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={() => handleVariationChange('minimalist')}
          sx={{ fontSize: '10px', py: 0.5 }}
        >
          Minimalist
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={() => handleVariationChange('data-rich')}
          sx={{ fontSize: '10px', py: 0.5 }}
        >
          Data Rich
        </Button>
        <Button
          size="small"
          variant="contained"
          onClick={handleReset}
          sx={{ fontSize: '10px', py: 0.5, mt: 0.5 }}
        >
          Reset Assignment
        </Button>
      </Stack>

      <Accordion 
        expanded={expanded === 'analytics'} 
        onChange={() => setExpanded(expanded === 'analytics' ? false : 'analytics')}
        sx={{ 
          backgroundColor: 'transparent', 
          color: 'white',
          '& .MuiAccordionSummary-root': { color: 'white' },
          '& .MuiAccordionDetails-root': { color: 'white' }
        }}
      >
        <AccordionSummary expandIcon={<ExpandMore sx={{ color: 'white' }} />}>
          <Typography variant="caption">Analytics</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={1}>
            {Object.entries(metrics).map(([variation, data]: [string, any]) => (
              <Box key={variation} sx={{ border: '1px solid rgba(255,255,255,0.3)', p: 1, borderRadius: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block' }}>
                  {variation}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block' }}>
                  Views: {data.pageViews || 0}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block' }}>
                  Interactions: {data.interactions || 0}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block' }}>
                  Conversions: {data.conversions || 0}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block' }}>
                  Conv. Rate: {data.conversionRate || '0%'}
                </Typography>
              </Box>
            ))}
            {Object.keys(metrics).length === 0 && (
              <Typography variant="caption">No analytics data yet</Typography>
            )}
            <Button
              size="small"
              variant="outlined"
              onClick={handleClearAnalytics}
              sx={{ fontSize: '10px', py: 0.5, mt: 1 }}
            >
              Clear Analytics
            </Button>
          </Stack>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}; 