import { ErrorBoundary } from 'react-error-boundary';
import { ToastContainer } from 'react-toastify';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from 'lib/react-query';
import { RouterProvider } from "react-router-dom";
import { router } from 'routes'
import { FavoritesProvider } from './favorites-provider';
import { ThemeProvider, useColorMode } from './theme-provider';
import { HelmetProvider } from 'react-helmet-async';
import 'react-toastify/dist/ReactToastify.css';
import '/src/providers/app.css'

const ErrorFallback = () => {
  return(
    <div>App could not be loaded. Refresh the page.</div>
  )
}

const ToastWrapper = () => {
  const { mode } = useColorMode();
  return <ToastContainer theme={mode} />;
};

export const AppProvider = () => {
  return(
    <HelmetProvider>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <ToastWrapper />
            <FavoritesProvider>
              <RouterProvider router={router} />
            </FavoritesProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </HelmetProvider>
  )
}

export default AppProvider
