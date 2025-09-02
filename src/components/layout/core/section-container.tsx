import React from 'react';
import { Box, Typography } from '@mui/material';
import { Item } from 'components/layout/item';
import { 
  SECTION_SPACING, 
  SECTION_MARGIN_BOTTOM, 
  BACKGROUND_VARIANTS,
  TYPOGRAPHY_VARIANTS 
} from '../constants/layout-constants';

interface SectionContainerProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  spacing?: keyof typeof SECTION_SPACING;
  marginBottom?: keyof typeof SECTION_MARGIN_BOTTOM;
  background?: keyof typeof BACKGROUND_VARIANTS;
  showDivider?: boolean;
  padding?: number;
  titleVariant?: keyof typeof TYPOGRAPHY_VARIANTS;
  subtitleVariant?: keyof typeof TYPOGRAPHY_VARIANTS;
}

const SectionContainer: React.FC<SectionContainerProps> = ({
  children,
  title,
  subtitle,
  spacing = 'NORMAL',
  marginBottom = 'NORMAL',
  background = 'DEFAULT',
  showDivider = false,
  padding = 3,
  titleVariant = 'H5',
  subtitleVariant = 'H6',
}) => {
  const spacingValue = SECTION_SPACING[spacing];
  const marginBottomValue = SECTION_MARGIN_BOTTOM[marginBottom];
  const backgroundColor = BACKGROUND_VARIANTS[background];

  return (
    <Item 
      sx={{ 
        bgcolor: backgroundColor, 
        marginBottom: marginBottomValue, 
        p: padding 
      }}
    >
      {title && (
        <Typography 
          variant={titleVariant.toLowerCase() as any} 
          component="h2" 
          sx={{ 
            mb: spacingValue, 
            fontWeight: 600 
          }}
        >
          {title}
        </Typography>
      )}
      
      {subtitle && (
        <Typography 
          variant={subtitleVariant.toLowerCase() as any} 
          component="h3" 
          sx={{ 
            mb: spacingValue, 
            fontWeight: 600, 
            color: 'primary.main' 
          }}
        >
          {subtitle}
        </Typography>
      )}
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacingValue }}>
        {children}
      </Box>

      {showDivider && (
        <Box sx={{ 
          borderTop: '1px solid', 
          borderColor: 'divider', 
          mt: spacingValue,
          opacity: 0.6 
        }} />
      )}
    </Item>
  );
};

export default SectionContainer;
