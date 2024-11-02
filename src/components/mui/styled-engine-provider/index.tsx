import { StyledEngineProvider } from '@mui/material';

/**
 * This provider ensure that mui-based className will be inject first
 * so that their priority will always be lower than other customized className
 **/
export default function MUIStyledEngineProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StyledEngineProvider injectFirst>{children}</StyledEngineProvider>;
}
