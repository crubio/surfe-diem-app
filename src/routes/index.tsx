import { MaintenanceCard } from "@features/index";
import ErrorPage from "pages/error";
import Home from "pages/home";
import { Outlet, createBrowserRouter } from "react-router-dom";
import SearchAppBar from "@features/header";
import { Container } from "@mui/material";
import { MAINTENANCE_MODE } from "config";
import LocationsPage from "pages/locations";

const isMaintenanceMode = MAINTENANCE_MODE === 'true' ? true : false;

/**
 * A wrapper for the child routes of the app
 * @param param0 
 * @returns 
 */
const App = () => {
  return (
    <>
      <SearchAppBar />
      <Container>
        <Outlet />
      </Container>
    </>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: isMaintenanceMode ? <MaintenanceCard /> : <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <Home />,
        errorElement: <ErrorPage />,
      },
      {
        path: "location/:locationId",
        element: <LocationsPage />,
        errorElement: <ErrorPage />,
      },
    ]
  }
]);