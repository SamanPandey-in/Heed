import { createTheme } from '@mui/material/styles';

export const buildTheme = (mode = 'light') => {
  const isDark = mode === 'dark';

  const primaryMain = isDark ? '#ffffff' : '#000000';
  const primaryContrast = isDark ? '#000000' : '#ffffff';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: primaryMain,
        contrastText: primaryContrast,
      },
      secondary: {
        main: isDark ? '#9ca3af' : '#4b5563',
      },
      error: {
        main: '#d32f2f',
      },
      warning: {
        main: '#ed6c02',
      },
      success: {
        main: '#2e7d32',
      },
      background: {
        default: isDark ? '#0a0a0a' : '#f7f7f7',
        paper: isDark ? '#121212' : '#ffffff',
      },
    },
    spacing: 8,
    shape: {
      borderRadius: 10,
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontSize: '2.25rem', fontWeight: 700 },
      h2: { fontSize: '1.875rem', fontWeight: 700 },
      h3: { fontSize: '1.5rem', fontWeight: 600 },
      h4: { fontSize: '1.25rem', fontWeight: 600 },
      h5: { fontSize: '1.125rem', fontWeight: 600 },
      h6: { fontSize: '1rem', fontWeight: 600 },
      body1: { fontSize: '1rem' },
      body2: { fontSize: '0.875rem' },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: 10,
          },
          containedPrimary: {
            backgroundColor: primaryMain,
            color: primaryContrast,
            '&:hover': {
              backgroundColor: primaryMain,
              filter: 'brightness(0.92)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
            boxShadow: 'none',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 500,
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          size: 'small',
          fullWidth: true,
        },
      },
      MuiSelect: {
        defaultProps: {
          size: 'small',
        },
      },
    },
  });
};
