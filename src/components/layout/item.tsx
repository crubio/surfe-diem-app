import { Paper, styled } from "@mui/material";

export const Item = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1),
  elevation: 1,
  backgroundColor: theme.palette.background.default,
}));