#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const dotenv = require('dotenv');

dotenv.config();

const args = process.argv.slice(2);
const inputFile = args[0];

if (!inputFile) {
  console.error('Usage: npm run generate -- <input-file.json>');
  process.exit(1);
}

if (!fs.existsSync(inputFile)) {
  console.error(`Error: Input file ${inputFile} not found`);
  process.exit(1);
}

let videoConfig;
try {
  videoConfig = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
} catch (error) {
  console.error(`Error parsing JSON file: ${error.message}`);
  process.exit(1);
}

const outputDir = process.env.OUTPUT_DIR || 'output/videos';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const videoId = videoConfig.id || path.basename(inputFile, '.json');
const outputPath = path.join(outputDir, `${videoId}.mp4`);

console.log(`🎬 Generating video: ${videoId}`);
console.log(`📝 Input: ${inputFile}`);
console.log(`📹 Output: ${outputPath}`);

try {
  const compositionId = videoConfig.composition || 'Main';
  const fps = videoConfig.fps || process.env.VIDEO_FPS || 30;
  const width = videoConfig.width || process.env.VIDEO_WIDTH || 1920;
  const height = videoConfig.height || process.env.VIDEO_HEIGHT || 1080;

  console.log(`🔄 Rendering composition: ${compositionId}`);

  const command = `npx remotion render src/index.ts ${compositionId} ${outputPath} --props="${inputFile}" --fps=${fps} --width=${width} --height=${height} --log=verbose`;

  console.log(`⚙️ Executing: ${command}`);
  execSync(command, { stdio: 'inherit' });

  console.log(`✅ Video generated successfully: ${outputPath}`);
} catch (error) {
  console.error(`❌ Error generating video: ${error.message}`);
  process.exit(1);
}
