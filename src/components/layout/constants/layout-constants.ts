/**
 * Layout constants for consistent spacing and sizing across the application
 */

// Spacing scale (based on 8px grid system)
export const SPACING = {
  NONE: 0,
  XS: 0.5,    // 4px
  SM: 1,      // 8px
  MD: 2,      // 16px
  LG: 3,      // 24px
  XL: 4,      // 32px
  XXL: 6,     // 48px
  XXXL: 8,    // 64px
} as const;

// Container max widths (fluid with max constraints)
export const CONTAINER_MAX_WIDTHS = {
  XS: 'xs',      // 600px
  SM: 'sm',      // 960px
  MD: 'md',      // 1280px
  LG: 'lg',      // 1920px
  XL: 'xl',      // No max width
  FULL: false,   // No container
} as const;

// Page padding variants
export const PAGE_PADDING = {
  NONE: 0,
  SMALL: { xs: 1, sm: 2 },      // 8px mobile, 16px desktop
  MEDIUM: { xs: 2, sm: 3 },     // 16px mobile, 24px desktop
  LARGE: { xs: 3, sm: 4 },      // 24px mobile, 32px desktop
} as const;

// Section spacing variants
export const SECTION_SPACING = {
  TIGHT: SPACING.MD,     // 16px
  NORMAL: SPACING.LG,    // 24px
  LOOSE: SPACING.XL,     // 32px
  EXTRA: SPACING.XXL,    // 48px
} as const;

// Margin bottom variants for sections
export const SECTION_MARGIN_BOTTOM = {
  SMALL: SPACING.MD,     // 16px
  NORMAL: SPACING.LG,    // 24px
  LARGE: SPACING.XL,     // 32px
  EXTRA: SPACING.XXL,    // 48px
} as const;

// Typography variants (using existing MUI scale)
export const TYPOGRAPHY_VARIANTS = {
  H1: 'h1',
  H2: 'h2', 
  H3: 'h3',
  H4: 'h4',
  H5: 'h5',
  H6: 'h6',
  BODY1: 'body1',
  BODY2: 'body2',
  CAPTION: 'caption',
} as const;

// Layout variants for different content types
export const LAYOUT_VARIANTS = {
  PAGE: 'page',
  SECTION: 'section',
  CARD: 'card',
  FORM: 'form',
  LIST: 'list',
  GRID: 'grid',
} as const;

// Background variants
export const BACKGROUND_VARIANTS = {
  DEFAULT: 'background.default',
  PAPER: 'background.paper',
  TRANSPARENT: 'transparent',
} as const;

// Responsive breakpoint helpers
export const BREAKPOINTS = {
  XS: 'xs',   // 0px and up
  SM: 'sm',   // 600px and up
  MD: 'md',   // 900px and up
  LG: 'lg',   // 1200px and up
  XL: 'xl',   // 1536px and up
} as const;
