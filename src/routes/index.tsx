import { MaintenanceCard } from "@features/ui";
import ErrorPage from "pages/error";
import Home from "pages/home";
import { createBrowserRouter } from "react-router-dom";


const isMaintenanceMode = false

export const router = createBrowserRouter([
  {
    path: "/",
    element: isMaintenanceMode ? <MaintenanceCard /> : <Home />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/location/:locationId",
    element: <div>Location</div>,
    errorElement: <ErrorPage />,
  },
]);