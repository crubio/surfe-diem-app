import { Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

 
export const LinkRouter = (props: any) => <Link {...props} component={RouterLink as any} />;