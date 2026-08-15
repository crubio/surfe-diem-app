import { Container, Typography } from "@mui/material";
import ErrorIcon from '@mui/icons-material/Error';

interface ErrorPageProps {
   
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
        <Typography variant="h5" component="h2" sx={{ mt: 2, mb: 1 }}>
          The following error has occurred.
        </Typography>
        <Typography variant="body1" color="text.secondary">
          <em>{error.statusText || error.message}</em>
        </Typography>
      </div>
    </Container>
  );
}