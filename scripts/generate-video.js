#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const dotenv = require("dotenv");

dotenv.config();

const args = process.argv.slice(2);
const inputFile = args[0];

if (!inputFile) {
  console.error("Usage: npm run generate -- <input-file.json>");
  process.exit(1);
}

if (!fs.existsSync(inputFile)) {
  console.error(`Error: Input file ${inputFile} not found`);
  process.exit(1);
}

let videoConfig;
try {
  videoConfig = JSON.parse(fs.readFileSync(inputFile, "utf8"));
} catch (error) {
  console.error(`Error parsing JSON file: ${error.message}`);
  process.exit(1);
}

const outputDir = process.env.OUTPUT_DIR || "output/videos";
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const videoId = videoConfig.id || path.basename(inputFile, ".json");
const outputPath = path.join(outputDir, `${videoId}.mp4`);

console.log(`🎬 Generating video: ${videoId}`);
console.log(`📝 Input: ${inputFile}`);
console.log(`📹 Output: ${outputPath}`);

// Ses dosyasını public klasörüne kopyala (Remotion için)
if (videoConfig.audioPath && fs.existsSync(videoConfig.audioPath)) {
  const publicDir = "./public";
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const audioFileName = path.basename(videoConfig.audioPath);
  const publicAudioPath = path.join(publicDir, audioFileName);

  if (!fs.existsSync(publicAudioPath)) {
    fs.copyFileSync(videoConfig.audioPath, publicAudioPath);
    console.log(`🔊 Audio file copied to public: ${publicAudioPath}`);
  }

  // Config'deki ses yolunu güncelle
  videoConfig.audioPath = audioFileName;
  fs.writeFileSync(inputFile, JSON.stringify(videoConfig, null, 2));
}

try {
  const compositionId = videoConfig.composition || "AIVideo";
  const fps = videoConfig.fps || process.env.VIDEO_FPS || 30;
  const width = videoConfig.width || process.env.VIDEO_WIDTH || 1920;
  const height = videoConfig.height || process.env.VIDEO_HEIGHT || 1080;

  console.log(`🔄 Rendering composition: ${compositionId}`);
  console.log(`🎵 Audio included: ${videoConfig.audioPath ? "Yes" : "No"}`);

  // Props'ları JSON string olarak hazırla
  const propsJson = JSON.stringify(videoConfig).replace(/"/g, '\\"');

  const command = `npx remotion render src/index.ts ${compositionId} ${outputPath} --props="{${propsJson}}" --fps=${fps} --width=${width} --height=${height} --log=verbose --codec=h264`;

  console.log(`⚙️ Executing render command...`);
  execSync(command, { stdio: "inherit" });

  console.log(`✅ Video generated successfully: ${outputPath}`);

  // Ses dosyasının dahil edildiğini doğrula
  if (videoConfig.audioPath) {
    console.log(`🔊 Audio track included from: ${videoConfig.audioPath}`);
  }
} catch (error) {
  console.error(`❌ Error generating video: ${error.message}`);
  process.exit(1);
}
