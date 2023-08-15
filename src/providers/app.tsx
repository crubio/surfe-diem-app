import { ErrorBoundary } from 'react-error-boundary';
import { ToastContainer } from 'react-toastify';
import CssBaseline from '@mui/material/CssBaseline';
import SearchAppBar from "@features/ui/header";
import { ThemeOptions, ThemeProvider, createTheme } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
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
    <ThemeProvider theme={theme}>
      <ToastContainer />
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <CssBaseline />
        
        <SearchAppBar />
          {children}
      </ErrorBoundary>
    </ThemeProvider>
  )
}

export default AppProvider
