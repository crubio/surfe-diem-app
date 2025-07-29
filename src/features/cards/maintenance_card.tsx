
import { Container } from '@mui/material';
import Box from '@mui/material/Box';

export function MaintenanceCard() {
  return (
    <>
    <Container maxWidth="xl" sx={{ 
      minHeight: { xs: 'calc(100vh - 120px)', sm: 'calc(100vh - 80px)' }, 
      marginTop: { xs: '10px', sm: '20px' },
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Box sx={{ textAlign: 'center' }}>
        <h1>surfe diem</h1>
        <div className="card">
          <p>
            this site is under construction. check back soon.
          </p>
        </div>
      </Box>
    </Container>
    </>
  );
}
