import { MaintenanceCard } from "@features/cards/maintenance_card";
import ErrorPage from "pages/error";
import Home from "pages/home";
import { Outlet, createBrowserRouter } from "react-router-dom";
import SearchAppBar from "@features/header";
import { Container } from "@mui/material";
import { MAINTENANCE_MODE } from "config";
import LocationsPage from "pages/locations";
import MapPage from "pages/map";

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
    errorElement: <ErrorPage error={{ message: "Page not found" }} />,
        children: [
          {
            path: "/",
            element: <Home />,
            errorElement: <ErrorPage error={{}} />,
          },
          {
            path: "/home",
            element: <Home />,
            errorElement: <ErrorPage error={{}} />,
          },
          {
            path: "location/:locationId",
            element: <LocationsPage />,
            errorElement: <ErrorPage error={{}} />,
          },
          {
            path: "map",
            element: <MapPage />,
            errorElement: <ErrorPage error={{}} />,
          }
        ]
      }    ]);

