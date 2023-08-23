import { ErrorBoundary } from 'react-error-boundary';
import { ToastContainer } from 'react-toastify';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeOptions, ThemeProvider, createTheme } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  RouterProvider,
} from "react-router-dom";
import { router } from 'routes'
// import './App.css'


type AppProviderProps = {
  children: React.ReactNode;
};

const ErrorFallback = () => {
  return(
    <div>App could not be loaded. Refresh the page.</div>
  )
}

// TODO: put this in a separate file
const themeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
  },
};

const theme = createTheme(themeOptions);

export const AppProvider = ({ children }: AppProviderProps) => {

  return(
    <>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <QueryClientProvider client={new QueryClient()}>
          <ToastContainer />
          <ThemeProvider theme={theme}>
          <CssBaseline />
          <RouterProvider router={router} />
              {children}
          </ThemeProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </>
  )
}

export default AppProvider
