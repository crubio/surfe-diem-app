import { MaintenanceCard } from "@features/cards/maintenance_card";
import ErrorPage from "pages/error";
import Home from "pages/home";
import { createBrowserRouter, useRouteError } from "react-router-dom";
import { MAINTENANCE_MODE } from "config";
import LocationsPage from "pages/locations";
import MapPage from "pages/map";
import { AppWrapper } from "./wrapper";
import SpotPage from "pages/spot";
import SurfSpotsPage from "pages/spots";
import AboutPage from "pages/about";
import NearbySpotsPage from "pages/nearby-spots";

const isMaintenanceMode = MAINTENANCE_MODE === 'true' ? true : false;

function RootBoundary() {
  const error = useRouteError();
  return <ErrorPage error={error} />;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: isMaintenanceMode ? <MaintenanceCard /> : <AppWrapper />,
    errorElement: <RootBoundary />,
        children: [
          {
            path: "/",
            element: <Home />,
          },
          {
            path: "location/:locationId",
            element: <LocationsPage />,
          },
          {
            path: "spots",
            element: <SurfSpotsPage />,
          },
          {
            path: "spot/:spotId",
            element: <SpotPage />,
          },
          {
            path: "map",
            element: <MapPage />,
          },
          {
            path: "about",
            element: <AboutPage />,
          },
          {
            path: "nearby-spots",
            element: <NearbySpotsPage />,
          }
        ]
      }    ]);

