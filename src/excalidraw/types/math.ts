/**
 * Math utilities for Excalidraw elements
 */

import type { LocalPoint, Radians } from './index';

export function pointFrom(x: number, y: number): LocalPoint {
  return [x, y] as const;
}

export function radiansToDegrees(radians: Radians): number {
  return (radians * 180) / Math.PI;
}

export function degreesToRadians(degrees: number): Radians {
  return (degrees * Math.PI / 180) as Radians;
}

export function rotatePoint(
  point: LocalPoint,
  center: LocalPoint, 
  angle: Radians
): LocalPoint {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const x = point[0] - center[0];
  const y = point[1] - center[1];
  
  return [
    x * cos - y * sin + center[0],
    x * sin + y * cos + center[1]
  ];
}

export function distance(a: LocalPoint, b: LocalPoint): number {
  return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
}

export function getPointsBounds(points: readonly LocalPoint[]) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const [x, y] of points) {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }

  return {
    minX,
    minY, 
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

export function normalizeAngle(angle: Radians): Radians {
  const TWO_PI = 2 * Math.PI;
  let normalized = angle % TWO_PI;
  if (normalized < 0) {
    normalized += TWO_PI;
  }
  return normalized as Radians;
}

export function getElementCenter(element: { x: number; y: number; width: number; height: number }): LocalPoint {
  return [
    element.x + element.width / 2,
    element.y + element.height / 2,
  ];
}

export function isPointInRect(
  point: LocalPoint,
  rect: { x: number; y: number; width: number; height: number }
): boolean {
  return (
    point[0] >= rect.x &&
    point[0] <= rect.x + rect.width &&
    point[1] >= rect.y &&
    point[1] <= rect.y + rect.height
  );
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
