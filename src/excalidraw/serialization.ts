/**
 * Excalidraw JSON Serialization Utilities
 * Based on packages/excalidraw/data/json.ts
 */

import {
  EXPORT_DATA_TYPES,
  VERSIONS,
  getExportSource,
  MIME_TYPES,
  DEFAULT_FILENAME,
  getDefaultAppState,
} from "./constants";
import type {
  ExcalidrawElement,
  ExcalidrawFile,
  ExcalidrawClipboard,
  ExcalidrawLibrary,
  ExcalidrawAppState,
  BinaryFiles,
  LibraryItem,
  ExportedDataState,
  ExportedLibraryData,
} from "./types";

/**
 * Filters out files which are only referenced by deleted elements
 */
const filterOutDeletedFiles = (
  elements: readonly ExcalidrawElement[],
  files: BinaryFiles,
): BinaryFiles => {
  const nextFiles: BinaryFiles = {};
  for (const element of elements) {
    if (
      !element.isDeleted &&
      "fileId" in element &&
      element.fileId &&
      files[element.fileId]
    ) {
      nextFiles[element.fileId] = files[element.fileId];
    }
  }
  return nextFiles;
};

/**
 * Clean elements for export by removing temporary/UI state
 */
function cleanElementsForExport(elements: readonly ExcalidrawElement[]): ExcalidrawElement[] {
  return elements
    .filter(element => !element.isDeleted)
    .map(element => {
      // Remove any temporary/UI specific properties
      const { ...cleanElement } = element;
      return cleanElement;
    });
}

/**
 * Clean app state for export by removing UI-specific state
 */
function cleanAppStateForExport(appState: Partial<ExcalidrawAppState>): Partial<ExcalidrawAppState> {
  const {
    // Remove UI-specific state
    selectedElementIds,
    isLoading,
    errorMessage,
    activeTool,
    ...cleanState
  } = appState as any;
  
  return cleanState;
}

/**
 * Serializes Excalidraw data to JSON string
 */
export const serializeAsJSON = (
  elements: readonly ExcalidrawElement[],
  appState: Partial<ExcalidrawAppState>,
  files: BinaryFiles = {},
  type: "local" | "database" = "local",
): string => {
  const data: ExportedDataState = {
    type: EXPORT_DATA_TYPES.excalidraw,
    version: VERSIONS.excalidraw,
    source: getExportSource(),
    elements: cleanElementsForExport(elements),
    appState: cleanAppStateForExport(appState),
    files: type === "local" ? filterOutDeletedFiles(elements, files) : undefined,
  };

  return JSON.stringify(data, null, 2);
};

/**
 * Serializes clipboard data to JSON string
 */
export const serializeClipboardAsJSON = (
  elements: readonly ExcalidrawElement[],
  files: BinaryFiles = {},
): string => {
  const data: ExcalidrawClipboard = {
    type: EXPORT_DATA_TYPES.excalidrawClipboard,
    elements: cleanElementsForExport(elements),
    files: filterOutDeletedFiles(elements, files),
  };

  return JSON.stringify(data, null, 2);
};

/**
 * Serializes library data to JSON string
 */
export const serializeLibraryAsJSON = (libraryItems: LibraryItem[]): string => {
  const data: ExportedLibraryData = {
    type: EXPORT_DATA_TYPES.excalidrawLibrary,
    version: VERSIONS.excalidrawLibrary,
    source: getExportSource(),
    libraryItems,
  };
  return JSON.stringify(data, null, 2);
};

/**
 * Creates a complete Excalidraw file object
 */
export const createExcalidrawFile = (
  elements: ExcalidrawElement[] = [],
  appState: Partial<ExcalidrawAppState> = {},
  files: BinaryFiles = {},
): ExcalidrawFile => {
  const defaultAppState = getDefaultAppState();
  
  return {
    type: EXPORT_DATA_TYPES.excalidraw,
    version: VERSIONS.excalidraw,
    source: getExportSource(),
    elements: cleanElementsForExport(elements),
    appState: {
      ...defaultAppState,
      ...cleanAppStateForExport(appState),
    },
    files: filterOutDeletedFiles(elements, files),
  };
};

/**
 * Parses JSON string to Excalidraw data
 */
