import { Container } from "@mui/material";
import ErrorIcon from '@mui/icons-material/Error';

interface ErrorPageProps {
  // Maybe this is an axios type error or maybe not. maybe go fuck yourself.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any
}

export default function ErrorPage(props: ErrorPageProps) {
   
  const error = props.error

  console.log(error)

  return (
    <Container maxWidth="xl" sx={{ height: '100vh', marginTop: '20px', textAlign: 'center' }}>
      <div id="error-page">
        <h1>Error <ErrorIcon color="secondary"/></h1>
        <p>The following error has occurred.</p>
        <p>
          <i>{error.statusText || error.message }</i>
        </p>
      </div>
    </Container>
  );
}