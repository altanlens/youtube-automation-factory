/**
 * Excalidraw Schema Validation
 * Validates JSON data against Excalidraw schema
 */

import { 
  ExcalidrawFile, 
  ExcalidrawElement, 
  ExcalidrawAppState,
  ExcalidrawLibrary,
  ExcalidrawClipboard,
  BinaryFiles
} from "./types";
import { EXPORT_DATA_TYPES, VERSIONS } from "./constants";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates an Excalidraw file
 */
export function validateExcalidrawFile(data: any): data is ExcalidrawFile {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return false;
  }

  // Check required fields
  if (data.type !== EXPORT_DATA_TYPES.excalidraw) {
    errors.push(`Invalid type: expected "${EXPORT_DATA_TYPES.excalidraw}", got "${data.type}"`);
  }

  if (data.version !== VERSIONS.excalidraw) {
    errors.push(`Invalid version: expected ${VERSIONS.excalidraw}, got ${data.version}`);
  }

  if (!Array.isArray(data.elements)) {
    errors.push("Elements must be an array");
  }

  if (!data.appState || typeof data.appState !== 'object') {
    errors.push("AppState must be an object");
  }

  return errors.length === 0;
}

/**
 * Validates an Excalidraw element
 */
export function isValidElement(element: any): element is ExcalidrawElement {
  if (!element || typeof element !== 'object') {
    return false;
  }

  const requiredFields = ['id', 'type', 'x', 'y', 'width', 'height'];
  for (const field of requiredFields) {
    if (!(field in element)) {
      return false;
    }
  }

  // Validate element type
  const validTypes = [
    'rectangle', 'ellipse', 'diamond', 'line', 'arrow', 
    'text', 'image', 'freedraw', 'frame', 'magicframe',
    'iframe', 'embeddable', 'selection'
  ];
  
  if (!validTypes.includes(element.type)) {
    return false;
  }

  // Validate coordinates and dimensions
  if (typeof element.x !== 'number' || typeof element.y !== 'number') {
    return false;
  }

  if (typeof element.width !== 'number' || typeof element.height !== 'number') {
    return false;
  }

  return true;
}

/**
 * Type guard for text elements
 */
export function isTextElement(element: ExcalidrawElement): element is import("./types").ExcalidrawTextElement {
  return element.type === 'text';
}

/**
 * Type guard for arrow elements  
 */
export function isArrowElement(element: ExcalidrawElement): element is import("./types").ExcalidrawArrowElement {
  return element.type === 'arrow';
}

/**
 * Type guard for image elements
 */
export function isImageElement(element: ExcalidrawElement): element is import("./types").ExcalidrawImageElement {
  return element.type === 'image';
}

/**
 * Type guard for frame elements
 */
export function isFrameElement(element: ExcalidrawElement): element is import("./types").ExcalidrawFrameElement {
  return element.type === 'frame' || element.type === 'magicframe';
}

/**
 * Type guard for linear elements (line, arrow)
 */
export function isLinearElement(element: ExcalidrawElement): element is import("./types").ExcalidrawLinearElement {
  return element.type === 'line' || element.type === 'arrow';
}

/**
 * Validates array of elements
 */
export function isValidElementsArray(elements: any): elements is ExcalidrawElement[] {
  if (!Array.isArray(elements)) {
    return false;
  }

  return elements.every(element => isValidElement(element));
}

/**
 * Validates Excalidraw library data
 */
export function isValidLibrary(data: any): data is ExcalidrawLibrary {
  if (!data || typeof data !== 'object') {
    return false;
  }

  if (data.type !== EXPORT_DATA_TYPES.excalidrawLibrary) {
    return false;
  }

  if (data.version !== VERSIONS.excalidrawLibrary) {
    return false;
  }

  if (!Array.isArray(data.libraryItems)) {
    return false;
  }

  return true;
}

/**
 * Validates clipboard data
 */
export function isValidClipboard(data: any): data is ExcalidrawClipboard {
  if (!data || typeof data !== 'object') {
    return false;
  }

  if (data.type !== EXPORT_DATA_TYPES.excalidrawClipboard) {
    return false;
  }

  if (!Array.isArray(data.elements)) {
    return false;
  }

  return data.elements.every(isValidElement);
}

/**
 * Validates binary files data
 */
export function isValidBinaryFiles(files: any): files is BinaryFiles {
  if (!files || typeof files !== 'object') {
    return false;
  }

  for (const [fileId, fileData] of Object.entries(files)) {
    if (!fileData || typeof fileData !== 'object') {
      return false;
    }

    const file = fileData as any;
    if (!file.mimeType || !file.id || !file.dataURL || !file.created) {
      return false;
    }

    if (typeof file.mimeType !== 'string' || typeof file.dataURL !== 'string') {
      return false;
    }

    if (typeof file.created !== 'number') {
      return false;
    }
  }

  return true;
}

/**
 * Comprehensive validation with detailed results
 */
export function validateWithDetails(data: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Basic structure validation
    if (!data || typeof data !== 'object') {
      errors.push("Data must be an object");
      return { valid: false, errors, warnings };
    }

    // Type validation
    if (!data.type || typeof data.type !== 'string') {
      errors.push("Missing or invalid type field");
    }

    // Version validation
    if (!data.version || typeof data.version !== 'number') {
      errors.push("Missing or invalid version field");
    }

    // Elements validation
    if (!Array.isArray(data.elements)) {
      errors.push("Elements must be an array");
    } else {
      data.elements.forEach((element: any, index: number) => {
        if (!isValidElement(element)) {
          errors.push(`Invalid element at index ${index}`);
        }
      });
    }

    // App state validation
    if (!data.appState || typeof data.appState !== 'object') {
      errors.push("AppState must be an object");
    }

    // Add warnings for missing optional fields
    if (!data.source) {
      warnings.push("Missing source field");
    }

    if (!data.files) {
      warnings.push("Missing files field");
    }

  } catch (error) {
    errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Clean and fix common issues in Excalidraw data
 */
export function sanitizeExcalidrawData(data: any): any {
  if (!data || typeof data !== 'object') {
    throw new Error("Invalid data provided");
  }

  const sanitized = { ...data };

  // Ensure required fields exist
  if (!sanitized.type) {
    sanitized.type = EXPORT_DATA_TYPES.excalidraw;
  }

  if (!sanitized.version) {
    sanitized.version = VERSIONS.excalidraw;
  }

  if (!Array.isArray(sanitized.elements)) {
    sanitized.elements = [];
  }

  if (!sanitized.appState || typeof sanitized.appState !== 'object') {
    sanitized.appState = {};
  }

  if (!sanitized.files || typeof sanitized.files !== 'object') {
    sanitized.files = {};
  }

  // Clean elements array
  sanitized.elements = sanitized.elements.filter((element: any) => {
    return element && typeof element === 'object' && element.id && element.type;
  });

  return sanitized;
}