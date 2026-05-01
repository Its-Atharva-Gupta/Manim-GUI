const COLOR_MAP: Record<string, string> = {
  WHITE: "#ffffff",
  BLACK: "#000000",
  RED: "#ff0000",
  GREEN: "#00ff00",
  BLUE: "#0000ff",
  YELLOW: "#ffff00",
  ORANGE: "#ffa500",
  PURPLE: "#800080",
  PINK: "#ffc0cb",
  TEAL: "#008080",
  GRAY: "#808080",
  GREY: "#808080"
};

export function normalizeToHex(value: string | undefined, fallbackHex = "#ffffff"): string {
  if (!value) return fallbackHex;
  const v = value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v.toLowerCase();
  const mapped = COLOR_MAP[v.toUpperCase()];
  if (mapped) return mapped;
  // Accept valid CSS colors (e.g. "blue") by leaving them as-is for CSS usage,
  // but for hex normalization we must return a hex string for <input type="color">.
  return fallbackHex;
}

export function normalizeToCssColor(value: string | undefined, fallback = "#ffffff"): string {
  if (!value) return fallback;
  const v = value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v.toLowerCase();
  const mapped = COLOR_MAP[v.toUpperCase()];
  if (mapped) return mapped;
  // Konva uses canvas styles; CSS named colors are fine, but Manim-style constants
  // like "BLUE" are not. Lowercase improves compatibility.
  return v.toLowerCase();
}

