/**
 * Excalidraw JSON Schema - Main Export
 * Complete implementation of Excalidraw's official JSON schema
 */

// Core types
export * from "./types";
export * from "./types/math";

// Constants and enums
export * from "./constants";

// Validation utilities
export * from "./validation";

// Serialization utilities
export * from "./serialization";

// Element transformation utilities
export * from "./transforms";

// Utility functions
export * from "./utils";

// Re-export key types for convenience
export type {
  ExcalidrawFile,
  ExcalidrawElement,
  ExcalidrawAppState,
  ExcalidrawClipboard,
  ExcalidrawLibrary,
  BinaryFiles,
  LibraryItem,
} from "./types";

// Re-export key functions for convenience
export {
  createExcalidrawFile,
  serializeAsJSON,
  parseFromJSON,
} from "./serialization";

export {
  validateExcalidrawFile,
  isValidElement,
} from "./validation";

export {
  newRectangleElement,
  newEllipseElement,
  newTextElement,
  newArrowElement,
  newImageElement,
  newFrameElement,
} from "./transforms";

export {
  randomId,
  measureText,
  getFontString,
  distance,
  rotatePoint,
} from "./utils";

// Version info
export const EXCALIDRAW_SCHEMA_VERSION = "2.0.0";
export const COMPATIBLE_EXCALIDRAW_VERSION = "0.17.0+";

/**
 * Default export with commonly used functions
 */
const ExcalidrawSchema = {
  // File operations
  createFile: createExcalidrawFile,
  serialize: serializeAsJSON,
  parse: parseFromJSON,
  
  // Validation
  validate: validateExcalidrawFile,
  
  // Element creation
  elements: {
    rectangle: newRectangleElement,
    ellipse: newEllipseElement,
    text: newTextElement,
    arrow: newArrowElement,
    image: newImageElement,
    frame: newFrameElement,
  },
  
  // Utilities
  utils: {
    randomId,
    measureText,
    getFontString,
    distance,
    rotatePoint,
  },
  
  // Version info
  version: EXCALIDRAW_SCHEMA_VERSION,
  compatible: COMPATIBLE_EXCALIDRAW_VERSION,
};

export default ExcalidrawSchema;