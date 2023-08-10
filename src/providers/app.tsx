import { ErrorBoundary } from 'react-error-boundary';
import { ToastContainer } from 'react-toastify';
import './App.css'


type AppProviderProps = {
  children: React.ReactNode;
};

const ErrorFallback = () => {
  return(
    <div>App could not be loaded. Refresh the page.</div>
  )
}

export const AppProvider = ({ children }: AppProviderProps) => {

  return(
    <>
      <ToastContainer />
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        {children}
      </ErrorBoundary>
    </>
  )
}

export default AppProvider
