import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import { Box, Stack, Divider } from "@mui/material";
import { LinkRouter } from "components";

export default function Footer() {
  return (
    <Box
      sx={{
        backgroundColor: (theme) =>
          theme.palette.mode === "light"
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
        py: 3,
        mt: 'auto'
      }}
      component="footer"
    >
      <Container maxWidth="lg">
        <Stack 
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'center', sm: 'center' }}
          spacing={{ xs: 2, sm: 0 }}
        >
          {/* Copyright */}
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
          >
            © {new Date().getFullYear()} Surfe Diem
          </Typography>

          {/* Quick Links */}
          <Stack 
            direction="row" 
            spacing={{ xs: 2, sm: 3 }}
            sx={{ 
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: { xs: 1.5, sm: 2 }
            }}
          >
            <LinkRouter 
              to="/about" 
              sx={{ 
                color: 'text.secondary',
                textDecoration: 'none',
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                '&:hover': {
                  color: 'primary.main',
                  textDecoration: 'underline'
                }
              }}
            >
              About
            </LinkRouter>
            <LinkRouter 
              to="/spots" 
              sx={{ 
                color: 'text.secondary',
                textDecoration: 'none',
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                '&:hover': {
                  color: 'primary.main',
                  textDecoration: 'underline'
                }
              }}
            >
              Spots
            </LinkRouter>
            <LinkRouter 
              to="/map" 
              sx={{ 
                color: 'text.secondary',
                textDecoration: 'none',
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                '&:hover': {
                  color: 'primary.main',
                  textDecoration: 'underline'
                }
              }}
            >
              Map
            </LinkRouter>
          </Stack>

          {/* Contact */}
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
          >
            <Link 
              href="mailto:contact@surfe-diem.com"
              sx={{ 
                color: 'inherit',
                textDecoration: 'none',
                '&:hover': {
                  color: 'primary.main',
                  textDecoration: 'underline'
                }
              }}
            >
              Contact
            </Link>
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}