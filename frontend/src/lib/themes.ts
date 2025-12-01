/**
 * Color themes for contribution graph
 * Based on github-contributions-canvas themes
 * All 14 themes included
 */

import type { Theme, ThemeName } from "./types";

/**
 * Theme definitions
 * Each theme has colors for background, text, meta (labels), and 5 intensity grades
 */
export const themes: Record<ThemeName, Theme> = {
  standard: {
    name: "standard",
    background: "#ffffff",
    text: "#000000",
    meta: "#666666",
    grade4: "#216e39",
    grade3: "#30a14e",
    grade2: "#40c463",
    grade1: "#9be9a8",
    grade0: "#ebedf0",
  },
  classic: {
    name: "classic",
    background: "#ffffff",
    text: "#000000",
    meta: "#666666",
    grade4: "#196127",
    grade3: "#239a3b",
    grade2: "#7bc96f",
    grade1: "#c6e48b",
    grade0: "#ebedf0",
  },
  githubDark: {
    name: "githubDark",
    background: "#101217",
    text: "#ffffff",
    meta: "#dddddd",
    grade4: "#27d545",
    grade3: "#10983d",
    grade2: "#00602d",
    grade1: "#003820",
    grade0: "#161b22",
  },
  halloween: {
    name: "halloween",
    background: "#ffffff",
    text: "#000000",
    meta: "#666666",
    grade4: "#03001C",
    grade3: "#FE9600",
    grade2: "#FFC501",
    grade1: "#FFEE4A",
    grade0: "#ebedf0",
  },
  teal: {
    name: "teal",
    background: "#ffffff",
    text: "#000000",
    meta: "#666666",
    grade4: "#458B74",
    grade3: "#66CDAA",
    grade2: "#76EEC6",
    grade1: "#7FFFD4",
    grade0: "#ebedf0",
  },
  leftPad: {
    name: "leftPad",
    background: "#000000",
    text: "#ffffff",
    meta: "#999999",
    grade4: "#F6F6F6",
    grade3: "#DDDDDD",
    grade2: "#A5A5A5",
    grade1: "#646464",
    grade0: "#2F2F2F",
  },
  dracula: {
    name: "dracula",
    background: "#181818",
    text: "#f8f8f2",
    meta: "#666666",
    grade4: "#ff79c6",
    grade3: "#bd93f9",
    grade2: "#6272a4",
    grade1: "#44475a",
    grade0: "#282a36",
  },
  blue: {
    name: "blue",
    background: "#181818",
    text: "#C0C0C0",
    meta: "#666666",
    grade4: "#4F83BF",
    grade3: "#416895",
    grade2: "#344E6C",
    grade1: "#263342",
    grade0: "#222222",
  },
  panda: {
    name: "panda",
    background: "#2B2C2F",
    text: "#E6E6E6",
    meta: "#676B79",
    grade4: "#FF4B82",
    grade3: "#19f9d8",
    grade2: "#6FC1FF",
    grade1: "#34353B",
    grade0: "#242526",
  },
  sunny: {
    name: "sunny",
    background: "#ffffff",
    text: "#000000",
    meta: "#666666",
    grade4: "#a98600",
    grade3: "#dab600",
    grade2: "#e9d700",
    grade1: "#f8ed62",
    grade0: "#fff9ae",
  },
  pink: {
    name: "pink",
    background: "#ffffff",
    text: "#000000",
    meta: "#666666",
    grade4: "#61185f",
    grade3: "#a74aa8",
    grade2: "#ca5bcc",
    grade1: "#e48bdc",
    grade0: "#ebedf0",
  },
  YlGnBu: {
    name: "YlGnBu",
    background: "#ffffff",
    text: "#000000",
    meta: "#666666",
    grade4: "#253494",
    grade3: "#2c7fb8",
    grade2: "#41b6c4",
    grade1: "#a1dab4",
    grade0: "#ebedf0",
  },
  solarizedDark: {
    name: "solarizedDark",
    background: "#002b36",
    text: "#93a1a1",
    meta: "#586e75",
    grade4: "#d33682",
    grade3: "#b58900",
    grade2: "#2aa198",
    grade1: "#268bd2",
    grade0: "#073642",
  },
  solarizedLight: {
    name: "solarizedLight",
    background: "#fdf6e3",
    text: "#586e75",
    meta: "#93a1a1",
    grade4: "#6c71c4",
    grade3: "#dc322f",
    grade2: "#cb4b16",
    grade1: "#b58900",
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
  "classic",
  "halloween",
  "teal",
  "sunny",
  "pink",
  "YlGnBu",
  "solarizedLight",
];