export const parseFromJSON = (jsonString: string): ExcalidrawFile | null => {
  try {
    const data = JSON.parse(jsonString);
    if (data?.type === EXPORT_DATA_TYPES.excalidraw) {
      return data as ExcalidrawFile;
    }
    return null;
  } catch {
    return null;
  }
};

/**
 * Parses clipboard JSON
 */
export const parseClipboardFromJSON = (jsonString: string): ExcalidrawClipboard | null => {
  try {
    const data = JSON.parse(jsonString);
    if (data?.type === EXPORT_DATA_TYPES.excalidrawClipboard) {
      return data as ExcalidrawClipboard;
    }
    return null;
  } catch {
    return null;
  }
};

/**
 * Parses library JSON
 */
export const parseLibraryFromJSON = (jsonString: string): ExcalidrawLibrary | null => {
  try {
    const data = JSON.parse(jsonString);
    if (data?.type === EXPORT_DATA_TYPES.excalidrawLibrary) {
      return data as ExcalidrawLibrary;
    }
    return null;
  } catch {
    return null;
  }
};

/**
 * Creates a blob from Excalidraw data
 */
export const createExcalidrawBlob = (
  elements: readonly ExcalidrawElement[],
  appState: Partial<ExcalidrawAppState>,
  files: BinaryFiles = {},
): Blob => {
  const serialized = serializeAsJSON(elements, appState, files, "local");
  return new Blob([serialized], {
    type: MIME_TYPES.excalidraw,
  });
};

/**
 * Gets filename with proper extension
 */
export const getExcalidrawFilename = (name?: string): string => {
  const baseName = name || DEFAULT_FILENAME;
  return baseName.endsWith(".excalidraw") ? baseName : `${baseName}.excalidraw`;
};

/**
 * Utility to merge app states
 */
export const mergeAppStates = (
  baseState: Partial<ExcalidrawAppState>,
  overrideState: Partial<ExcalidrawAppState>
): Partial<ExcalidrawAppState> => {
  return {
    ...baseState,
    ...overrideState,
  };
};

/**
 * Deep clone utility for Excalidraw data
 */
export const cloneExcalidrawData = <T>(data: T): T => {
  return JSON.parse(JSON.stringify(data));
};

/**
 * Validates and fixes common JSON issues
 */
export const sanitizeJSON = (jsonString: string): string => {
  try {
    const data = JSON.parse(jsonString);
    
    // Ensure required fields exist
    if (!data.type) {
      data.type = EXPORT_DATA_TYPES.excalidraw;
    }
    
    if (!data.version) {
      data.version = VERSIONS.excalidraw;
    }
    
    if (!data.source) {
      data.source = getExportSource();
    }
    
    if (!Array.isArray(data.elements)) {
      data.elements = [];
    }
    
    if (!data.appState || typeof data.appState !== 'object') {
      data.appState = getDefaultAppState();
    }
    
    if (!data.files || typeof data.files !== 'object') {
      data.files = {};
    }
    
    return JSON.stringify(data, null, 2);
  } catch (error) {
    throw new Error(`Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Export data with compression (removes unnecessary whitespace)
 */
export const serializeCompact = (
  elements: readonly ExcalidrawElement[],
  appState: Partial<ExcalidrawAppState>,
  files: BinaryFiles = {},
): string => {
  const data: ExportedDataState = {
    type: EXPORT_DATA_TYPES.excalidraw,
    version: VERSIONS.excalidraw,
    source: getExportSource(),
    elements: cleanElementsForExport(elements),
    appState: cleanAppStateForExport(appState),
    files: filterOutDeletedFiles(elements, files),
  };

  return JSON.stringify(data); // No indentation for compact output
};

/**
 * Batch process multiple Excalidraw files
 */
export const batchSerialize = (
  datasets: Array<{
    elements: ExcalidrawElement[];
    appState: Partial<ExcalidrawAppState>;
    files?: BinaryFiles;
    filename?: string;
  }>
): Array<{ filename: string; data: string }> => {
  return datasets.map((dataset, index) => ({
    filename: getExcalidrawFilename(dataset.filename || `drawing-${index + 1}`),
    data: serializeAsJSON(
      dataset.elements,
      dataset.appState,
      dataset.files || {}
    ),
  }));
};