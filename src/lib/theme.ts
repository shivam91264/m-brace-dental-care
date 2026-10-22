export const COLOR_KEYS = [
  ["primary", "Primary color"],
  ["secondary", "Secondary color"],
  ["accent", "Accent color"],
  ["background", "Background"],
  ["heading", "Heading color"],
  ["text", "Body text"],
  ["muted", "Secondary text"],
  ["button_bg", "Button background"],
  ["button_text", "Button text"],
  ["header_bg", "Header background"],
  ["footer_bg", "Footer background"],
  ["footer_text", "Footer text"],
  ["border", "Border color"],
] as const;

export type ColorKey = (typeof COLOR_KEYS)[number][0];
export type Palette = Record<ColorKey, string>;
export type ThemeSettings = { default_mode: "light" | "dark"; light: Palette; dark: Palette };

const DARK_DEFAULT: Palette = {
  primary: "#3FBAC6", secondary: "#7FD4DC", accent: "#123B40", background: "#0E171B",
  heading: "#EEF5F7", text: "#DCE6EA", muted: "#93A3AC", button_bg: "#3FBAC6",
  button_text: "#0E171B", header_bg: "#121E23", footer_bg: "#0A1215", footer_text: "#DCE6EA",
  border: "#24343B",
};

export const PRESETS: Record<string, { label: string; light: Palette; dark: Palette }> = {
  teal: {
    label: "Dental Teal",
    light: {
      primary: "#087F8C", secondary: "#075E68", accent: "#DDF5F0", background: "#F8FBFC",
      heading: "#202B33", text: "#202B33", muted: "#64727C", button_bg: "#087F8C",
      button_text: "#FFFFFF", header_bg: "#FFFFFF", footer_bg: "#075E68", footer_text: "#FFFFFF",
      border: "#E3EAED",
    },
    dark: DARK_DEFAULT,
  },
  blue: {
    label: "Medical Blue",
    light: {
      primary: "#1D5FBF", secondary: "#123E7C", accent: "#E3EEFB", background: "#F7F9FC",
      heading: "#16213A", text: "#1F2A3D", muted: "#5F6B7E", button_bg: "#1D5FBF",
      button_text: "#FFFFFF", header_bg: "#FFFFFF", footer_bg: "#123E7C", footer_text: "#FFFFFF",
      border: "#E2E8F0",
    },
    dark: { ...DARK_DEFAULT, primary: "#6EA8F5", secondary: "#A9CBF8", accent: "#15294A", button_bg: "#6EA8F5" },
  },
  mint: {
    label: "Fresh Mint",
    light: {
      primary: "#1E9E78", secondary: "#13644D", accent: "#E2F7EE", background: "#F7FCFA",
      heading: "#1B2C26", text: "#1F2D28", muted: "#5F7069", button_bg: "#1E9E78",
      button_text: "#FFFFFF", header_bg: "#FFFFFF", footer_bg: "#13644D", footer_text: "#FFFFFF",
      border: "#DFECE6",
    },
    dark: { ...DARK_DEFAULT, primary: "#4FD1A5", secondary: "#9BE7CC", accent: "#103A2D", button_bg: "#4FD1A5" },
  },
  neutral: {
    label: "Elegant Neutral",
    light: {
      primary: "#5B5246", secondary: "#2F2A24", accent: "#F1ECE4", background: "#FBFAF7",
      heading: "#221F1B", text: "#2A2622", muted: "#736B61", button_bg: "#2F2A24",
      button_text: "#FFFFFF", header_bg: "#FFFFFF", footer_bg: "#2F2A24", footer_text: "#F1ECE4",
      border: "#E8E2D8",
    },
    dark: { ...DARK_DEFAULT, primary: "#D2BFA3", secondary: "#E9DCC8", accent: "#2C261F", button_bg: "#D2BFA3" },
  },
};

export const DEFAULT_THEME: ThemeSettings = {
  default_mode: "light",
  light: PRESETS.teal.light,
  dark: PRESETS.teal.dark,
};

const HEX = /^#[0-9a-fA-F]{6}$/;
export const isHex = (v: unknown): v is string => typeof v === "string" && HEX.test(v);

/** Only accepts 6-digit hex values; anything else falls back to defaults. */
export function sanitizeTheme(raw: unknown): ThemeSettings {
  const r = (raw ?? {}) as Partial<ThemeSettings>;
  const clean = (p: unknown, fallback: Palette): Palette => {
    const src = (p ?? {}) as Record<string, unknown>;
    const out = {} as Palette;
    for (const [k] of COLOR_KEYS) out[k] = isHex(src[k]) ? (src[k] as string) : fallback[k];
    return out;
  };
  return {
    default_mode: r.default_mode === "dark" ? "dark" : "light",
    light: clean(r.light, DEFAULT_THEME.light),
    dark: clean(r.dark, DEFAULT_THEME.dark),
  };
}

function vars(p: Palette, card: string) {
  return [
    `--c-primary:${p.primary}`, `--c-secondary:${p.secondary}`, `--c-accent:${p.accent}`,
    `--c-background:${p.background}`, `--c-heading:${p.heading}`, `--c-text:${p.text}`,
    `--c-muted:${p.muted}`, `--c-button-bg:${p.button_bg}`, `--c-button-text:${p.button_text}`,
    `--c-header-bg:${p.header_bg}`, `--c-footer-bg:${p.footer_bg}`, `--c-footer-text:${p.footer_text}`,
    `--c-border:${p.border}`, `--c-card:${card}`,
  ].join(";");
}

export function themeToCss(t: ThemeSettings, scope = ":root") {
  const s = sanitizeTheme(t);
  const darkScope = scope === ":root" ? ".dark" : `.dark ${scope}, ${scope}.dark`;
  return `${scope}{${vars(s.light, "#FFFFFF")}}${darkScope}{${vars(s.dark, s.dark.header_bg)}}`;
}
