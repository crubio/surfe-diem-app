/**
 * Centralized grid configurations for dashboard components
 */

export interface GridConfig {
  xs: number;
  sm: number;
  md: number;
}

export const GRID_CONFIGS = {
  // Recommendations section: 3 cards per row on desktop
  RECOMMENDATIONS: { xs: 12, sm: 6, md: 4 } as GridConfig,
  
  // Current conditions: 4 cards per row on desktop
  CURRENT_CONDITIONS: { xs: 12, sm: 6, md: 3 } as GridConfig,
  
  // Search section: 2 cards per row on desktop
  SEARCH: { xs: 12, md: 6 } as GridConfig,
  
  // Single column layout
  SINGLE_COLUMN: { xs: 12, sm: 12, md: 12 } as GridConfig,
  
  // Two column layout
  TWO_COLUMN: { xs: 12, sm: 6, md: 6 } as GridConfig,
  
  // Three column layout
  THREE_COLUMN: { xs: 12, sm: 6, md: 4 } as GridConfig,
  
  // Four column layout
  FOUR_COLUMN: { xs: 12, sm: 6, md: 3 } as GridConfig,
} as const;

/**
 * Helper function to create custom grid configurations
 */
export const createGridConfig = (
  xs: number,
  sm: number,
  md: number
): GridConfig => ({
  xs,
  sm,
  md,
});

/**
 * Common spacing values for dashboard grids
 */
export const GRID_SPACING = {
  TIGHT: 1,
  NORMAL: 2,
  LOOSE: 3,
} as const;

/**
 * Common margin bottom values for dashboard sections
 */
export const SECTION_MARGINS = {
  SMALL: 2,
  NORMAL: 3,
  LARGE: 4,
} as const;
