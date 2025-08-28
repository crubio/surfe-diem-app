import { Box, Container, Typography } from "@mui/material";
import { ReactNode } from "react";

interface HeroSectionProps {
  image: string;
  headline: ReactNode;
  body: ReactNode;
}

const HeroSection = (props: HeroSectionProps) => {
  return (
    <Box
      sx={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${props.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        height: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        textAlign: 'center',
        position: 'relative',
        marginBottom: '20px',
      }}
    >
      <Container maxWidth="lg">
      <Box sx={{ position: "relative", zIndex: 2 }}>
        <Typography variant="h2" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
          {props.headline}
        </Typography>
        <Typography variant="h5" sx={{ mb: 3, opacity: 0.9 }}>
          {props.body}
        </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default HeroSection;