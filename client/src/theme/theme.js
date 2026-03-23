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
        main:         isDark ? '#f87171' : '#dc2626',
        light:        isDark ? '#fca5a5' : '#fecaca',
        dark:         isDark ? '#ef4444' : '#b91c1c',
        contrastText: '#ffffff',
      },
      warning: {
        main:         isDark ? '#fbbf24' : '#d97706',
        light:        isDark ? '#fcd34d' : '#fde68a',
        dark:         isDark ? '#f59e0b' : '#b45309',
        contrastText: isDark ? '#000000' : '#ffffff',
      },
      success: {
        main:         isDark ? '#34d399' : '#16a34a',
        light:        isDark ? '#6ee7b7' : '#bbf7d0',
        dark:         isDark ? '#10b981' : '#15803d',
        contrastText: '#ffffff',
      },
      info: {
        main:         isDark ? '#60a5fa' : '#2563eb',
        light:        isDark ? '#93c5fd' : '#bfdbfe',
        dark:         isDark ? '#3b82f6' : '#1d4ed8',
        contrastText: '#ffffff',
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
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              backgroundColor: isDark ? colors[50] : colors[0],
              fontSize: '0.875rem',
              '& fieldset': {
                borderColor: colors[200],
              },
              '&:hover fieldset': {
                borderColor: isDark ? colors[600] : colors[700],
              },
              '&.Mui-focused fieldset': {
                borderColor: colors[1000],
                borderWidth: '1px',
              },
            },
            '& .MuiInputBase-input': {
              color: colors[1000],
            },
            '& .MuiInputLabel-root': {
              color: colors[500],
              '&.Mui-focused': {
                color: colors[1000],
              },
            },
          },
        },
      },
      MuiSelect: {
        defaultProps: { size: 'small' },
        styleOverrides: {
          root: {
            backgroundColor: isDark ? colors[50] : colors[0],
            color: colors[1000],
            fontSize: '0.875rem',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: colors[200],
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? colors[600] : colors[700],
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: colors[1000],
              borderWidth: '1px',
            },
          },
          icon: {
            color: colors[500],
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            fontSize: '0.875rem',
            color: colors[1000],
            '&:hover': {
              backgroundColor: isDark ? `rgba(255,255,255,0.06)` : `rgba(0,0,0,0.04)`,
            },
            '&.Mui-selected': {
              backgroundColor: isDark ? `rgba(255,255,255,0.10)` : `rgba(0,0,0,0.08)`,
              '&:hover': {
                backgroundColor: isDark ? `rgba(255,255,255,0.14)` : `rgba(0,0,0,0.10)`,
              },
            },
          },
        },
      },
    },
  });
};
