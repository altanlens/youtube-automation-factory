// Excalidraw Element Types (simplified for our use case)
export interface ExcalidrawElement {
  id: string;
  type: 'rectangle' | 'ellipse' | 'diamond' | 'line' | 'arrow' | 'text' | 'draw' | 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  strokeColor: string;
  backgroundColor: string;
  fillStyle: 'hachure' | 'cross-hatch' | 'solid' | 'zigzag';
  strokeWidth: number;
  strokeStyle: 'solid' | 'dashed' | 'dotted';
  roughness: number;
  opacity: number;
  seed: number;
  versionNonce: number;
  isDeleted: boolean;
  text?: string;
  fontSize?: number;
  fontFamily?: number;
  textAlign?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  points?: number[][];
  startArrowhead?: 'arrow' | 'dot' | 'triangle' | null;
  endArrowhead?: 'arrow' | 'dot' | 'triangle' | null;
}

export interface ExcalidrawScene {
  elements: ExcalidrawElement[];
  appState?: {
    viewBackgroundColor?: string;
    gridSize?: number | null;
  };
}

// Analysis JSON Structure for our automation pipeline
export interface AnalysisJson {
  version: string;
  metadata: {
    title: string;
    description: string;
    duration: number;
    style: 'educational' | 'business' | 'motivational' | 'technical';
    language: string;
  };
  scenes: SceneData[];
  audio?: {
    narration: string;
    backgroundMusic?: string;
    volume: number;
  };
}

export interface SceneData {
  id: string;
  type: 'excalidraw' | 'text' | 'chart' | 'transition';
  start: number; // in seconds
  duration: number; // in seconds
  data: ExcalidrawScene | TextSceneData | ChartSceneData;
  animation?: {
    type: 'progressive-draw' | 'fade-in' | 'slide-in' | 'none';
    speed: 'slow' | 'normal' | 'fast';
    delay?: number;
  };
  audio?: {
    narration?: string;
    soundEffect?: string;
  };
}

export interface TextSceneData {
  title: string;
  subtitle?: string;
  content: string[];
  style: {
    fontSize: number;
    color: string;
    backgroundColor?: string;
    fontWeight: 'normal' | 'bold';
    textAlign: 'left' | 'center' | 'right';
  };
}

export interface ChartSceneData {
  type: 'line' | 'bar' | 'pie' | 'area';
  data: any[];
  labels?: string[];
  colors?: string[];
  title?: string;
  options?: Record<string, any>;
}

// Quality Control Types
export interface QualityCheckResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
  metrics: {
    textOverflow: boolean;
    audioSyncAccuracy: number;
    visualComplexity: number;
    contrastRatio: number;
    renderTime?: number;
  };
}

// Automation Pipeline Configuration
export interface AutomationPipelineConfig {
  input: {
    source: 'file' | 'api' | 'ai-generated';
    path?: string;
    apiEndpoint?: string;
    aiPrompt?: string;
  };
  processing: {
    validateSchema: boolean;
    autoFix: boolean;
    qualityChecks: string[];
  };
  output: {
    format: 'mp4' | 'webm' | 'mov';
    resolution: '1080p' | '720p' | '4k';
    fps: 24 | 30 | 60;
    uploadToYoutube: boolean;
    saveLocally: boolean;
  };
  notifications: {
    onSuccess: boolean;
    onError: boolean;
    webhook?: string;
  };
}