import { MaintenanceCard } from "@features/ui";
import ErrorPage from "pages/error";
import Home from "pages/home";
import { Outlet, createBrowserRouter } from "react-router-dom";
import SearchAppBar from "@features/ui/header";
import { Container } from "@mui/material";
import React from "react";


const isMaintenanceMode = false;

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
        element: <div>Location</div>,
        errorElement: <ErrorPage />,
      },
    ]
  }
]);