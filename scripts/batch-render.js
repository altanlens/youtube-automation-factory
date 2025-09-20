#!/usr/bin/env node

const { fastRender, FAST_RENDER_CONFIG, PREVIEW_CONFIG } = require('./fast-render');
const path = require('path');
const fs = require('fs');

// Batch render konfigürasyonu
const BATCH_CONFIG = {
  outputDir: './output',

  // Render sırasındaki ayarlar
  modes: {
    production: FAST_RENDER_CONFIG,
    preview: PREVIEW_CONFIG,
    ultra_fast: {
      ...PREVIEW_CONFIG,
      quality: 20,
      scale: 0.3,
      fps: 10,
      crf: 35
    }
  }
};

async function batchRender(compositions, mode = 'preview') {
  const config = BATCH_CONFIG.modes[mode];
  const outputDir = BATCH_CONFIG.outputDir;

  // Output dizini oluştur
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`🎬 Batch render başlatılıyor (${mode} modu)`);
  console.log(`📁 Çıktı dizini: ${outputDir}`);
  console.log(`🎯 ${compositions.length} kompozisyon render edilecek`);

  const results = [];
  const startTime = Date.now();

  for (let i = 0; i < compositions.length; i++) {
    const composition = compositions[i];
    const outputPath = path.join(outputDir, `${composition.id}-${mode}.mp4`);

    try {
      console.log(`\n[${i + 1}/${compositions.length}] ${composition.id} render ediliyor...`);

      await fastRender(composition.id, outputPath, config);

      results.push({
        composition: composition.id,
        status: 'success',
        output: outputPath,
        size: fs.statSync(outputPath).size
      });

    } catch (error) {
      console.error(`❌ Hata (${composition.id}):`, error.message);
      results.push({
        composition: composition.id,
        status: 'error',
        error: error.message
      });
    }
  }

  const totalTime = (Date.now() - startTime) / 1000;
  const successful = results.filter(r => r.status === 'success').length;
  const failed = results.filter(r => r.status === 'error').length;

  console.log(`\n📊 Batch Render Raporu:`);
  console.log(`⏱️  Toplam süre: ${totalTime.toFixed(1)}s`);
  console.log(`✅ Başarılı: ${successful}`);
  console.log(`❌ Başarısız: ${failed}`);

  if (successful > 0) {
    const totalSize = results
      .filter(r => r.status === 'success')
      .reduce((sum, r) => sum + r.size, 0);
    console.log(`📄 Toplam dosya boyutu: ${(totalSize / 1024 / 1024).toFixed(1)}MB`);
  }

  return results;
}

// Önceden tanımlı kompozisyon setleri
const PRESET_COMPOSITIONS = {
  all: [
    { id: 'SimpleExcalidraw' },
    // Diğer kompozisyonlar eklenebilir
  ],

  test: [
    { id: 'SimpleExcalidraw' }
  ]
};

// CLI kullanımı
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.log(`
🎬 Batch Render Script

Kullanım:
  node scripts/batch-render.js <preset|composition-list> [mode]

Presetler:
  all   - Tüm kompozisyonlar
  test  - Test kompozisyonu

Modlar:
  preview    - En hızlı (Quality 30%, Scale 0.5, 15 FPS)
  production - Hızlı (Quality 50%, Scale 0.8, 24 FPS)
  ultra_fast - Ultra hızlı (Quality 20%, Scale 0.3, 10 FPS)

Örnekler:
  node scripts/batch-render.js test preview
  node scripts/batch-render.js all production
  node scripts/batch-render.js "MyVideo1,MyVideo2" preview
    `);
    process.exit(1);
  }

  const [compositionInput, mode = 'preview'] = args;

  let compositions;
  if (PRESET_COMPOSITIONS[compositionInput]) {
    compositions = PRESET_COMPOSITIONS[compositionInput];
  } else {
    // Virgülle ayrılmış liste
    const compositionIds = compositionInput.split(',');
    compositions = compositionIds.map(id => ({ id: id.trim() }));
  }

  batchRender(compositions, mode)
    .then(() => {
      console.log('\n🎉 Batch render tamamlandı!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Batch render hatası:', error);
      process.exit(1);
    });
}

module.exports = { batchRender, BATCH_CONFIG };