import SearchAppBar from "@features/header";
import { Container } from "@mui/material";
import Footer from "components/layout/footer";
import { Outlet } from "react-router-dom";

/**
 * A wrapper for the child routes of the app
 * @param param0 
 * @returns 
 */
export const AppWrapper = () => {
  return (
    <>
      <SearchAppBar />
      <Container maxWidth="xl">
        <Outlet />
      </Container>
      <Footer />
    </>
  );
}