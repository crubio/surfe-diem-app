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

// function App() {

//   return (
//     <>
//       <h1>surfe diem</h1>
//       <div className="card">
//         <p>
//           coming soon
//         </p>
//       </div>
//     </>
//   )
// }

export default AppProvider
