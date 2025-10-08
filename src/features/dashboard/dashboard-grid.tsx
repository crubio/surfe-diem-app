import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { Item } from 'components/layout/item';
import {
  GRID_ITEM_SPACING,
  ITEM_PADDING,
  SECTION_MARGIN_BOTTOM,
  TITLE_FONT_WEIGHT,
  SECTION_TITLE_MB,
  SUBSECTION_TITLE_MB,
  DASHBOARD_CARD_SECTION_MB,
} from 'utils/layout-constants';

interface GridConfig {
  xs: number;
  sm: number;
  md: number;
}

interface DashboardGridProps {
  title: string;
  subtitle?: string;
  userLocation?: Record<string, string> | string | undefined;
  children: React.ReactNode;
  columns?: GridConfig;
  spacing?: number;
  showDivider?: boolean;
  showSubtitle?: boolean;
  marginBottom?: number;
  marginTop?: number;
  padding?: number;
  background?: 'default' | 'paper';
}

const DashboardGrid: React.FC<DashboardGridProps> = ({
  title,
  subtitle,
  children,
  columns = { xs: 12, sm: 6, md: 4 },
  spacing = GRID_ITEM_SPACING,
  showDivider = false,
  showSubtitle = false,
  marginBottom = DASHBOARD_CARD_SECTION_MB,
  marginTop,
  padding = ITEM_PADDING,
  background = 'background.default',
  userLocation,
}) => {
  return (
    <Item sx={{ 
      bgcolor: background, 
      marginBottom: marginBottom, 
      marginTop: marginTop,
      p: padding 
    }}>
      <Typography 
        variant="h5" 
        component="h2" 
        sx={{ mb: SECTION_TITLE_MB, fontWeight: TITLE_FONT_WEIGHT }}
      >
        {title}
      </Typography>
      
      {showSubtitle && subtitle && (
        <Typography 
          variant="h6" 
          component="h3" 
          sx={{ mb: SUBSECTION_TITLE_MB, fontWeight: TITLE_FONT_WEIGHT, color: 'text.secondary' }}
        >
          {subtitle} {userLocation ? `${typeof userLocation === 'string' ? `for ${userLocation}` : userLocation.full_address || ''}` : ''}
        </Typography>
      )}
      
      <Grid container spacing={spacing}>
        {React.Children.map(children, (child, index) => (
          <Grid item xs={columns.xs} sm={columns.sm} md={columns.md} key={index}>
            {child}
          </Grid>
        ))}
      </Grid>

      {showDivider && (
        <Box sx={{ 
          borderTop: '1px solid', 
          borderColor: 'divider', 
          my: SECTION_MARGIN_BOTTOM,
          opacity: 0.6 
        }} />
      )}
    </Item>
  );
};

export default DashboardGrid;
