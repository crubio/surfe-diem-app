import { Box, Container, Typography } from '@mui/material';

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
        <Typography variant="h4" component="h1" sx={{ mb: 2 }}>surfe diem</Typography>
        <Typography variant="body1" color="text.secondary">
          This site is under construction. Check back soon.
        </Typography>
      </Box>
    </Container>
    </>
  );
}
