import { AnalysisJson, SceneData, ExcalidrawScene, ExcalidrawElement } from '../excalidraw/types';
import { ExcalidrawShapes } from '../excalidraw/ExcalidrawRenderer';
import { v4 as uuidv4 } from 'uuid';

export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  category: 'educational' | 'business' | 'motivational' | 'technical';
  thumbnail?: string;
  parameters: TemplateParameter[];
  scenes: TemplateScene[];
}

export interface TemplateParameter {
  key: string;
  label: string;
  type: 'text' | 'number' | 'color' | 'image' | 'array';
  required: boolean;
  defaultValue?: any;
  placeholder?: string;
  min?: number;
  max?: number;
  options?: string[];
}

export interface TemplateScene {
  id: string;
  type: 'excalidraw' | 'text' | 'chart';
  duration: number;
  template: any;
  animation?: {
    type: 'progressive-draw' | 'fade-in' | 'slide-in' | 'none';
    speed: 'slow' | 'normal' | 'fast';
  };
}

export class TemplateEngine {
  private static templates: Map<string, TemplateConfig> = new Map();

  static registerTemplate(template: TemplateConfig): void {
    TemplateEngine.templates.set(template.id, template);
  }

  static getTemplates(): TemplateConfig[] {
    return Array.from(TemplateEngine.templates.values());
  }

  static getTemplate(id: string): TemplateConfig | undefined {
    return TemplateEngine.templates.get(id);
  }

  static generateFromTemplate(
    templateId: string,
    parameters: Record<string, any>
  ): AnalysisJson {
    const template = TemplateEngine.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    const metadata = {
      title: TemplateEngine.replacePlaceholders(template.name, parameters),
      description: TemplateEngine.replacePlaceholders(template.description, parameters),
      duration: template.scenes.reduce((total, scene) => total + scene.duration, 0),
      style: template.category,
      language: 'tr',
    };

    const scenes: SceneData[] = [];
    let currentTime = 0;

    for (const templateScene of template.scenes) {
      const scene: SceneData = {
        id: uuidv4(),
        type: templateScene.type,
        start: currentTime,
        duration: templateScene.duration,
        data: TemplateEngine.generateSceneData(templateScene, parameters),
        animation: templateScene.animation,
      };

      scenes.push(scene);
      currentTime += templateScene.duration;
    }

    return {
      version: '1.0',
      metadata,
      scenes,
    };
  }

  private static replacePlaceholders(text: string, parameters: Record<string, any>): string {
    let result = text;
    for (const [key, value] of Object.entries(parameters)) {
      const placeholder = `{{${key}}}`;
      result = result.replace(new RegExp(placeholder, 'g'), String(value));
    }
    return result;
  }

  private static generateSceneData(templateScene: TemplateScene, parameters: Record<string, any>): any {
    const template = JSON.parse(JSON.stringify(templateScene.template));

    switch (templateScene.type) {
      case 'excalidraw':
        return TemplateEngine.generateExcalidrawScene(template, parameters);
      case 'text':
        return TemplateEngine.generateTextScene(template, parameters);
      case 'chart':
        return TemplateEngine.generateChartScene(template, parameters);
      default:
        return template;
    }
  }

  private static generateExcalidrawScene(template: any, parameters: Record<string, any>): ExcalidrawScene {
    const elements: ExcalidrawElement[] = [];

    for (const elementTemplate of template.elements || []) {
      const element = { ...elementTemplate };

      if (element.text) {
        element.text = TemplateEngine.replacePlaceholders(element.text, parameters);
      }

      if (element.strokeColor && element.strokeColor.startsWith('{{')) {
        const colorKey = element.strokeColor.slice(2, -2);
        element.strokeColor = parameters[colorKey] || element.strokeColor;
      }

      elements.push(element);
    }

    return { elements, appState: template.appState || {} };
  }

  private static generateTextScene(template: any, parameters: Record<string, any>): any {
    const scene = { ...template };

    if (scene.title) {
      scene.title = TemplateEngine.replacePlaceholders(scene.title, parameters);
    }

    if (scene.content && Array.isArray(scene.content)) {
      scene.content = scene.content.map((text: string) =>
        TemplateEngine.replacePlaceholders(text, parameters)
      );
    }

    return scene;
  }

  private static generateChartScene(template: any, parameters: Record<string, any>): any {
    const scene = { ...template };

    if (scene.data && parameters.chartData) {
      scene.data = parameters.chartData;
    }

    if (scene.title) {
      scene.title = TemplateEngine.replacePlaceholders(scene.title, parameters);
    }

    return scene;
  }
}