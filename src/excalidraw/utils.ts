/**
 * Excalidraw Utility Functions
 * Based on @excalidraw/common/src/utils.ts
 */

import type { FontFamilyValues, LocalPoint, Radians } from "./types";
import { FONT_FAMILY } from "./types";

/**
 * Generates a random ID for elements
 */
export const randomId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Gets font string for canvas text measurement
 */
export const getFontString = ({
  fontSize,
  fontFamily,
}: {
  fontSize: number;
  fontFamily: FontFamilyValues;
}): string => {
  const fontFamilyName = getFontFamilyName(fontFamily);
  return `${fontSize}px ${fontFamilyName}, sans-serif`;
};

/**
 * Gets font family name from ID
 */
export const getFontFamilyName = (fontFamily: FontFamilyValues): string => {
  const fontMap = Object.entries(FONT_FAMILY).find(
    ([_, value]) => value === fontFamily
  );
  return fontMap ? fontMap[0] : "Excalifont";
};

/**
 * Gets line height for font family
 */
export const getLineHeight = (fontFamily: FontFamilyValues): number => {
  // Default line heights based on font family
  switch (fontFamily) {
    case FONT_FAMILY.Cascadia:
    case FONT_FAMILY["Comic Shanns"]:
      return 1.2;
    default:
      return 1.35;
  }
};

/**
 * Measures text dimensions
 */
export const measureText = (
  text: string,
  font: string,
  lineHeight: number
): { width: number; height: number } => {
  // Create a temporary canvas for text measurement
  if (typeof document !== 'undefined') {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d")!;
    context.font = font;

    const lines = text.split("\n");
    const lineHeightPx = parseInt(font) * lineHeight;
    
    let maxWidth = 0;
    for (const line of lines) {
      const metrics = context.measureText(line);
      maxWidth = Math.max(maxWidth, metrics.width);
    }

    const height = lines.length * lineHeightPx;

    return {
      width: maxWidth,
      height,
    };
  }
  
  // Fallback for server-side
  const lines = text.split("\n");
  const avgCharWidth = parseInt(font) * 0.6; // Rough estimate
  const maxWidth = Math.max(...lines.map(line => line.length * avgCharWidth));
  const height = lines.length * parseInt(font) * lineHeight;
  
  return { width: maxWidth, height };
};

/**
 * Calculates distance between two points
 */
export const distance = (a: LocalPoint, b: LocalPoint): number => {
  return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
};

/**
 * Rotates a point around a center
 */
export const rotatePoint = (
  point: LocalPoint,
  center: LocalPoint,
  angle: Radians
): LocalPoint => {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const x = point[0] - center[0];
  const y = point[1] - center[1];
  
  return [
    x * cos - y * sin + center[0],
    x * sin + y * cos + center[1],
  ];
};

/**
 * Clamps a value between min and max
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Deep clones an object using JSON
 */
export const cloneJSON = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Converts degrees to radians
 */
export const degToRad = (degrees: number): Radians => {
  return (degrees * Math.PI / 180) as Radians;
};

/**
 * Converts radians to degrees
 */
export const radToDeg = (radians: Radians): number => {
  return radians * 180 / Math.PI;
};

/**
 * Gets center point of an element
 */
export const getElementCenter = (element: {
  x: number;
  y: number;
  width: number;
  height: number;
}): LocalPoint => {
  return [
    element.x + element.width / 2,
    element.y + element.height / 2,
  ];
};