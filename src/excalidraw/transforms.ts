/**
 * Excalidraw Element Transformation Utilities
 * Based on packages/excalidraw/data/transform.ts
 */

import { pointFrom } from "./types/math";
import {
  DEFAULT_FONT_FAMILY,
  DEFAULT_FONT_SIZE,
  DEFAULT_ELEMENT_PROPS,
  DEFAULT_DIMENSION,
} from "./constants";
import {
  randomId,
  measureText,
  getFontString,
  getLineHeight,
} from "./utils";
import type {
  ExcalidrawElement,
  ExcalidrawRectangleElement,
  ExcalidrawEllipseElement,
  ExcalidrawDiamondElement,
  ExcalidrawTextElement,
  ExcalidrawLinearElement,
  ExcalidrawArrowElement,
  ExcalidrawImageElement,
  ExcalidrawFrameElement,
  ExcalidrawFreeDrawElement,
  LocalPoint,
  FontFamilyValues,
  TextAlign,
  VerticalAlign,
  FileId,
  Radians,
} from "./types";

/**
 * Base element properties for new elements
 */
const getDefaultElementProps = () => ({
  id: randomId(),
  x: 0,
  y: 0,
  strokeColor: DEFAULT_ELEMENT_PROPS.strokeColor,
  backgroundColor: DEFAULT_ELEMENT_PROPS.backgroundColor,
  fillStyle: DEFAULT_ELEMENT_PROPS.fillStyle,
  strokeWidth: DEFAULT_ELEMENT_PROPS.strokeWidth,
  strokeStyle: DEFAULT_ELEMENT_PROPS.strokeStyle,
  roundness: null,
  roughness: DEFAULT_ELEMENT_PROPS.roughness,
  opacity: DEFAULT_ELEMENT_PROPS.opacity,
  angle: 0 as Radians,
  seed: Math.floor(Math.random() * 2 ** 31),
  version: 1,
  versionNonce: Math.floor(Math.random() * 2 ** 31),
  index: null,
  isDeleted: false,
  groupIds: [],
  frameId: null,
  boundElements: null,
  updated: Date.now(),
  link: null,
  locked: false,
});

/**
 * Creates a new rectangle element
 */
export const newRectangleElement = (
  opts: {
    x: number;
    y: number;
    width?: number;
    height?: number;
  } & Partial<ExcalidrawRectangleElement>
): ExcalidrawRectangleElement => {
  return {
    ...getDefaultElementProps(),
    type: "rectangle",
    width: opts.width || DEFAULT_DIMENSION,
    height: opts.height || DEFAULT_DIMENSION,
    ...opts,
  };
};

/**
 * Creates a new ellipse element
 */
export const newEllipseElement = (
  opts: {
    x: number;
    y: number;
    width?: number;
    height?: number;
  } & Partial<ExcalidrawEllipseElement>
): ExcalidrawEllipseElement => {
  return {
    ...getDefaultElementProps(),
    type: "ellipse",
    width: opts.width || DEFAULT_DIMENSION,
    height: opts.height || DEFAULT_DIMENSION,
    ...opts,
  };
};

/**
 * Creates a new diamond element
 */
export const newDiamondElement = (
  opts: {
    x: number;
    y: number;
    width?: number;
    height?: number;
  } & Partial<ExcalidrawDiamondElement>
): ExcalidrawDiamondElement => {
  return {
    ...getDefaultElementProps(),
    type: "diamond",
    width: opts.width || DEFAULT_DIMENSION,
    height: opts.height || DEFAULT_DIMENSION,
    ...opts,
  };
};

/**
 * Creates a new text element
 */
export const newTextElement = (
  opts: {
    x: number;
    y: number;
    text: string;
    fontSize?: number;
    fontFamily?: FontFamilyValues;
    textAlign?: TextAlign;
    verticalAlign?: VerticalAlign;
  } & Partial<ExcalidrawTextElement>
): ExcalidrawTextElement => {
  const fontFamily = opts.fontFamily || DEFAULT_FONT_FAMILY;
  const fontSize = opts.fontSize || DEFAULT_FONT_SIZE;
  const lineHeight = getLineHeight(fontFamily);
  const text = opts.text || "";
  
  // Measure text to get proper dimensions
  const metrics = measureText(
    text,
    getFontString({ fontFamily, fontSize }),
    lineHeight
  );

  return {
    ...getDefaultElementProps(),
    type: "text",
    width: metrics.width,
    height: metrics.height,
    text,
    fontSize,
    fontFamily,
    textAlign: opts.textAlign || "left",
    verticalAlign: opts.verticalAlign || "top",
    containerId: null,
    originalText: text,
    autoResize: true,
    lineHeight,
    ...opts,
  };
};

