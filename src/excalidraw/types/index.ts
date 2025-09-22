/**
 * Excalidraw Core Types - Official Schema Compatible
 * Based on packages/element/src/types.ts from excalidraw/excalidraw
 */

// Brand types for type safety
export type Radians = number & { __brand: 'radians' };
export type LocalPoint = readonly [number, number];
export type GroupId = string & { __brand: 'GroupId' };
export type FileId = string & { __brand: 'FileId' };

// Font families from official Excalidraw
export const FONT_FAMILY = {
  Virgil: 1,
  Helvetica: 2, 
  Cascadia: 3,
  Excalifont: 5,
  Nunito: 6,
  'Lilita One': 7,
  'Comic Shanns': 8,
  'Liberation Sans': 9,
  Assistant: 10,
} as const;

export type FontFamilyValues = typeof FONT_FAMILY[keyof typeof FONT_FAMILY];

// Text alignment
export const TEXT_ALIGN = {
  LEFT: "left",
  CENTER: "center", 
  RIGHT: "right",
} as const;

export const VERTICAL_ALIGN = {
  TOP: "top",
  MIDDLE: "middle",
  BOTTOM: "bottom",
} as const;

export type TextAlign = typeof TEXT_ALIGN[keyof typeof TEXT_ALIGN];
export type VerticalAlign = typeof VERTICAL_ALIGN[keyof typeof VERTICAL_ALIGN];

// Fill styles
export type FillStyle = "hachure" | "cross-hatch" | "solid" | "zigzag";
export type StrokeStyle = "solid" | "dashed" | "dotted";

// Base element interface
interface _ExcalidrawElementBase {
  id: string;
  x: number;
  y: number; 
  width: number;
  height: number;
  strokeColor: string;
  backgroundColor: string;
  fillStyle: FillStyle;
  strokeWidth: number;
  strokeStyle: StrokeStyle;
  roundness: null | { type: 1 | 2 | 3; value: number };
  roughness: number;
  opacity: number;
  angle: Radians;
  seed: number;
  version: number;
  versionNonce: number;
  index: null | string;
  isDeleted: boolean;
  groupIds: readonly GroupId[];
  frameId: string | null;
  boundElements: readonly BoundElement[] | null;
  updated: number;
  link: string | null;
  locked: boolean;
}

// Specific element types
export interface ExcalidrawRectangleElement extends _ExcalidrawElementBase {
  type: "rectangle";
}

export interface ExcalidrawEllipseElement extends _ExcalidrawElementBase {
  type: "ellipse";
}

export interface ExcalidrawDiamondElement extends _ExcalidrawElementBase {
  type: "diamond";
}

export interface ExcalidrawTextElement extends _ExcalidrawElementBase {
  type: "text";
  text: string;
  fontSize: number;
  fontFamily: FontFamilyValues;
  textAlign: TextAlign;
  verticalAlign: VerticalAlign;
  containerId: string | null;
  originalText: string;
  autoResize: boolean;
  lineHeight: number;
}

export interface ExcalidrawLinearElement extends _ExcalidrawElementBase {
  type: "line";
  points: readonly LocalPoint[];
  lastCommittedPoint: LocalPoint | null;
  startBinding: PointBinding | null;
  endBinding: PointBinding | null;
  startArrowhead: Arrowhead | null;
  endArrowhead: Arrowhead | null;
}

export interface ExcalidrawArrowElement extends _ExcalidrawElementBase {
  type: "arrow";
  points: readonly LocalPoint[];
  lastCommittedPoint: LocalPoint | null;
  startBinding: PointBinding | null;
  endBinding: PointBinding | null;
  startArrowhead: Arrowhead | null;
  endArrowhead: Arrowhead | null;
  elbowed: boolean;
}

export interface ExcalidrawImageElement extends _ExcalidrawElementBase {
  type: "image";
  fileId: FileId;
  status: "pending" | "saved" | "error";
  scale: readonly [number, number];
  crop: ImageCrop | null;
}

export interface ExcalidrawFrameElement extends _ExcalidrawElementBase {
  type: "frame" | "magicframe";
  name: string | null;
}

