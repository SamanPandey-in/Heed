/**
 * Material-UI Theme Configuration
 * Vercel Black & White Theme - Production Ready
 * Optimized for performance and accessibility
 */
import { createTheme } from "@mui/material/styles";
import tokens from '../theme/tokens';

export function getMuiTheme(mode = "light") {
  const isDark = mode === "dark";
  const colors = isDark ? tokens.darkGray : tokens.gray;

  return createTheme({
    palette: {
      mode: isDark ? "dark" : "light",
      primary: {
        main: colors[1000],
        light: colors[700],
        dark: isDark ? colors[800] : colors[1000],
        contrastText: isDark ? colors[0] : colors[0],
      },
      secondary: {
        main: colors[700],
        light: isDark ? colors[900] : colors[500],
        dark: isDark ? colors[1000] : colors[800],
      },
      error: {
        main: colors[1000],
        light: colors[200],
        dark: colors[800],
      },
      warning: {
        main: colors[1000],
        light: colors[200],
        dark: colors[800],
      },
      success: {
        main: colors[1000],
        light: colors[200],
        dark: colors[800],
      },
      info: {
        main: colors[1000],
        light: colors[200],
        dark: colors[800],
      },
      background: {
        default: isDark ? colors[0] : colors[0],
        paper: isDark ? colors[50] : colors[0],
      },
      text: {
        primary: colors[1000],
        secondary: colors[700],
        disabled: colors[400],
      },
      divider: colors[200],
    },
    typography: {
      fontFamily: tokens.font.family,
      fontSize: tokens.font.size.base,
      h1: {
        fontSize: "2.25rem",
        fontWeight: tokens.font.weight.semibold,
        lineHeight: 1.2,
        color: colors[1000],
      },
      h2: {
        fontSize: "1.875rem",
        fontWeight: tokens.font.weight.semibold,
        lineHeight: 1.3,
        color: colors[1000],
      },
      h3: {
        fontSize: "1.5rem",
        fontWeight: tokens.font.weight.semibold,
        lineHeight: 1.4,
        color: colors[1000],
      },
      body1: {
        fontSize: "1rem",
        fontWeight: tokens.font.weight.normal,
        lineHeight: 1.5,
        color: colors[1000],
      },
      body2: {
        fontSize: "0.875rem",
        fontWeight: tokens.font.weight.normal,
        lineHeight: 1.5,
        color: colors[700],
      },
      button: {
        fontSize: "0.875rem",
        fontWeight: tokens.font.weight.medium,
        textTransform: "none",
        lineHeight: 1.5,
      },
    },
    shape: {
      borderRadius: tokens.borderRadius.md,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: tokens.font.weight.medium,
            fontSize: "0.875rem",
            transition: "all 0.2s ease",
            borderRadius: tokens.borderRadius.md,
          },
          contained: {
            backgroundColor: colors[1000],
            color: isDark ? colors[0] : colors[0],
            "&:hover": {
              backgroundColor: colors[900],
              boxShadow: "none",
            },
            "&:disabled": {
              backgroundColor: colors[200],
              color: colors[400],
            },
          },
          outlined: {
            borderColor: colors[200],
            color: colors[1000],
            "&:hover": {
              backgroundColor: isDark
                ? `rgba(255,255,255,0.06)`
                : `rgba(0,0,0,0.04)`,
              borderColor: colors[1000],
            },
          },
          text: {
            color: colors[1000],
            "&:hover": {
              backgroundColor: isDark
                ? `rgba(255,255,255,0.06)`
                : `rgba(0,0,0,0.04)`,
            },
          },
        },
        defaultProps: {
          disableElevation: true,
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              backgroundColor: colors[isDark ? 50 : 0],
              color: colors[1000],
              fontSize: "0.875rem",
              borderRadius: tokens.borderRadius.md,
              transition: "all 0.2s ease",
              "& fieldset": {
                borderColor: colors[200],
              },
              "&:hover fieldset": {
                borderColor: colors[1000],
              },
              "&.Mui-focused fieldset": {
                borderColor: colors[1000],
                borderWidth: 2,
              },
            },
            "& .MuiInputBase-input::placeholder": {
              color: colors[400],
              opacity: 1,
            },
          },
        },
      },
      MuiInputAdornment: {
        styleOverrides: {
          root: {
            color: colors[700],
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            backgroundColor: colors[isDark ? 50 : 0],
            color: colors[1000],
            fontSize: "0.875rem",
            borderRadius: tokens.borderRadius.md,
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: colors[200],
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: colors[1000],
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: colors[isDark ? 50 : 0],
            color: colors[1000],
            backgroundImage: "none",
          },
        },
      },
      MuiCheckbox: {
        styleOverrides: {
          root: {
            color: colors[200],
            "&.Mui-checked": {
              color: colors[1000],
            },
          },
        },
      },
    },
  });
}
