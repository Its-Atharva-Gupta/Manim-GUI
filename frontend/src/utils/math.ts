export const DEFAULT_FRAME_HEIGHT = 8;
export const DEFAULT_FRAME_ASPECT = 16 / 9;
export const DEFAULT_FRAME_WIDTH = DEFAULT_FRAME_HEIGHT * DEFAULT_FRAME_ASPECT;

export function pixelsPerUnitFromResolution(pixelWidth: number, pixelHeight: number): number {
  // Manim maps frame units to pixels via the configured frame size and pixel resolution.
  return Math.min(pixelWidth / DEFAULT_FRAME_WIDTH, pixelHeight / DEFAULT_FRAME_HEIGHT);
}

export function resolutionHeightPx(resolution: string): number {
  const normalized = resolution.toLowerCase().trim();
  if (normalized === "2160p" || normalized === "4k") return 2160;
  if (normalized === "1440p") return 1440;
  if (normalized === "1080p") return 1080;
  if (normalized === "720p") return 720;
  if (normalized === "480p") return 480;
  const m = normalized.match(/^(\d+)\s*p$/);
  if (m) return Number(m[1]);
  return 1080;
}

export function resolutionWidthPx(resolution: string): number {
  // MVP uses 16:9 like Manim defaults.
  const h = resolutionHeightPx(resolution);
  return Math.round(h * DEFAULT_FRAME_ASPECT);
}

export function sceneToCanvasX(sceneX: number, width: number, ppu: number): number {
  return width / 2 + sceneX * ppu;
}

export function sceneToCanvasY(sceneY: number, height: number, ppu: number): number {
  return height / 2 - sceneY * ppu;
}

export function canvasToSceneX(canvasX: number, width: number, ppu: number): number {
  return (canvasX - width / 2) / ppu;
}

export function canvasToSceneY(canvasY: number, height: number, ppu: number): number {
  return (height / 2 - canvasY) / ppu;
}
