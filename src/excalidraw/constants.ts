/**
 * Official Excalidraw Constants
 * Based on packages/common/src/constants.ts
 */

export const EXPORT_DATA_TYPES = {
  excalidraw: "excalidraw",
  excalidrawClipboard: "excalidraw/clipboard", 
  excalidrawLibrary: "excalidrawlib",
} as const;

export const MIME_TYPES = {
  excalidraw: "application/vnd.excalidraw+json",
  excalidrawClipboard: "application/vnd.excalidraw.clipboard+json",
  excalidrawLibrary: "application/vnd.excalidrawlib+json",
} as const;

export const VERSIONS = {
  excalidraw: 2,
  excalidrawLibrary: 2,
} as const;

export const DEFAULT_ELEMENT_PROPS = {
  strokeColor: "#1e1e1e",
  backgroundColor: "transparent",
  fillStyle: "hachure" as const,
  strokeWidth: 2,
  strokeStyle: "solid" as const,
  roughness: 1,
  opacity: 100,
} as const;

export const DEFAULT_DIMENSION = 100;
export const DEFAULT_FONT_SIZE = 20;
export const DEFAULT_FONT_FAMILY = 5; // Excalifont
export const DEFAULT_FILENAME = "drawing";

export const COLOR_PALETTE = {
  transparent: "transparent",
  black: "#1e1e1e",
  white: "#ffffff",
  red: "#e03131",
  pink: "#f783ac", 
  grape: "#da77f2",
  violet: "#9775fa",
  indigo: "#4c6ef5",
  blue: "#339af0",
  cyan: "#22b8cf",
  teal: "#20c997",
  green: "#51cf66",
  lime: "#94d82d",
  yellow: "#ffd43b",
  orange: "#ff922b",
} as const;

export const THEME = {
  LIGHT: "light",
  DARK: "dark",
} as const;

export const CANVAS_ONLY_ACTIONS = [
  "selectAll",
  "cut",
  "copy",
  "paste",
  "copyStyles",
  "selectAllElementsInFrame",
  "removeAllElementsFromFrame",
] as const;

export const GRID_SIZE = 20;

export const ZOOM_STEP = 0.1;
export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 30;

export const ELEMENT_READY_TO_ERASE_TIMEOUT = 150;
export const ELEMENT_UPDATE_TIMEOUT = 40;
export const ELEMENT_LINK_TOOLTIP_DELAY = 1000;

export const DOUBLE_CLICK_THRESHOLD = 300;
export const DRAGGING_THRESHOLD = 10;

export const DEFAULT_EXPORT_PADDING = 10;

export function getExportSource(): string {
  return "https://excalidraw.com";
}

export function isValidColor(color: string): boolean {
  const isHex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  const isRgb = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/.test(color);
  const isRgba = /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*([01]?\.?\d*)\s*\)$/.test(color);
  const isNamedColor = color === "transparent" || Object.values(COLOR_PALETTE).includes(color as any);
  
  return isHex || isRgb || isRgba || isNamedColor;
}

export function getDefaultAppState(): any {
  return {
    gridSize: GRID_SIZE,
    viewBackgroundColor: COLOR_PALETTE.white,
    currentItemStrokeColor: COLOR_PALETTE.black,
    currentItemBackgroundColor: COLOR_PALETTE.transparent,
    currentItemFillStyle: DEFAULT_ELEMENT_PROPS.fillStyle,
    currentItemStrokeWidth: DEFAULT_ELEMENT_PROPS.strokeWidth,
    currentItemStrokeStyle: DEFAULT_ELEMENT_PROPS.strokeStyle,
    currentItemRoughness: DEFAULT_ELEMENT_PROPS.roughness,
    currentItemOpacity: DEFAULT_ELEMENT_PROPS.opacity,
    currentItemFontFamily: DEFAULT_FONT_FAMILY,
    currentItemFontSize: DEFAULT_FONT_SIZE,
    scrollX: 0,
    scrollY: 0,
    zoom: { value: 1 },
    theme: THEME.LIGHT,
    exportBackground: true,
    exportEmbedScene: false,
    exportWithDarkMode: false,
    exportScale: 1,
  };
}