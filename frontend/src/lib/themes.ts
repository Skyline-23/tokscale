/**
 * Color themes for contribution graph
 * Primary themes match GitHub's Primer design system
 * https://primer.style/product/foundations/color
 */

import type { Theme, ThemeName } from "./types";

/**
 * Theme definitions
 * Each theme has colors for background, text, meta (labels), and 5 intensity grades
 */
export const themes: Record<ThemeName, Theme> = {
  // GitHub Light - Primer colors
  standard: {
    name: "standard",
    background: "#ffffff",
    text: "#1f2328",      // fg-default
    meta: "#656d76",      // fg-muted
    grade4: "#216e39",    // green-700
    grade3: "#30a14e",    // green-600
    grade2: "#40c463",    // green-400
    grade1: "#9be9a8",    // green-200
    grade0: "#ebedf0",    // canvas-subtle
  },
  // GitHub Dark - Primer dark colors
  githubDark: {
    name: "githubDark",
    background: "#0d1117", // canvas-default
    text: "#e6edf3",       // fg-default
    meta: "#7d8590",       // fg-muted
    grade4: "#39d353",     // green-400
    grade3: "#26a641",     // green-500
    grade2: "#006d32",     // green-700
    grade1: "#0e4429",     // green-900
    grade0: "#161b22",     // canvas-subtle
  },
  // GitHub Dark Dimmed
  classic: {
    name: "classic",
    background: "#22272e", // canvas-default dimmed
    text: "#adbac7",       // fg-default dimmed
    meta: "#768390",       // fg-muted dimmed
    grade4: "#6bc46d",     // green-400 dimmed
    grade3: "#57ab5a",     // green-500 dimmed
    grade2: "#347d39",     // green-600 dimmed
    grade1: "#2b4f3f",     // green-800 dimmed
    grade0: "#2d333b",     // canvas-subtle dimmed
  },
  // Halloween theme
  halloween: {
    name: "halloween",
    background: "#ffffff",
    text: "#1f2328",
    meta: "#656d76",
    grade4: "#03001C",
    grade3: "#FE9600",
    grade2: "#FFC501",
    grade1: "#FFEE4A",
    grade0: "#ebedf0",
  },
  // Teal/Aquamarine
  teal: {
    name: "teal",
    background: "#ffffff",
    text: "#1f2328",
    meta: "#656d76",
    grade4: "#0e6d6d",
    grade3: "#0d9e9e",
    grade2: "#2dc5c5",
    grade1: "#7ee5e5",
    grade0: "#ebedf0",
  },
  // Monochrome dark
  leftPad: {
    name: "leftPad",
    background: "#0d1117",
    text: "#e6edf3",
    meta: "#7d8590",
    grade4: "#ffffff",
    grade3: "#c9d1d9",
    grade2: "#8b949e",
    grade1: "#484f58",
    grade0: "#161b22",
  },
  // Dracula theme
  dracula: {
    name: "dracula",
    background: "#282a36",
    text: "#f8f8f2",
    meta: "#6272a4",
    grade4: "#ff79c6",
    grade3: "#bd93f9",
    grade2: "#6272a4",
    grade1: "#44475a",
    grade0: "#21222c",
  },
  // Blue theme
  blue: {
    name: "blue",
    background: "#0d1117",
    text: "#e6edf3",
    meta: "#7d8590",
    grade4: "#58a6ff",   // blue-400
    grade3: "#388bfd",   // blue-500
    grade2: "#1f6feb",   // blue-600
    grade1: "#0d419d",   // blue-800
    grade0: "#161b22",
  },
  // Panda theme
  panda: {
    name: "panda",
    background: "#292a2d",
    text: "#e6e6e6",
    meta: "#676b79",
    grade4: "#ff75b5",
    grade3: "#19f9d8",
    grade2: "#6fc1ff",
    grade1: "#3e4044",
    grade0: "#242526",
  },
  // Sunny/Yellow theme
  sunny: {
    name: "sunny",
    background: "#ffffff",
    text: "#1f2328",
    meta: "#656d76",
    grade4: "#9a6700",   // yellow-700
    grade3: "#bf8700",   // yellow-600
    grade2: "#d4a72c",   // yellow-500
    grade1: "#f0d675",   // yellow-300
    grade0: "#fef7dc",   // yellow-100
  },
  // Pink/Magenta theme
  pink: {
    name: "pink",
    background: "#ffffff",
    text: "#1f2328",
    meta: "#656d76",
    grade4: "#99286e",   // pink-700
    grade3: "#bf4b8a",   // pink-500
    grade2: "#d961a0",   // pink-400
    grade1: "#f0b5d2",   // pink-200
    grade0: "#ebedf0",
  },
  // YlGnBu (ColorBrewer)
  YlGnBu: {
    name: "YlGnBu",
    background: "#ffffff",
    text: "#1f2328",
    meta: "#656d76",
    grade4: "#253494",
    grade3: "#2c7fb8",
    grade2: "#41b6c4",
    grade1: "#a1dab4",
    grade0: "#ebedf0",
  },
  // Solarized Dark
  solarizedDark: {
    name: "solarizedDark",
    background: "#002b36",
    text: "#93a1a1",
    meta: "#586e75",
    grade4: "#d33682",
    grade3: "#b58900",
    grade2: "#2aa198",
    grade1: "#073642",
    grade0: "#073642",
  },
  // Solarized Light
  solarizedLight: {
    name: "solarizedLight",
    background: "#fdf6e3",
    text: "#586e75",
    meta: "#93a1a1",
    grade4: "#6c71c4",
    grade3: "#268bd2",
    grade2: "#2aa198",
    grade1: "#eee8d5",
    grade0: "#eee8d5",
  },
};

/**
 * Default theme name
 */
export const DEFAULT_THEME: ThemeName = "standard";

/**
 * Get all theme names
 */
export const getThemeNames = (): ThemeName[] => Object.keys(themes) as ThemeName[];

/**
 * Get theme by name
 */
export const getTheme = (name: ThemeName): Theme => themes[name] || themes[DEFAULT_THEME];

/**
 * Get grade color from theme based on intensity
 */
export const getGradeColor = (theme: Theme, intensity: 0 | 1 | 2 | 3 | 4): string => {
  switch (intensity) {
    case 0:
      return theme.grade0;
    case 1:
      return theme.grade1;
    case 2:
      return theme.grade2;
    case 3:
      return theme.grade3;
    case 4:
      return theme.grade4;
    default:
      return theme.grade0;
  }
};

/**
 * Check if theme is dark (for UI adaptation)
 */
export const isDarkTheme = (theme: Theme): boolean => {
  // Simple heuristic: if background is dark (low luminance)
  const hex = theme.background.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
};

/**
 * Dark themes list (for UI filtering)
 */
export const darkThemes: ThemeName[] = [
  "githubDark",
  "classic",
  "leftPad",
  "dracula",
  "blue",
  "panda",
  "solarizedDark",
];

/**
 * Light themes list (for UI filtering)
 */
export const lightThemes: ThemeName[] = [
  "standard",
  "halloween",
  "teal",
  "sunny",
  "pink",
  "YlGnBu",
  "solarizedLight",
];
