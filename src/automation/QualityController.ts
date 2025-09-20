import { QualityCheckResult } from '../excalidraw/types';

export interface QualityCheckConfig {
  textOverflowThreshold: number;
  audioSyncTolerance: number;
  maxVisualComplexity: number;
  minContrastRatio: number;
  maxRenderTime: number;
}

export class QualityController {
  private defaultConfig: QualityCheckConfig = {
    textOverflowThreshold: 0.95, // 95% of container width
    audioSyncTolerance: 0.1, // 100ms tolerance
    maxVisualComplexity: 100, // Max elements per scene
    minContrastRatio: 4.5, // WCAG AA standard
    maxRenderTime: 300000, // 5 minutes max render time
  };

  async runChecks(
    compositionData: any,
    checkTypes: string[],
    config: Partial<QualityCheckConfig> = {}
  ): Promise<QualityCheckResult> {
    const mergedConfig = { ...this.defaultConfig, ...config };
    const errors: string[] = [];
    const warnings: string[] = [];

    let textOverflow = false;
    let audioSyncAccuracy = 1.0;
    let visualComplexity = 0;
    let contrastRatio = 5.0;
    let renderTime = 0;

    try {
      // Run requested quality checks
      for (const checkType of checkTypes) {
        switch (checkType) {
          case 'textOverflow':
            const textOverflowResult = await this.checkTextOverflow(compositionData, mergedConfig);
            textOverflow = textOverflowResult.hasOverflow;
            if (textOverflowResult.hasOverflow) {
              errors.push(...textOverflowResult.errors);
            }
            warnings.push(...textOverflowResult.warnings);
            break;

          case 'audioSync':
            const audioSyncResult = await this.checkAudioSync(compositionData, mergedConfig);
            audioSyncAccuracy = audioSyncResult.accuracy;
            if (audioSyncResult.accuracy < 0.9) {
              errors.push(`Poor audio sync accuracy: ${(audioSyncResult.accuracy * 100).toFixed(1)}%`);
            } else if (audioSyncResult.accuracy < 0.95) {
              warnings.push(`Audio sync accuracy could be improved: ${(audioSyncResult.accuracy * 100).toFixed(1)}%`);
            }
            break;

          case 'visualComplexity':
            const complexityResult = await this.checkVisualComplexity(compositionData, mergedConfig);
            visualComplexity = complexityResult.complexity;
            if (complexityResult.complexity > mergedConfig.maxVisualComplexity) {
              warnings.push(`High visual complexity: ${complexityResult.complexity} elements`);
            }
            break;

          case 'contrast':
            const contrastResult = await this.checkContrastRatio(compositionData, mergedConfig);
            contrastRatio = contrastResult.ratio;
            if (contrastResult.ratio < mergedConfig.minContrastRatio) {
              errors.push(`Low contrast ratio: ${contrastResult.ratio.toFixed(2)} (minimum: ${mergedConfig.minContrastRatio})`);
            }
            break;

          case 'renderTime':
            const renderTimeResult = await this.estimateRenderTime(compositionData, mergedConfig);
            renderTime = renderTimeResult.estimatedTime;
            if (renderTimeResult.estimatedTime > mergedConfig.maxRenderTime) {
              warnings.push(`Long estimated render time: ${Math.round(renderTimeResult.estimatedTime / 1000)}s`);
            }
            break;

          case 'sceneTransitions':
            const transitionResult = await this.checkSceneTransitions(compositionData);
            warnings.push(...transitionResult.warnings);
            break;

          case 'accessibility':
            const accessibilityResult = await this.checkAccessibility(compositionData);
            warnings.push(...accessibilityResult.warnings);
            if (accessibilityResult.errors.length > 0) {
              errors.push(...accessibilityResult.errors);
            }
            break;

          default:
            warnings.push(`Unknown quality check: ${checkType}`);
        }
      }

      const passed = errors.length === 0;

      return {
        passed,
        errors,
        warnings,
        metrics: {
          textOverflow,
          audioSyncAccuracy,
          visualComplexity,
          contrastRatio,
          renderTime,
        },
      };

    } catch (error) {
      return {
        passed: false,
        errors: [`Quality check failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings,
        metrics: {
          textOverflow: true,
          audioSyncAccuracy: 0,
          visualComplexity: 0,
          contrastRatio: 0,
          renderTime: 0,
        },
      };
    }
  }

  private async checkTextOverflow(
    compositionData: any,
    config: QualityCheckConfig
  ): Promise<{ hasOverflow: boolean; errors: string[]; warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let hasOverflow = false;

    if (!compositionData.scenes) {
      return { hasOverflow: false, errors, warnings };
    }

    for (const scene of compositionData.scenes) {
      if (scene.type === 'text' || (scene.type === 'excalidraw' && scene.data.elements)) {
        // Check text elements in Excalidraw scenes
        if (scene.type === 'excalidraw') {
          const textElements = scene.data.elements.filter((el: any) => el.type === 'text');

          for (const textEl of textElements) {
            if (textEl.text && textEl.text.length > 0) {
              // Estimate text width (rough calculation)
              const estimatedWidth = textEl.text.length * (textEl.fontSize || 16) * 0.6;
              const containerWidth = compositionData.width || 1920;

              if (estimatedWidth > containerWidth * config.textOverflowThreshold) {
                hasOverflow = true;
                errors.push(`Text overflow in scene ${scene.id}: "${textEl.text.substring(0, 50)}..."`);
              }
            }
          }
        }

        // Check standalone text scenes
        if (scene.type === 'text' && scene.data.content) {
          const textContent = Array.isArray(scene.data.content)
            ? scene.data.content.join(' ')
            : scene.data.content;

          if (textContent.length > 200) {
            warnings.push(`Long text in scene ${scene.id} (${textContent.length} characters)`);
          }
        }
      }
    }

    return { hasOverflow, errors, warnings };
  }

  private async checkAudioSync(
    compositionData: any,
    config: QualityCheckConfig
  ): Promise<{ accuracy: number }> {
    // Simulate audio sync check
    // In real implementation, this would analyze audio timing vs scene timing

    if (!compositionData.audio || !compositionData.scenes) {
      return { accuracy: 1.0 };
    }

    let totalSceneDuration = 0;
    compositionData.scenes.forEach((scene: any) => {
      totalSceneDuration = Math.max(totalSceneDuration, scene.start + scene.duration);
    });

    const audioDuration = compositionData.metadata?.duration || totalSceneDuration;
    const timingDifference = Math.abs(totalSceneDuration - audioDuration);

    // Calculate accuracy based on timing difference
    const accuracy = Math.max(0, 1 - (timingDifference / audioDuration));

    return { accuracy };
  }

  private async checkVisualComplexity(
    compositionData: any,
    config: QualityCheckConfig
  ): Promise<{ complexity: number }> {
    let totalElements = 0;

    if (compositionData.scenes) {
      for (const scene of compositionData.scenes) {
        if (scene.type === 'excalidraw' && scene.data.elements) {
          totalElements += scene.data.elements.filter((el: any) => !el.isDeleted).length;
        }
      }
    }

    return { complexity: totalElements };
  }

  private async checkContrastRatio(
    compositionData: any,
    config: QualityCheckConfig
  ): Promise<{ ratio: number }> {
    // Simulate contrast ratio calculation
    // In real implementation, this would analyze color combinations

    let minContrast = 21; // Perfect contrast

    if (compositionData.scenes) {
      for (const scene of compositionData.scenes) {
        if (scene.type === 'excalidraw' && scene.data.elements) {
          for (const element of scene.data.elements) {
            if (element.type === 'text') {
              // Calculate contrast between text color and background
              const contrast = this.calculateColorContrast(
                element.strokeColor || '#000000',
                element.backgroundColor || '#ffffff'
              );
              minContrast = Math.min(minContrast, contrast);
            }
          }
        }
      }
    }

    return { ratio: minContrast };
  }

  private calculateColorContrast(color1: string, color2: string): number {
    // Simplified contrast calculation
    // Real implementation would use proper WCAG formula

    const hex1 = color1.replace('#', '');
    const hex2 = color2.replace('#', '');

    const r1 = parseInt(hex1.substr(0, 2), 16);
    const g1 = parseInt(hex1.substr(2, 2), 16);
    const b1 = parseInt(hex1.substr(4, 2), 16);

    const r2 = parseInt(hex2.substr(0, 2), 16);
    const g2 = parseInt(hex2.substr(2, 2), 16);
    const b2 = parseInt(hex2.substr(4, 2), 16);

    const brightness1 = (r1 * 299 + g1 * 587 + b1 * 114) / 1000;
    const brightness2 = (r2 * 299 + g2 * 587 + b2 * 114) / 1000;

    const brightest = Math.max(brightness1, brightness2);
    const darkest = Math.min(brightness1, brightness2);

    return (brightest + 0.05) / (darkest + 0.05);
  }

  private async estimateRenderTime(
    compositionData: any,
    config: QualityCheckConfig
  ): Promise<{ estimatedTime: number }> {
    // Estimate render time based on composition complexity

    let baseTime = 5000; // 5 seconds base

    if (compositionData.scenes) {
      baseTime += compositionData.scenes.length * 1000; // 1 second per scene

      for (const scene of compositionData.scenes) {
        if (scene.type === 'excalidraw' && scene.data.elements) {
          baseTime += scene.data.elements.length * 100; // 100ms per element
        }
      }
    }

    // Factor in resolution
    const resolution = compositionData.width * compositionData.height;
    const hdResolution = 1920 * 1080;
    const resolutionMultiplier = resolution / hdResolution;

    const estimatedTime = baseTime * resolutionMultiplier;

    return { estimatedTime };
  }

  private async checkSceneTransitions(
    compositionData: any
  ): Promise<{ warnings: string[] }> {
    const warnings: string[] = [];

    if (!compositionData.scenes || compositionData.scenes.length < 2) {
      return { warnings };
    }

    // Check for gaps between scenes
    const sortedScenes = [...compositionData.scenes].sort((a, b) => a.start - b.start);

    for (let i = 1; i < sortedScenes.length; i++) {
      const prevScene = sortedScenes[i - 1];
      const currentScene = sortedScenes[i];

      const prevEnd = prevScene.start + prevScene.duration;
      const gap = currentScene.start - prevEnd;

      if (gap > 0.5) {
        warnings.push(`Large gap (${gap.toFixed(1)}s) between scenes ${prevScene.id} and ${currentScene.id}`);
      } else if (gap < 0) {
        warnings.push(`Scenes ${prevScene.id} and ${currentScene.id} overlap by ${Math.abs(gap).toFixed(1)}s`);
      }
    }

    return { warnings };
  }

  private async checkAccessibility(
    compositionData: any
  ): Promise<{ errors: string[]; warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for text readability
    if (compositionData.scenes) {
      let hasAudio = false;
      let hasVisualText = false;

      for (const scene of compositionData.scenes) {
        if (scene.audio?.narration) {
          hasAudio = true;
        }

        if (scene.type === 'text' ||
            (scene.type === 'excalidraw' && scene.data.elements?.some((el: any) => el.type === 'text'))) {
          hasVisualText = true;
        }
      }

      if (hasAudio && !hasVisualText) {
        warnings.push('Consider adding visual text/subtitles for accessibility');
      }

      if (hasVisualText && !hasAudio) {
        warnings.push('Consider adding audio narration for accessibility');
      }
    }

    return { errors, warnings };
  }
}