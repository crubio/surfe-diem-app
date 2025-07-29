import { Container } from "@mui/material";

interface ContainerProps {
  children: React.ReactNode;
}

export default function PageContainer(props: ContainerProps) {
  return (
    <Container
      sx={{
        minHeight: { xs: 'calc(100vh - 120px)', sm: 'calc(100vh - 80px)' },
        padding: { xs: '16px', sm: '24px' },
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {props.children}
    </Container>
  )
}