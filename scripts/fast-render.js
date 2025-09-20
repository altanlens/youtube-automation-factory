#!/usr/bin/env node

const { renderMedia, getCompositions } = require('@remotion/renderer');
const path = require('path');
const fs = require('fs');

// Fast render ayarları
const FAST_RENDER_CONFIG = {
  // Video kalitesi
  jpegQuality: 50,
  scale: 0.8,

  // FPS optimizasyonu
  fps: 24, // 30'dan 24'e düşür

  // FFmpeg optimizasyonları
  pixelFormat: 'yuv420p',
  codec: 'h264',
  crf: 28, // Yüksek sıkıştırma

  // Render hızı artırma
  concurrency: require('os').cpus().length, // Tüm CPU kullan
  disallowParallelEncoding: false,
  enforceAudioTrack: false,

  // Chromium optimizasyonları
  chromiumOptions: {
    '--disable-web-security': null,
    '--disable-features': 'VizDisplayCompositor',
    '--no-sandbox': null,
    '--disable-gpu': null,
    '--disable-dev-shm-usage': null,
    '--memory-pressure-off': null
  }
};

// Preview kalitesi (daha da hızlı)
const PREVIEW_CONFIG = {
  ...FAST_RENDER_CONFIG,
  jpegQuality: 30,
  scale: 0.5,
  fps: 15,
  crf: 32
};

async function fastRender(compositionId, outputPath, config = FAST_RENDER_CONFIG) {
  try {
    console.log(`🚀 Fast render başlatılıyor: ${compositionId}`);
    console.log(`📁 Çıktı: ${outputPath}`);
    console.log(`⚙️ Kalite: ${config.jpegQuality}%, Ölçek: ${config.scale}, FPS: ${config.fps}`);

    const bundleLocation = path.join(__dirname, '../build');

    // Kompozisyonları al
    const compositions = await getCompositions(bundleLocation, {
      inputProps: {},
    });

    const composition = compositions.find(c => c.id === compositionId);
    if (!composition) {
      throw new Error(`Kompozisyon bulunamadı: ${compositionId}`);
    }

    console.log(`🎬 Kompozisyon: ${composition.id} (${composition.width}x${composition.height})`);

    // Render başlat
    const startTime = Date.now();

    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: config.codec,
      outputLocation: outputPath,
      inputProps: {},

      // Hız optimizasyonları
      imageFormat: 'jpeg',
      jpegQuality: config.jpegQuality,
      scale: config.scale,
      fps: config.fps,
      pixelFormat: config.pixelFormat,
      crf: config.crf,
      concurrency: config.concurrency,
      disallowParallelEncoding: config.disallowParallelEncoding,
      enforceAudioTrack: config.enforceAudioTrack,
      chromiumOptions: config.chromiumOptions,

      // Progress callback
      onProgress: ({renderedFrames, totalFrames, encodedFrames, encodedDoneIn, renderedDoneIn}) => {
        const progress = Math.round((renderedFrames / totalFrames) * 100);
        process.stdout.write(`\r🎯 İlerleme: ${progress}% (${renderedFrames}/${totalFrames} kare)`);
      }
    });

    const duration = (Date.now() - startTime) / 1000;
    console.log(`\n✅ Render tamamlandı! Süre: ${duration.toFixed(1)}s`);
    console.log(`📄 Dosya boyutu: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(1)}MB`);

  } catch (error) {
    console.error('❌ Render hatası:', error);
    process.exit(1);
  }
}

// CLI kullanımı
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log(`
🚀 Fast Render Script

Kullanım:
  node scripts/fast-render.js <composition-id> <output-path> [mode]

Örnekler:
  node scripts/fast-render.js MyVideo ./output/fast-video.mp4
  node scripts/fast-render.js MyVideo ./output/preview.mp4 preview

Modlar:
  fast    - Quality 50%, Scale 0.8, 24 FPS (varsayılan)
  preview - Quality 30%, Scale 0.5, 15 FPS (en hızlı)
    `);
    process.exit(1);
  }

  const [compositionId, outputPath, mode] = args;
  const config = mode === 'preview' ? PREVIEW_CONFIG : FAST_RENDER_CONFIG;

  fastRender(compositionId, outputPath, config);
}

module.exports = { fastRender, FAST_RENDER_CONFIG, PREVIEW_CONFIG };