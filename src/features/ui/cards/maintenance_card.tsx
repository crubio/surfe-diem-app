
import { Container } from '@mui/material';
import Box from '@mui/material/Box';

export function MaintenanceCard() {
  return (
    <>
    <Container maxWidth="xl" sx={{ height: '100vh', marginTop: '20px' }}>
      <Box sx={{ textAlign: 'center', marginTop: '40vh'}}>
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

export default MaintenanceCard;