export interface ExcalidrawFreeDrawElement extends _ExcalidrawElementBase {
  type: "freedraw";
  points: readonly LocalPoint[];
  pressures: readonly number[];
  simulatePressure: boolean;
  lastCommittedPoint: LocalPoint | null;
}

export interface ExcalidrawIframeElement extends _ExcalidrawElementBase {
  type: "iframe";
  url: string;
}

export interface ExcalidrawEmbeddableElement extends _ExcalidrawElementBase {
  type: "embeddable";
  url: string;
  intrinsicSize: { width: number; height: number } | null;
}

export interface ExcalidrawSelectionElement extends _ExcalidrawElementBase {
  type: "selection";
}

// Union type for all elements
export type ExcalidrawElement =
  | ExcalidrawRectangleElement
  | ExcalidrawEllipseElement
  | ExcalidrawDiamondElement
  | ExcalidrawTextElement
  | ExcalidrawLinearElement
  | ExcalidrawArrowElement
  | ExcalidrawImageElement
  | ExcalidrawFrameElement
  | ExcalidrawFreeDrawElement
  | ExcalidrawIframeElement
  | ExcalidrawEmbeddableElement
  | ExcalidrawSelectionElement;

// File format types
export interface ExcalidrawFile {
  type: "excalidraw";
  version: number;
  source: string;
  elements: readonly ExcalidrawElement[];
  appState: ExcalidrawAppState;
  files: BinaryFiles;
}

export interface ExcalidrawAppState {
  gridSize: number;
  viewBackgroundColor: string;
  currentItemStrokeColor: string;
  currentItemBackgroundColor: string;
  currentItemFillStyle: FillStyle;
  currentItemStrokeWidth: number;
  currentItemStrokeStyle: StrokeStyle;
  currentItemRoughness: number;
  currentItemOpacity: number;
  currentItemFontFamily: FontFamilyValues;
  currentItemFontSize: number;
  currentItemTextAlign: TextAlign;
  currentItemStartArrowhead: Arrowhead | null;
  currentItemEndArrowhead: Arrowhead | null;
  scrollX: number;
  scrollY: number;
  zoom: { value: number };
  currentItemRoundness: string;
  theme: "light" | "dark";
  activeTool: {
    type: string;
    locked?: boolean;
  };
  penMode: boolean;
  exportBackground: boolean;
  exportEmbedScene: boolean;
  exportWithDarkMode: boolean;
  exportScale: number;
  selectedElementIds: Record<string, boolean>;
  name: string;
  isBindingEnabled: boolean;
  isLoading: boolean;
  errorMessage: string | null;
}

export interface ExcalidrawClipboard {
  type: "excalidraw/clipboard";
  elements: readonly ExcalidrawElement[];
  files: BinaryFiles;
}

// Supporting interfaces
export interface BoundElement {
  id: string;
  type: "text" | "arrow";
}

export interface PointBinding {
  elementId: string;
  focus: number;
  gap: number;
}

export type Arrowhead = "arrow" | "dot" | "triangle";

export interface ImageCrop {
  x: number;
  y: number; 
  width: number;
  height: number;
}

export interface BinaryFiles {
  [id: FileId]: BinaryFileData;
}

export interface BinaryFileData {
  mimeType: string;
  id: FileId;
  dataURL: string;
  created: number;
  lastRetrieved?: number;
}

// Library types
export interface LibraryItem {
  id: string;
  status: "published" | "unpublished";
  elements: readonly ExcalidrawElement[];
  created: number;
}

export interface ExcalidrawLibrary {
  type: "excalidrawlib";
  version: number;
  source: string;
  libraryItems: readonly LibraryItem[];
}

export interface ExportedDataState {
  type: "excalidraw";
  version: number;
  source: string;
  elements: readonly ExcalidrawElement[];
  appState: Partial<ExcalidrawAppState>;
  files?: BinaryFiles;
}

export interface ExportedLibraryData {
  type: "excalidrawlib";
  version: number;
  source: string;
  libraryItems: readonly LibraryItem[];
}
