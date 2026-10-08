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

