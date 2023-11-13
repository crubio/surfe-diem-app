import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import { Box } from "@mui/material";

export default function Footer() {
  return (
    <Box
      sx={{
        backgroundColor: (theme) =>
          theme.palette.mode === "light"
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
        p: 2,
      }}
      component="footer"
    >
      <Container maxWidth="sm">
        <Typography variant="body2" color="text.secondary" align="center">
          <Link color="inherit" href="https://surfe-diem.com/">
            surfe-diem.com
          </Link>{" "}
          {new Date().getFullYear()}
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          {"Some weather data is provided by "}
          <Link color="inherit" href="https://open-meteo.com/">
            Open-Meteo.com
          </Link>{" "}
        </Typography>
      </Container>
    </Box>
  );
}