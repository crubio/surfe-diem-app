import React from 'react';
import { Box } from '@mui/material';
import { SPACING } from '../constants/layout-constants';

interface ContentWrapperProps {
  children: React.ReactNode;
  fullWidth?: boolean;
  centered?: boolean;
  padding?: keyof typeof SPACING;
  margin?: keyof typeof SPACING;
  background?: 'transparent' | 'default' | 'paper';
  minHeight?: string | number;
  maxWidth?: string | number;
}

const ContentWrapper: React.FC<ContentWrapperProps> = ({
  children,
  fullWidth = false,
  centered = false,
  padding = 'NONE',
  margin = 'NONE',
  background = 'transparent',
  minHeight,
  maxWidth,
}) => {
  const paddingValue = SPACING[padding];
  const marginValue = SPACING[margin];

  return (
    <Box
      sx={{
        width: fullWidth ? '100%' : 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: centered ? 'center' : 'stretch',
        justifyContent: centered ? 'center' : 'flex-start',
        p: paddingValue,
        m: marginValue,
        bgcolor: background === 'transparent' ? 'transparent' : `${background}.main`,
        minHeight,
        maxWidth,
        boxSizing: 'border-box',
      }}
    >
      {children}
    </Box>
  );
};

export default ContentWrapper;
