import { useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { buildTheme } from '../../theme/theme';

export default function ThemeProvider({ children }) {
  const mode = useSelector((state) => state.theme.mode);

  const muiTheme = useMemo(() => buildTheme(mode), [mode]);

  // Sync Tailwind dark mode automatically
  useEffect(() => {
    const root = document.documentElement;

    if (mode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    localStorage.setItem("theme", mode);
  }, [mode]);

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}
