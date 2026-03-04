import { createTheme } from '@mui/material/styles';
import tokens from './tokens';

export const buildTheme = (mode = 'light') => {
  const isDark = mode === 'dark';
  const colors = isDark ? tokens.darkGray : tokens.gray;

  return createTheme({
    palette: {
      mode,
      primary: {
        main: colors[1000],
        contrastText: colors[0],
      },
      secondary: {
        main: colors[700],
      },
      error: {
        main: colors[400],
      },
      warning: {
        main: colors[500],
      },
      success: {
        main: colors[600],
      },
      background: {
        default: isDark ? colors[0] : colors[0],
        paper: isDark ? colors[50] : colors[0],
      },
    },
    spacing: tokens.spacing[2],
    shape: {
      borderRadius: tokens.borderRadius.md,
    },
    typography: {
      fontFamily: tokens.font.family,
      h1: { fontSize: '2.25rem', fontWeight: tokens.font.weight.bold },
      h2: { fontSize: '1.875rem', fontWeight: tokens.font.weight.bold },
      h3: { fontSize: '1.5rem', fontWeight: tokens.font.weight.semibold },
      h4: { fontSize: '1.25rem', fontWeight: tokens.font.weight.semibold },
      h5: { fontSize: '1.125rem', fontWeight: tokens.font.weight.semibold },
      h6: { fontSize: '1rem', fontWeight: tokens.font.weight.semibold },
      body1: { fontSize: '1rem', fontWeight: tokens.font.weight.normal },
      body2: { fontSize: '0.875rem', fontWeight: tokens.font.weight.normal },
      button: { textTransform: 'none', fontWeight: tokens.font.weight.medium },
    },
    components: {
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: tokens.borderRadius.md,
          },
          containedPrimary: {
            backgroundColor: colors[1000],
            color: colors[0],
            '&:hover': {
              backgroundColor: colors[900],
              filter: 'brightness(0.92)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: tokens.borderRadius.lg,
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
            boxShadow: 'none',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: tokens.borderRadius.sm,
            fontWeight: tokens.font.weight.medium,
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
