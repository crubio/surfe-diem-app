import { Container } from "@mui/material";
import ErrorIcon from '@mui/icons-material/Error';

interface ErrorPageProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any
}

export default function ErrorPage(props: ErrorPageProps) {
   
  const error = props.error

  return (
    <Container maxWidth="xl" sx={{ 
      minHeight: { xs: 'calc(100vh - 120px)', sm: 'calc(100vh - 80px)' }, 
      marginTop: { xs: '10px', sm: '20px' }, 
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div id="error-page">
        <ErrorIcon color="secondary" sx={{ fontSize: 40 }} />
        <h2>The following error has occurred.</h2>
        <p>
          <i>{error.statusText || error.message }</i>
        </p>
      </div>
    </Container>
  );
}