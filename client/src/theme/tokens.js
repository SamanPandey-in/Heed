// Design tokens for colors, spacing, typography, radii, and shadows
// Single source of truth for theme.js, muiTheme.js, and index.css

const GRAY = {
  0: "#ffffff",
  50: "#fafafa",
  100: "#f5f5f5",
  150: "#efefef",
  200: "#e5e5e5",
  300: "#d4d4d4",
  400: "#a3a3a3",
  500: "#737373",
  600: "#525252",
  700: "#404040",
  800: "#262626",
  900: "#171717",
  1000: "#000000",
};

const DARK_GRAY = {
  0: "#000000",
  50: "#0a0a0a",
  100: "#111111",
  150: "#1a1a1a",
  200: "#262626",
  300: "#404040",
  400: "#525252",
  500: "#737373",
  600: "#a3a3a3",
  700: "#d4d4d4",
  800: "#e5e5e5",
  900: "#f5f5f5",
  1000: "#ffffff",
};


const cardStatusColors = {
  active: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
  completed: "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300",
  deprecated: "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300",
};

const cardResultColors = {
  success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  failed: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300",
  ongoing: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
};

const cardBgClass = "bg-white dark:bg-zinc-950 dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 rounded-lg p-5 transition-all duration-200 group";

const tokens = {
  gray: GRAY,
  darkGray: DARK_GRAY,
  borderRadius: {
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
  },
  spacing: [0, 4, 8, 12, 16, 24, 32, 48],
  font: {
    family: "'Roboto', sans-serif",
    size: {
      base: 16,
      sm: 14,
      xs: 12,
      lg: 18,
      xl: 20,
      '2xl': 24,
    },
    weight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  shadow: {
    sm: "0 1px 2px rgba(0,0,0,0.05)",
    md: "0 4px 6px rgba(0,0,0,0.08)",
    lg: "0 10px 15px rgba(0,0,0,0.1)",
    card: "0 2px 8px rgba(0,0,0,0.06)",
    cardHover: "0 4px 16px rgba(0,0,0,0.12)",
  },
  cardStatusColors,
  cardResultColors,
  cardBgClass,
};

export default tokens;
