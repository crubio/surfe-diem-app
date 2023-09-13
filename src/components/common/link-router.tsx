import { Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const LinkRouter = (props: any) => <Link {...props} component={RouterLink as any} />;