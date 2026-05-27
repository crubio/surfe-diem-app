import { ThemeOptions } from '@mui/material';

// Shadow scale
export const shadows = {
  sm: '0 4px 12px -4px rgba(8,40,52,0.12)',
  md: '0 8px 24px -8px rgba(8,40,52,0.18)',
  lg: '0 24px 60px -20px rgba(8,40,52,0.22)',
};

export const getThemeOptions = (mode: 'light' | 'dark'): ThemeOptions => ({
  palette: {
    mode,
    ...(mode === 'dark'
      ? {
          background: {
            default: '#06161d',
            paper: '#102733',
          },
          primary: {
            main: '#1ed6e6',
            dark: '#0097a7',
            light: '#6aebf5',
          },
          secondary: {
            main: '#ff6b6b',
            dark: '#c73e3e',
            light: '#ff9e9e',
          },
          text: {
            primary: '#e6edf3',
            secondary: '#8b949e',
          },
          divider: 'rgba(255,255,255,0.08)',
          success: { main: '#4caf50' },
          warning: { main: '#ff9800' },
          error: { main: '#f44336' },
          info: { main: '#2196f3' },
        }
      : {
          background: {
            default: '#eef7fb',
            paper: '#ffffff',
          },
          primary: {
            main: '#0097a7',
            dark: '#006978',
            light: '#1ed6e6',
          },
          secondary: {
            main: '#e64a19',
            dark: '#ac1900',
            light: '#ff7d47',
          },
          text: {
            primary: '#082834',
            secondary: '#496e7c',
          },
          divider: 'rgba(0,90,110,0.08)',
          success: { main: '#4caf50' },
          warning: { main: '#ff9800' },
          error: { main: '#f44336' },
          info: { main: '#2196f3' },
        }),
  },
  typography: {
    fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 500 },
      },
    },
  },
});

// Semantic color tokens (use directly in sx props where MUI palette doesn't reach)
export const colorTokens = {
  light: {
    bgSoft: '#dff0f6',
    textTertiary: '#7a98a4',
    rule: 'rgba(0,90,110,0.08)',
    ruleHi: 'rgba(0,90,110,0.18)',
    accentDark: '#006978',
  },
  dark: {
    bgSoft: '#0a1d27',
    textTertiary: '#4a6a7a',
    rule: 'rgba(255,255,255,0.08)',
    ruleHi: 'rgba(255,255,255,0.14)',
    accentDark: '#1ed6e6',
  },
};
