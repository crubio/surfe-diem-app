import { ErrorBoundary } from 'react-error-boundary';
import { ToastContainer } from 'react-toastify';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from 'lib/react-query';
import {
  RouterProvider,
} from "react-router-dom";
import { router } from 'routes'
import { themeOptions } from 'config/theme';
import { FavoritesProvider } from './favorites-provider';
import { HelmetProvider } from 'react-helmet-async';
import { ABTestingDebug } from '../utils/ab-testing-debug';
import 'react-toastify/dist/ReactToastify.css';
import '/src/providers/app.css'

const ErrorFallback = () => {
  return(
    <div>App could not be loaded. Refresh the page.</div>
  )
}

const theme = createTheme(themeOptions);

export const AppProvider = () => {

  return(
    <HelmetProvider>
      <ToastContainer theme='dark' />
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <FavoritesProvider>
              <RouterProvider router={router} />
              <ABTestingDebug />
            </FavoritesProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </HelmetProvider>
  )
}

export default AppProvider
