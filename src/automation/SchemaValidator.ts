import Ajv, { JSONSchemaType } from 'ajv';
import { AnalysisJson, SceneData, ExcalidrawScene } from '../excalidraw/types';

export class SchemaValidator {
  private static ajv = new Ajv({ allErrors: true });
  private static errors: string[] = [];

  // Analysis JSON Schema (simplified to avoid complex type issues)
  private static analysisJsonSchema: any = {
    type: 'object',
    properties: {
      version: { type: 'string' },
      metadata: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 100 },
          description: { type: 'string', maxLength: 5000 },
          duration: { type: 'number', minimum: 1, maximum: 3600 },
          style: {
            type: 'string',
            enum: ['educational', 'business', 'motivational', 'technical']
          },
          language: { type: 'string', minLength: 2, maxLength: 5 }
        },
        required: ['title', 'description', 'duration', 'style', 'language'],
        additionalProperties: false
      },
      scenes: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string', minLength: 1 },
            type: {
              type: 'string',
              enum: ['excalidraw', 'text', 'chart', 'transition']
            },
            start: { type: 'number', minimum: 0 },
            duration: { type: 'number', minimum: 0.1 },
            data: { type: 'object' }, // Flexible for different scene types
            animation: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: ['progressive-draw', 'fade-in', 'slide-in', 'none']
                },
                speed: {
                  type: 'string',
                  enum: ['slow', 'normal', 'fast']
                },
                delay: { type: 'number', minimum: 0, nullable: true }
              },
              required: ['type', 'speed'],
              additionalProperties: false,
              nullable: true
            },
            audio: {
              type: 'object',
              properties: {
                narration: { type: 'string', nullable: true },
                soundEffect: { type: 'string', nullable: true }
              },
              additionalProperties: false,
              nullable: true
            }
          },
          required: ['id', 'type', 'start', 'duration', 'data'],
          additionalProperties: false
        },
        minItems: 1
      },
      audio: {
        type: 'object',
        properties: {
          narration: { type: 'string' },
          backgroundMusic: { type: 'string', nullable: true },
          volume: { type: 'number', minimum: 0, maximum: 1 }
        },
        required: ['narration', 'volume'],
        additionalProperties: false,
        nullable: true
      }
    },
    required: ['version', 'metadata', 'scenes'],
    additionalProperties: false
  };

  // Excalidraw Scene Schema
  private static excalidrawSceneSchema = {
    type: 'object',
    properties: {
      elements: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            type: {
              type: 'string',
              enum: ['rectangle', 'ellipse', 'diamond', 'line', 'arrow', 'text', 'draw', 'image']
            },
            x: { type: 'number' },
            y: { type: 'number' },
            width: { type: 'number', minimum: 0 },
            height: { type: 'number', minimum: 0 },
            angle: { type: 'number' },
            strokeColor: { type: 'string' },
            backgroundColor: { type: 'string' },
            fillStyle: {
              type: 'string',
              enum: ['hachure', 'cross-hatch', 'solid', 'zigzag']
            },
            strokeWidth: { type: 'number', minimum: 0 },
            strokeStyle: {
              type: 'string',
              enum: ['solid', 'dashed', 'dotted']
            },
            roughness: { type: 'number', minimum: 0 },
            opacity: { type: 'number', minimum: 0, maximum: 1 },
            seed: { type: 'number' },
            versionNonce: { type: 'number' },
            isDeleted: { type: 'boolean' },
            text: { type: 'string', nullable: true },
            fontSize: { type: 'number', minimum: 1, nullable: true },
            fontFamily: { type: 'number', nullable: true },
            textAlign: {
              type: 'string',
              enum: ['left', 'center', 'right'],
              nullable: true
            },
            verticalAlign: {
              type: 'string',
              enum: ['top', 'middle', 'bottom'],
              nullable: true
            },
            points: {
              type: 'array',
              items: {
                type: 'array',
                items: { type: 'number' },
                minItems: 2,
                maxItems: 2
              },
              nullable: true
            },
            startArrowhead: {
              type: 'string',
              enum: ['arrow', 'dot', 'triangle'],
              nullable: true
            },
            endArrowhead: {
              type: 'string',
              enum: ['arrow', 'dot', 'triangle'],
              nullable: true
            }
          },
          required: [
            'id', 'type', 'x', 'y', 'width', 'height', 'angle',
            'strokeColor', 'backgroundColor', 'fillStyle', 'strokeWidth',
            'strokeStyle', 'roughness', 'opacity', 'seed', 'versionNonce', 'isDeleted'
          ],
          additionalProperties: true // Allow extra properties for flexibility
        }
      },
      appState: {
        type: 'object',
        properties: {
          viewBackgroundColor: { type: 'string', nullable: true },
          gridSize: { type: 'number', nullable: true }
        },
        additionalProperties: true,
        nullable: true
      }
    },
    required: ['elements'],
    additionalProperties: false
  };

  // Compile validators
  private static validateAnalysisJsonFn = SchemaValidator.ajv.compile(SchemaValidator.analysisJsonSchema);
  private static validateExcalidrawSceneFn = SchemaValidator.ajv.compile(SchemaValidator.excalidrawSceneSchema);

  // Validate Analysis JSON
  static validateAnalysisJson(data: any): data is AnalysisJson {
    SchemaValidator.errors = [];

    const isValid = SchemaValidator.validateAnalysisJsonFn(data);

    if (!isValid && SchemaValidator.validateAnalysisJsonFn.errors) {
      SchemaValidator.errors = SchemaValidator.validateAnalysisJsonFn.errors.map(
        error => `${error.instancePath || 'root'}: ${error.message}`
      );
    }

    // Additional business logic validations
    if (isValid) {
      const businessValidation = SchemaValidator.validateBusinessRules(data as AnalysisJson);
      if (!businessValidation.isValid) {
        SchemaValidator.errors.push(...businessValidation.errors);
        return false;
      }
    }

    return isValid;
  }

  // Validate Excalidraw Scene
  static validateExcalidrawScene(data: any): data is ExcalidrawScene {
    SchemaValidator.errors = [];

    const isValid = SchemaValidator.validateExcalidrawSceneFn(data);

    if (!isValid && SchemaValidator.validateExcalidrawSceneFn.errors) {
      SchemaValidator.errors = SchemaValidator.validateExcalidrawSceneFn.errors.map(
        error => `${error.instancePath || 'root'}: ${error.message}`
      );
    }

    return isValid;
  }

  // Business logic validations
  private static validateBusinessRules(data: AnalysisJson): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check scene timing
    let totalDuration = 0;
    const sceneTimings: Array<{ start: number; end: number; id: string }> = [];

    for (const scene of data.scenes) {
      const endTime = scene.start + scene.duration;
      totalDuration = Math.max(totalDuration, endTime);

      // Check for overlapping scenes
      for (const existingScene of sceneTimings) {
        if (
          (scene.start >= existingScene.start && scene.start < existingScene.end) ||
          (endTime > existingScene.start && endTime <= existingScene.end) ||
          (scene.start <= existingScene.start && endTime >= existingScene.end)
        ) {
          errors.push(`Scene ${scene.id} overlaps with scene ${existingScene.id}`);
        }
      }

      sceneTimings.push({ start: scene.start, end: endTime, id: scene.id });
    }

    // Check if total duration matches metadata
    if (Math.abs(totalDuration - data.metadata.duration) > 1) {
      errors.push(`Total scene duration (${totalDuration}s) doesn't match metadata duration (${data.metadata.duration}s)`);
    }

    // Validate scene-specific data
    for (const scene of data.scenes) {
      if (scene.type === 'excalidraw') {
        if (!SchemaValidator.validateExcalidrawScene(scene.data)) {
          errors.push(`Invalid Excalidraw data in scene ${scene.id}: ${SchemaValidator.errors.join(', ')}`);
        }
      }

      // Check text length for text scenes
      if (scene.type === 'text' && scene.data) {
        const textData = scene.data as any;
        if (textData.content && Array.isArray(textData.content)) {
          const totalTextLength = textData.content.join(' ').length;
          const wordsPerSecond = 2.5; // Average reading speed
          const estimatedDuration = totalTextLength / (wordsPerSecond * 5); // 5 chars per word

          if (scene.duration < estimatedDuration * 0.5) {
            errors.push(`Scene ${scene.id}: Duration too short for text content`);
          }
        }
      }
    }

    // Check audio narration length if provided
    if (data.audio?.narration) {
      const words = data.audio.narration.split(' ').length;
      const estimatedSpeechDuration = words / 150; // 150 words per minute

      if (Math.abs(estimatedSpeechDuration - data.metadata.duration) > data.metadata.duration * 0.2) {
        errors.push(`Audio narration length doesn't match video duration`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Get validation errors
  static getErrors(): string[] {
    return [...SchemaValidator.errors];
  }

  // Validate specific scene types
  static validateSceneData(sceneType: string, data: any): boolean {
    SchemaValidator.errors = [];

    switch (sceneType) {
      case 'excalidraw':
        return SchemaValidator.validateExcalidrawScene(data);

      case 'text':
        return SchemaValidator.validateTextScene(data);

      case 'chart':
        return SchemaValidator.validateChartScene(data);

      default:
        SchemaValidator.errors.push(`Unknown scene type: ${sceneType}`);
        return false;
    }
  }

  private static validateTextScene(data: any): boolean {
    const requiredFields = ['title', 'content', 'style'];
    const errors: string[] = [];

    for (const field of requiredFields) {
      if (!(field in data)) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    if (data.content && !Array.isArray(data.content)) {
      errors.push('Content must be an array of strings');
    }

    if (data.style && typeof data.style !== 'object') {
      errors.push('Style must be an object');
    }

    SchemaValidator.errors = errors;
    return errors.length === 0;
  }

  private static validateChartScene(data: any): boolean {
    const requiredFields = ['type', 'data'];
    const errors: string[] = [];

    for (const field of requiredFields) {
      if (!(field in data)) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    if (data.type && !['line', 'bar', 'pie', 'area'].includes(data.type)) {
      errors.push('Invalid chart type');
    }

    if (data.data && !Array.isArray(data.data)) {
      errors.push('Chart data must be an array');
    }

    SchemaValidator.errors = errors;
    return errors.length === 0;
  }

  // Auto-fix common issues
  static autoFix(data: AnalysisJson): AnalysisJson {
    const fixed = JSON.parse(JSON.stringify(data)); // Deep clone

    // Fix overlapping scenes by adjusting start times
    fixed.scenes.sort((a: any, b: any) => a.start - b.start);

    let currentTime = 0;
    for (const scene of fixed.scenes) {
      if (scene.start < currentTime) {
        scene.start = currentTime;
      }
      currentTime = scene.start + scene.duration;
    }

    // Update total duration
    fixed.metadata.duration = currentTime;

    // Ensure minimum scene duration
    for (const scene of fixed.scenes) {
      if (scene.duration < 0.5) {
        scene.duration = 0.5;
      }
    }

    return fixed;
  }
}