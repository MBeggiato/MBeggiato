export type ThemeName = "light" | "dark";

export interface Theme {
  name: ThemeName;
  /** Primary ink for headlines and the logo body. */
  fg: string;
  /** Secondary text: labels, captions. */
  muted: string;
  /** Hairlines and empty contribution cells. */
  faint: string;
  /** Five-step ramp for contribution intensity, quietest first. */
  ramp: [string, string, string, string, string];
  /** Neutral the language colours are mixed toward, to calm them down. */
  desaturateToward: string;
}

export const THEMES: Record<ThemeName, Theme> = {
  light: {
    name: "light",
    fg: "#2d2d2c",
    muted: "#6f6f6a",
    faint: "#ebebe6",
    // Index 0 mirrors `faint` and is never drawn; every real level must be
    // clearly darker than an empty cell, or a single contribution reads as less
    // than none.
    ramp: ["#ebebe6", "#cfcfc8", "#a5a59d", "#6e6e68", "#2d2d2c"],
    desaturateToward: "#fafafa",
  },
  dark: {
    name: "dark",
    fg: "#fafafa",
    muted: "#9a9a95",
    faint: "#2a2a28",
    ramp: ["#2a2a28", "#454542", "#6d6d68", "#a8a8a3", "#fafafa"],
    desaturateToward: "#2d2d2c",
  },
};

export const THEME_NAMES: ThemeName[] = ["light", "dark"];

function parseHex(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function toHex(rgb: [number, number, number]): string {
  return "#" + rgb.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
}

/**
 * Language colours are useful signal but far louder than the rest of the brand,
 * so they get mixed toward the page tone before use.
 */
export function calm(color: string, theme: Theme, amount = 0.3): string {
  const a = parseHex(color);
  const b = parseHex(theme.desaturateToward);
  return toHex([
    a[0] + (b[0] - a[0]) * amount,
    a[1] + (b[1] - a[1]) * amount,
    a[2] + (b[2] - a[2]) * amount,
  ]);
}
