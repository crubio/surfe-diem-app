import { Container } from "@mui/material";
import { useRouteError } from "react-router-dom";
import ErrorIcon from '@mui/icons-material/Error';


export default function ErrorPage() {
  const error: unknown | any = useRouteError();

  return (
    <Container maxWidth="xl" sx={{ height: '100vh', marginTop: '20px', textAlign: 'center' }}>
      <div id="error-page">
        <h1>Error <ErrorIcon color="secondary"/></h1>
        <p>The following error has occurred.</p>
        <p>
          <i>{error.statusText || error.message}</i>
        </p>
      </div>
    </Container>
  );
}