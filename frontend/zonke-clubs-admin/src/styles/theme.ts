export const theme = {
  colors: {
    // Base colors (matching mobile app)
    bg: "#0b0f1a",
    bgCard: "#0f1923",
    bgSecondary: "rgba(57, 243, 255, 0.15)",
    velvet: "#1a1e2a",
    white: "#ffffff",
    black: "#000000",

    // Cyan/Blue Palette (matching mobile app)
    primary: "#39f3ff",
    primaryHover: "#7ef9ff",
    primaryLight: "#a8fbff",
    primaryDark: "#1ed9e6",

    // Secondary colors
    secondary: "#7ef9ff",
    secondaryHover: "#a8fbff",
    accent: "#39f3ff",
    accentHover: "#7ef9ff",

    // Neutral colors
    background: "#0b0f1a",
    backgroundDark: "#080c15",
    backgroundCard: "#0f1923",
    backgroundGray: "#161b26",
    backgroundHover: "#1a1f2d",

    // Text colors (matching mobile app)
    text: "#e5e4e2",
    textPrimary: "#ffffff",
    textSecondary: "#9aa4b2",
    textLight: "#6b7280",
    textMuted: "#4b5563",

    // Border colors
    border: "rgba(57, 243, 255, 0.15)",
    borderLight: "rgba(57, 243, 255, 0.08)",
    borderHover: "rgba(57, 243, 255, 0.3)",

    // Status colors
    success: "#10b981",
    successLight: "rgba(16, 185, 129, 0.15)",
    successDark: "#059669",
    warning: "#f59e0b",
    warningLight: "rgba(245, 158, 11, 0.15)",
    warningDark: "#d97706",
    error: "#ef4444",
    errorLight: "rgba(239, 68, 68, 0.15)",
    errorDark: "#dc2626",
    info: "#3b82f6",
    infoLight: "rgba(59, 130, 246, 0.15)",
    infoDark: "#2563eb",

    // Card & component colors
    cardBackground: "#0f1923",
    cardBackgroundHover: "#141d29",
    cardBorder: "rgba(57, 243, 255, 0.15)",

    // Sidebar colors
    sidebarBackground: "#080c15",
    sidebarBackgroundGradient:
      "linear-gradient(180deg, #080c15 0%, #0b0f1a 100%)",
    sidebarText: "#9aa4b2",
    sidebarTextHover: "#ffffff",
    sidebarActive: "#39f3ff",
    sidebarActiveBg: "rgba(57, 243, 255, 0.15)",
    sidebarBorder: "rgba(57, 243, 255, 0.1)",

    // Glassmorphism
    glass: "rgba(15, 25, 35, 0.7)",
    glassBorder: "rgba(57, 243, 255, 0.2)",

    // Overlay
    overlay: "rgba(8, 12, 21, 0.8)",
    overlayLight: "rgba(8, 12, 21, 0.6)",
  },

  gradients: {
    primary: "linear-gradient(135deg, #39f3ff 0%, #7ef9ff 100%)",
    primaryHover: "linear-gradient(135deg, #7ef9ff 0%, #a8fbff 100%)",
    accent: "linear-gradient(90deg, #39f3ff 0%, #7ef9ff 50%, #39f3ff 100%)",
    card: "linear-gradient(135deg, rgba(15, 25, 35, 0.9) 0%, rgba(11, 15, 26, 0.95) 100%)",
    cardHover:
      "linear-gradient(135deg, rgba(15, 25, 35, 1) 0%, rgba(11, 15, 26, 1) 100%)",
    shimmer:
      "linear-gradient(90deg, transparent 0%, rgba(57, 243, 255, 0.3) 50%, transparent 100%)",
    backdrop:
      "linear-gradient(180deg, rgba(8, 12, 21, 0) 0%, rgba(8, 12, 21, 0.8) 100%)",
  },

  spacing: {
    xs: "0.25rem", // 4px
    sm: "0.5rem", // 8px
    md: "1rem", // 16px
    lg: "1.5rem", // 24px
    xl: "2rem", // 32px
    "2xl": "3rem", // 48px
    "3xl": "4rem", // 64px
  },

  borderRadius: {
    sm: "0.375rem", // 6px
    md: "0.5rem", // 8px
    lg: "0.75rem", // 12px
    xl: "1rem", // 16px
    "2xl": "1.5rem", // 24px
    full: "9999px",
  },

  shadows: {
    sm: "0 1px 3px 0 rgba(0, 0, 0, 0.3)",
    md: "0 4px 12px 0 rgba(0, 0, 0, 0.4)",
    lg: "0 10px 25px 0 rgba(0, 0, 0, 0.5)",
    xl: "0 20px 40px 0 rgba(0, 0, 0, 0.6)",
    glow: "0 0 20px rgba(57, 243, 255, 0.3)",
    glowHover: "0 0 30px rgba(57, 243, 255, 0.5)",
    inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.3)",
  },

  typography: {
    fontFamily: {
      base: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      heading:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace',
    },
    fontSize: {
      xs: "0.75rem", // 12px
      sm: "0.875rem", // 14px
      base: "1rem", // 16px
      lg: "1.125rem", // 18px
      xl: "1.25rem", // 20px
      "2xl": "1.5rem", // 24px
      "3xl": "1.875rem", // 30px
      "4xl": "2.25rem", // 36px
      "5xl": "3rem", // 48px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  breakpoints: {
    mobile: "640px",
    tablet: "768px",
    desktop: "1024px",
    wide: "1280px",
    ultrawide: "1536px",
  },

  transitions: {
    fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
    normal: "300ms cubic-bezier(0.4, 0, 0.2, 1)",
    slow: "500ms cubic-bezier(0.4, 0, 0.2, 1)",
    bounce: "600ms cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  },

  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    toast: 1080,
  },

  effects: {
    blur: {
      sm: "blur(4px)",
      md: "blur(8px)",
      lg: "blur(12px)",
      xl: "blur(16px)",
    },
    backdropBlur: {
      sm: "backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);",
      md: "backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);",
      lg: "backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);",
      xl: "backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);",
    },
  },
} as const;

export type Theme = typeof theme;