/**
 * Creates a new linear element (line)
 */
export const newLinearElement = (
  opts: {
    x: number;
    y: number;
    points?: readonly LocalPoint[];
    width?: number;
    height?: number;
  } & Partial<ExcalidrawLinearElement>
): ExcalidrawLinearElement => {
  const width = opts.width || 100;
  const height = opts.height || 0;
  const points = opts.points || [pointFrom(0, 0), pointFrom(width, height)];

  return {
    ...getDefaultElementProps(),
    type: "line",
    width,
    height,
    points,
    lastCommittedPoint: null,
    startBinding: null,
    endBinding: null,
    startArrowhead: null,
    endArrowhead: null,
    ...opts,
  };
};

/**
 * Creates a new arrow element
 */
export const newArrowElement = (
  opts: {
    x: number;
    y: number;
    points?: readonly LocalPoint[];
    width?: number;
    height?: number;
  } & Partial<ExcalidrawArrowElement>
): ExcalidrawArrowElement => {
  const width = opts.width || 100;
  const height = opts.height || 0;
  const points = opts.points || [pointFrom(0, 0), pointFrom(width, height)];

  return {
    ...getDefaultElementProps(),
    type: "arrow",
    width,
    height,
    points,
    lastCommittedPoint: null,
    startBinding: null,
    endBinding: null,
    startArrowhead: null,
    endArrowhead: "arrow",
    elbowed: false,
    ...opts,
  };
};

/**
 * Creates a new image element
 */
export const newImageElement = (
  opts: {
    x: number;
    y: number;
    fileId: FileId;
    width?: number;
    height?: number;
  } & Partial<ExcalidrawImageElement>
): ExcalidrawImageElement => {
  return {
    ...getDefaultElementProps(),
    type: "image",
    width: opts.width || DEFAULT_DIMENSION,
    height: opts.height || DEFAULT_DIMENSION,
    fileId: opts.fileId,
    status: "pending",
    scale: [1, 1],
    crop: null,
    ...opts,
  };
};

/**
 * Creates a new frame element
 */
export const newFrameElement = (
  opts: {
    x: number;
    y: number;
    width?: number;
    height?: number;
    name?: string;
  } & Partial<ExcalidrawFrameElement>
): ExcalidrawFrameElement => {
  return {
    ...getDefaultElementProps(),
    type: "frame",
    width: opts.width || DEFAULT_DIMENSION * 2,
    height: opts.height || DEFAULT_DIMENSION * 2,
    name: opts.name || null,
    ...opts,
  };
};

/**
 * Creates a new freedraw element
 */
export const newFreeDrawElement = (
  opts: {
    x: number;
    y: number;
    points?: readonly LocalPoint[];
    pressures?: readonly number[];
  } & Partial<ExcalidrawFreeDrawElement>
): ExcalidrawFreeDrawElement => {
  const points = opts.points || [pointFrom(0, 0)];
  const pressures = opts.pressures || [0.5];

  return {
    ...getDefaultElementProps(),
    type: "freedraw",
    width: 0,
    height: 0,
    points,
    pressures,
    simulatePressure: true,
    lastCommittedPoint: null,
    ...opts,
  };
};

/**
 * Updates element dimensions based on its bounds
 */
export const updateElementBounds = (
  element: ExcalidrawElement,
  nextX: number,
  nextY: number,
  nextWidth: number,
  nextHeight: number
): ExcalidrawElement => {
  return {
    ...element,
    x: nextX,
    y: nextY,
    width: nextWidth,
    height: nextHeight,
    version: element.version + 1,
    versionNonce: Math.floor(Math.random() * 2 ** 31),
    updated: Date.now(),
  };
};

/**
 * Duplicates an element with a new ID
 */
export const duplicateElement = (
  element: ExcalidrawElement,
  overrides: Partial<ExcalidrawElement> = {}
): ExcalidrawElement => {
  return {
    ...element,
    id: randomId(),
    version: 1,
    versionNonce: Math.floor(Math.random() * 2 ** 31),
    updated: Date.now(),
    ...overrides,
  };
};

/**
 * Moves element by delta
 */
export const moveElement = (
  element: ExcalidrawElement,
  deltaX: number,
  deltaY: number
): ExcalidrawElement => {
  return {
    ...element,
    x: element.x + deltaX,
    y: element.y + deltaY,
    version: element.version + 1,
    versionNonce: Math.floor(Math.random() * 2 ** 31),
    updated: Date.now(),
  };
};