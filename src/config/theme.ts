import { ThemeOptions } from '@mui/material';

export const getThemeOptions = (mode: 'light' | 'dark'): ThemeOptions => ({
  palette: {
    mode,
    ...(mode === 'dark'
      ? {
          background: {
            default: '#0d1117',
            paper: '#161b22',
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
        }
      : {
          background: {
            default: '#f0f6fc',
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
            primary: '#1c1e21',
            secondary: '#57606a',
          },
          divider: 'rgba(0,0,0,0.1)',
        }),
  },
  typography: {
    fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 8,
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
