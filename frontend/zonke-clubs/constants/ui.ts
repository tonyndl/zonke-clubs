export const Colors = {
  // Base
  bg: "#0b0f1a",
  bgCard: "#0f131a",
  bgSecondary: "rgba(57, 243, 255, 0.15)",
  velvet: "#1a1e2a",
  white: "#ffffff",
  black: "#000000",

  // Cyan/Blue Palette
  primaryBlue: "#39f3ff",
  secondaryBlue: "#7ef9ff",
  accent: "#39f3ff",
  accentLight: "#7ef9ff",

  // Text
  platinum: "#e5e4e2",
  smoke: "#9aa4b2",
  lightGrey: "#9aa4b2",

  // Aliases for new components
  gold: "#39f3ff",
  goldLight: "#7ef9ff",
  champagne: "#d4f5f7",
};

export const Gradients = {
  accent: ["#39f3ff", "#7ef9ff", "#39f3ff"] as const,
  accentShimmer: [
    "transparent",
    "rgba(57, 243, 255, 0.3)",
    "transparent",
  ] as const,
  cardOverlay: ["transparent", "rgba(11, 15, 26, 0.8)"] as const,
  premiumCard: ["rgba(26, 30, 42, 0.9)", "rgba(18, 22, 31, 0.95)"] as const,
};
