import { AnalysisJson, SceneData } from '../excalidraw/types';

export interface GeminiConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ContentPrompt {
  topic: string;
  style: 'educational' | 'business' | 'motivational' | 'technical';
  duration: number;
  language: 'tr' | 'en';
  targetAudience?: string;
  keywords?: string[];
}

export class GeminiIntegration {
  private config: GeminiConfig;

  constructor(config: GeminiConfig) {
    this.config = {
      model: 'gemini-pro',
      temperature: 0.7,
      maxTokens: 2048,
      ...config
    };
  }

  async generateAnalysisFromPrompt(prompt: ContentPrompt): Promise<AnalysisJson> {
    try {
      console.log('🤖 Generating content with Gemini for topic:', prompt.topic);

      // Gemini API call simulation - replace with actual API
      const analysisJson = await this.callGeminiAPI(prompt);

      // Validate generated JSON
      if (!this.validateGeneratedAnalysis(analysisJson)) {
        throw new Error('Generated analysis JSON is invalid');
      }

      return analysisJson;
    } catch (error) {
      console.error('❌ Gemini generation failed:', error);
      throw new Error(`Failed to generate content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async callGeminiAPI(prompt: ContentPrompt): Promise<AnalysisJson> {
    // Mock implementation - replace with actual Gemini API call
    const mockAnalysis: AnalysisJson = {
      version: "1.0",
      metadata: {
        title: `${prompt.topic} - ${prompt.style} video`,
        description: `AI generated ${prompt.style} content about ${prompt.topic}`,
        duration: prompt.duration,
        style: prompt.style,
        language: prompt.language
      },
      scenes: await this.generateScenes(prompt),
      audio: {
        narration: `AI generated narration for ${prompt.topic}`,
        volume: 0.8
      }
    };

    return mockAnalysis;
  }

  private async generateScenes(prompt: ContentPrompt): Promise<SceneData[]> {
    const scenes: SceneData[] = [];
    const sceneDuration = Math.floor(prompt.duration / 3); // 3 scenes avg

    // Intro scene
    scenes.push({
      id: 'intro',
      type: 'text',
      start: 0,
      duration: sceneDuration,
      data: {
        title: prompt.topic,
        subtitle: this.getSubtitleByStyle(prompt.style),
        content: [
          `Bu videoda ${prompt.topic} konusunu öğreneceğiz`,
          'Detaylı açıklamalar ve görseller ile'
        ],
        style: {
          fontSize: 48,
          color: '#2196F3',
          fontWeight: 'bold',
          textAlign: 'center'
        }
      },
      animation: {
        type: 'fade-in',
        speed: 'normal'
      },
      audio: {
        narration: `Merhaba! Bugün ${prompt.topic} konusunu inceleyeceğiz.`
      }
    });

    // Main content scene with Excalidraw
    scenes.push({
      id: 'main-content',
      type: 'excalidraw',
      start: sceneDuration,
      duration: sceneDuration,
      data: {
        elements: [
          {
            id: 'main-title',
            type: 'text',
            x: 400,
            y: 200,
            width: 300,
            height: 50,
            angle: 0,
            strokeColor: '#2196F3',
            backgroundColor: 'transparent',
            fillStyle: 'solid',
            strokeWidth: 2,
            strokeStyle: 'solid',
            roughness: 1,
            opacity: 1,
            seed: Math.floor(Math.random() * 1000000),
            versionNonce: Math.floor(Math.random() * 1000000),
            isDeleted: false,
            text: prompt.topic,
            fontSize: 32,
            fontFamily: 1,
            textAlign: 'center',
            verticalAlign: 'middle'
          },
          {
            id: 'content-box',
            type: 'rectangle',
            x: 250,
            y: 150,
            width: 500,
            height: 300,
            angle: 0,
            strokeColor: '#4CAF50',
            backgroundColor: 'transparent',
            fillStyle: 'hachure',
            strokeWidth: 3,
            strokeStyle: 'solid',
            roughness: 1.5,
            opacity: 1,
            seed: Math.floor(Math.random() * 1000000),
            versionNonce: Math.floor(Math.random() * 1000000),
            isDeleted: false
          }
        ],
        appState: {
          viewBackgroundColor: '#ffffff'
        }
      },
      animation: {
        type: 'progressive-draw',
        speed: 'normal'
      },
      audio: {
        narration: `${prompt.topic} konusunda detaylı bilgileri inceleyelim.`
      }
    });

    return scenes;
  }

  private getSubtitleByStyle(style: string): string {
    const subtitles: Record<string, string> = {
      educational: 'Eğitim Serisi',
      business: 'İş Geliştirme',
      motivational: 'Motivasyon',
      technical: 'Teknik Açıklama'
    };
    return subtitles[style] || 'Video Serisi';
  }

  private validateGeneratedAnalysis(analysis: any): analysis is AnalysisJson {
    return (
      analysis &&
      analysis.version &&
      analysis.metadata &&
      analysis.scenes &&
      Array.isArray(analysis.scenes) &&
      analysis.scenes.length > 0
    );
  }

  // Prompt templates for different content types
  static getPromptTemplates() {
    return {
      educational: {
        systemPrompt: 'Sen eğitim videoları için içerik üreten bir AI asistanısın. Açık, anlaşılır ve öğretici içerikler üret.',
        template: 'Şu konuda {duration} saniye sürecek eğitici bir video senaryosu oluştur: {topic}'
      },
      business: {
        systemPrompt: 'Sen iş dünyası için içerik üreten bir AI asistanısın. Profesyonel, stratejik ve değer odaklı içerikler üret.',
        template: 'Şu iş konusunda {duration} saniye sürecek bir sunum senaryosu hazırla: {topic}'
      },
      motivational: {
        systemPrompt: 'Sen motivasyonel içerik üreten bir AI asistanısın. İlham verici, pozitif ve eylem odaklı içerikler üret.',
        template: 'Şu konuda {duration} saniye sürecek motivasyonel bir video senaryosu oluştur: {topic}'
      },
      technical: {
        systemPrompt: 'Sen teknik konularda içerik üreten bir AI asistanısın. Detaylı, doğru ve uygulamalı içerikler üret.',
        template: 'Şu teknik konuda {duration} saniye sürecek açıklayıcı bir video senaryosu hazırla: {topic}'
      }
    };
  }
}