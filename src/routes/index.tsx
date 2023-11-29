import { MaintenanceCard } from "@features/cards/maintenance_card";
import ErrorPage from "pages/error";
import Home from "pages/home";
import { createBrowserRouter } from "react-router-dom";
import { MAINTENANCE_MODE } from "config";
import LocationsPage from "pages/locations";
import MapPage from "pages/map";
import { AppWrapper } from "./wrapper";
import SpotsPage from "pages/spots";

const isMaintenanceMode = MAINTENANCE_MODE === 'true' ? true : false;

const DEFAULT_MESSAGE = {message: "Cannot load page. Please try again."}

export const router = createBrowserRouter([
  {
    path: "/",
    element: isMaintenanceMode ? <MaintenanceCard /> : <AppWrapper />,
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
            errorElement: <ErrorPage error={DEFAULT_MESSAGE} />,
          },
          {
            path: "spot/:spotId",
            element: <SpotsPage />,
            errorElement: <ErrorPage error={DEFAULT_MESSAGE} />,
          },
          {
            path: "map",
            element: <MapPage />,
            errorElement: <ErrorPage error={{}} />,
          }
        ]
      }    ]);

