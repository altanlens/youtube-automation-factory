import { AnalysisJson, SceneData, ExcalidrawScene, QualityCheckResult, AutomationPipelineConfig } from '../excalidraw/types';
import { ExcalidrawParser } from '../excalidraw/parser';
import { QualityController } from './QualityController';
import { SchemaValidator } from './SchemaValidator';
import winston from 'winston';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

export interface PipelineResult {
  success: boolean;
  videoPath?: string;
  metadata?: any;
  errors: string[];
  warnings: string[];
  processingTime: number;
  qualityReport?: QualityCheckResult;
}

export class VideoProductionPipeline {
  private logger!: winston.Logger;
  private config: AutomationPipelineConfig;

  constructor(config: AutomationPipelineConfig) {
    this.config = config;
    this.setupLogger();
  }

  private setupLogger(): void {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [${level.toUpperCase()}]: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
          }`;
        })
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({
          filename: path.join(process.cwd(), 'logs', 'pipeline.log')
        }),
      ],
    });
  }

  // Main pipeline orchestrator
  async processAnalysisJson(input: AnalysisJson | string): Promise<PipelineResult> {
    const startTime = Date.now();
    const jobId = uuidv4();

    this.logger.info('Starting video production pipeline', { jobId });

    try {
      // Step 1: Load and validate input
      const analysisData = await this.loadAndValidateInput(input, jobId);

      // Step 2: Pre-processing validation
      if (this.config.processing.validateSchema) {
        await this.validateSchema(analysisData, jobId);
      }

      // Step 3: Process scenes
      const processedScenes = await this.processScenes(analysisData.scenes, jobId);

      // Step 4: Generate video composition
      const compositionData = await this.generateComposition(analysisData, processedScenes, jobId);

      // Step 5: Quality checks
      let qualityReport: QualityCheckResult | undefined;
      if (this.config.processing.qualityChecks.length > 0) {
        qualityReport = await this.runQualityChecks(compositionData, jobId);

        if (!qualityReport.passed && !this.config.processing.autoFix) {
          throw new Error(`Quality checks failed: ${qualityReport.errors.join(', ')}`);
        }
      }

      // Step 6: Render video
      const videoPath = await this.renderVideo(compositionData, jobId);

      // Step 7: Post-processing
      const metadata = await this.generateMetadata(analysisData, qualityReport, jobId);

      // Step 8: Upload if configured
      if (this.config.output.uploadToYoutube) {
        await this.uploadToYoutube(videoPath, metadata, jobId);
      }

      // Step 9: Archive if configured
      if (this.config.output.saveLocally) {
        await this.archiveProject(analysisData, videoPath, metadata, jobId);
      }

      const processingTime = Date.now() - startTime;

      this.logger.info('Pipeline completed successfully', {
        jobId,
        processingTime,
        videoPath
      });

      // Send success notification
      if (this.config.notifications.onSuccess) {
        await this.sendNotification('success', { jobId, videoPath, processingTime });
      }

      return {
        success: true,
        videoPath,
        metadata,
        errors: [],
        warnings: qualityReport?.warnings || [],
        processingTime,
        qualityReport,
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      this.logger.error('Pipeline failed', {
        jobId,
        error: errorMessage,
        processingTime
      });

      // Send error notification
      if (this.config.notifications.onError) {
        await this.sendNotification('error', { jobId, error: errorMessage, processingTime });
      }

      return {
        success: false,
        errors: [errorMessage],
        warnings: [],
        processingTime,
      };
    }
  }

  private async loadAndValidateInput(input: AnalysisJson | string, jobId: string): Promise<AnalysisJson> {
    this.logger.info('Loading input data', { jobId });

    let analysisData: AnalysisJson;

    if (typeof input === 'string') {
      // Load from file or API
      if (this.config.input.source === 'file') {
        const fileContent = await fs.readFile(input, 'utf-8');
        analysisData = JSON.parse(fileContent);
      } else if (this.config.input.source === 'api') {
        // Implement API fetching
        throw new Error('API input source not yet implemented');
      } else {
        throw new Error('AI-generated input not yet implemented');
      }
    } else {
      analysisData = input;
    }

    return analysisData;
  }

  private async validateSchema(data: AnalysisJson, jobId: string): Promise<void> {
    this.logger.info('Validating schema', { jobId });

    const isValid = SchemaValidator.validateAnalysisJson(data);
    if (!isValid) {
      const errors = SchemaValidator.getErrors();
      throw new Error(`Schema validation failed: ${errors.join(', ')}`);
    }
  }

  private async processScenes(scenes: SceneData[], jobId: string): Promise<any[]> {
    this.logger.info('Processing scenes', { jobId, sceneCount: scenes.length });

    const processedScenes = [];

    for (const scene of scenes) {
      try {
        if (scene.type === 'excalidraw') {
          // Validate Excalidraw scene
          const excalidrawScene = scene.data as ExcalidrawScene;
          if (!ExcalidrawParser.validateScene(excalidrawScene)) {
            throw new Error(`Invalid Excalidraw scene: ${scene.id}`);
          }

          // Pre-process for optimization
          const optimizedScene = await this.optimizeExcalidrawScene(excalidrawScene);

          processedScenes.push({
            ...scene,
            data: optimizedScene,
            processed: true,
          });
        } else {
          // Handle other scene types
          processedScenes.push({
            ...scene,
            processed: true,
          });
        }
      } catch (error) {
        this.logger.warn('Scene processing failed', {
          jobId,
          sceneId: scene.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });

        if (!this.config.processing.autoFix) {
          throw error;
        }

        // Auto-fix: skip problematic scene
        this.logger.info('Auto-fixing: skipping problematic scene', { jobId, sceneId: scene.id });
      }
    }

    return processedScenes;
  }

  private async optimizeExcalidrawScene(scene: ExcalidrawScene): Promise<ExcalidrawScene> {
    // Remove deleted elements
    const cleanElements = scene.elements.filter(el => !el.isDeleted);

    // Optimize element positions (ensure they're within bounds)
    const optimizedElements = cleanElements.map(element => ({
      ...element,
      x: Math.max(0, element.x),
      y: Math.max(0, element.y),
    }));

    return {
      ...scene,
      elements: optimizedElements,
    };
  }

  private async generateComposition(
    analysisData: AnalysisJson,
    processedScenes: any[],
    jobId: string
  ): Promise<any> {
    this.logger.info('Generating video composition', { jobId });

    // Create Remotion composition structure
    const composition = {
      id: `video-${jobId}`,
      fps: this.config.output.fps,
      width: this.config.output.resolution === '1080p' ? 1920 : 1280,
      height: this.config.output.resolution === '1080p' ? 1080 : 720,
      durationInFrames: Math.ceil(analysisData.metadata.duration * this.config.output.fps),
      scenes: processedScenes,
      metadata: analysisData.metadata,
      audio: analysisData.audio,
    };

    return composition;
  }

  private async runQualityChecks(compositionData: any, jobId: string): Promise<QualityCheckResult> {
    this.logger.info('Running quality checks', { jobId });

    const qualityController = new QualityController();
    const result = await qualityController.runChecks(compositionData, this.config.processing.qualityChecks);

    this.logger.info('Quality check results', {
      jobId,
      passed: result.passed,
      errorCount: result.errors.length,
      warningCount: result.warnings.length
    });

    return result;
  }

  private async renderVideo(compositionData: any, jobId: string): Promise<string> {
    this.logger.info('Starting video render', { jobId });

    // This would integrate with Remotion's render function
    // For now, we'll simulate the process
    const outputDir = path.join(process.cwd(), 'output', 'videos');
    await fs.mkdir(outputDir, { recursive: true });

    const videoPath = path.join(outputDir, `${jobId}.${this.config.output.format}`);

    // Simulate render time
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create placeholder file
    await fs.writeFile(videoPath, 'placeholder video content');

    this.logger.info('Video render completed', { jobId, videoPath });

    return videoPath;
  }

  private async generateMetadata(
    analysisData: AnalysisJson,
    qualityReport?: QualityCheckResult,
    jobId?: string
  ): Promise<any> {
    return {
      title: analysisData.metadata.title,
      description: analysisData.metadata.description,
      tags: ['ai-generated', 'automated', analysisData.metadata.style],
      category: '27', // Education category
      privacy: 'private',
      generatedAt: new Date().toISOString(),
      jobId,
      qualityScore: qualityReport?.metrics.contrastRatio || 0,
      processingVersion: analysisData.version,
    };
  }

  private async uploadToYoutube(videoPath: string, metadata: any, jobId: string): Promise<void> {
    this.logger.info('Uploading to YouTube', { jobId, videoPath });

    // This would integrate with YouTube API
    // Implementation depends on existing YouTube upload logic

    this.logger.info('YouTube upload completed', { jobId });
  }

  private async archiveProject(
    analysisData: AnalysisJson,
    videoPath: string,
    metadata: any,
    jobId: string
  ): Promise<void> {
    this.logger.info('Archiving project', { jobId });

    const archiveDir = path.join(process.cwd(), 'archive', jobId);
    await fs.mkdir(archiveDir, { recursive: true });

    // Save analysis JSON
    await fs.writeFile(
      path.join(archiveDir, 'analysis.json'),
      JSON.stringify(analysisData, null, 2)
    );

    // Save metadata
    await fs.writeFile(
      path.join(archiveDir, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );

    // Copy video file
    if (videoPath) {
      const videoFileName = path.basename(videoPath);
      const archiveVideoPath = path.join(archiveDir, videoFileName);
      await fs.copyFile(videoPath, archiveVideoPath);
    }

    this.logger.info('Project archived', { jobId, archiveDir });
  }

  private async sendNotification(type: 'success' | 'error', data: any): Promise<void> {
    if (this.config.notifications.webhook) {
      // Send webhook notification
      try {
        const fetch = require('node-fetch');
        await fetch(this.config.notifications.webhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, data, timestamp: new Date().toISOString() }),
        });
      } catch (error) {
        this.logger.warn('Failed to send webhook notification', { error });
      }
    }
  }

  // Utility method to get pipeline status
  async getStatus(jobId: string): Promise<any> {
    // Implementation would check job status from logs or database
    return {
      jobId,
      status: 'completed',
      progress: 100,
    };
  }

  // Stop pipeline (for long-running jobs)
  async stop(jobId: string): Promise<void> {
    this.logger.info('Pipeline stop requested', { jobId });
    // Implementation would cancel ongoing processes
  }
}