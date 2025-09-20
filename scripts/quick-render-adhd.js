#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🎬 ADHD Productivity Video - Quick Render');
console.log('========================================');

const outputDir = './output';
const outputFile = path.join(outputDir, 'adhd-productivity.mp4');

// Ensure output directory exists
try {
  execSync(`mkdir -p ${outputDir}`, { stdio: 'inherit' });
} catch (error) {
  console.log('Output directory already exists');
}

// Render with optimized settings
const renderCommand = `npx remotion render ADHDProductivity ${outputFile} --codec h264 --crf 28 --scale 0.75 --concurrency 1 --jpeg-quality 60`;

console.log('📹 Starting optimized render...');
console.log('Command:', renderCommand);

try {
  execSync(renderCommand, {
    stdio: 'inherit',
    timeout: 600000  // 10 minutes timeout
  });

  console.log('✅ Video rendered successfully!');
  console.log(`📁 Output: ${outputFile}`);

  // Check file size
  const stats = require('fs').statSync(outputFile);
  const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`📊 File size: ${fileSizeMB} MB`);

} catch (error) {
  console.error('❌ Render failed:', error.message);

  // Fallback: try with even lower settings
  console.log('🔄 Trying fallback render with lowest settings...');
  const fallbackCommand = `npx remotion render ADHDProductivity ${outputFile} --codec h264 --crf 35 --scale 0.5 --concurrency 1 --jpeg-quality 40`;

  try {
    execSync(fallbackCommand, {
      stdio: 'inherit',
      timeout: 300000  // 5 minutes timeout
    });
    console.log('✅ Fallback render completed!');
  } catch (fallbackError) {
    console.error('❌ Fallback render also failed:', fallbackError.message);
  }
}