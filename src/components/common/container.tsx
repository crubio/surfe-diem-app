import { Container } from "@mui/material";

interface ContainerProps {
  children: React.ReactNode;
}

export default function PageContainer(props: ContainerProps) {
  return (
    <Container
      sx={{
        height: "100vh",
      }}
    >
      {props.children}
    </Container>
  )
}