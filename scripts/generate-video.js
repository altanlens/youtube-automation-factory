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
const tempOutputPath = path.join(outputDir, `${videoId}-no-audio.mp4`);
const finalOutputPath = path.join(outputDir, `${videoId}.mp4`);
const audioInputPath = path.join(process.cwd(), "public", videoConfig.audioUrl);

console.log(`🎬 Generating video: ${videoId}`);
console.log(`📝 Input: ${inputFile}`);
console.log(`🔇 Temporary (silent) output: ${tempOutputPath}`);
console.log(`🔊 Final output: ${finalOutputPath}`);

try {
  const compositionId = videoConfig.composition || "AiVideo";
  const fps = videoConfig.fps || process.env.VIDEO_FPS || 30;
  const width = videoConfig.width || process.env.VIDEO_WIDTH || 1920;
  const height = videoConfig.height || process.env.VIDEO_HEIGHT || 1080;

  console.log(`\n🔄 STEP 1: Rendering silent video with Remotion...`);
  const remotionCommand = `npx remotion render src/index.ts ${compositionId} ${tempOutputPath} --props="${inputFile}" --fps=${fps} --width=${width} --height=${height} --log=verbose`;

  console.log(`⚙️ Executing: ${remotionCommand}`);
  execSync(remotionCommand, { stdio: "inherit" });
  console.log(`✅ Silent video generated successfully: ${tempOutputPath}`);

  console.log(`\n🔄 STEP 2: Adding audio with FFmpeg...`);
  if (!fs.existsSync(audioInputPath)) {
    throw new Error(`Audio file not found at: ${audioInputPath}`);
  }

  // FFmpeg komutu: Sessiz videoyu ve ses dosyasını birleştirir.
  // -i: input dosyaları (video ve ses)
  // -c:v copy: Video stream'ini yeniden kodlamadan kopyala (çok daha hızlı)
  // -c:a aac: Ses stream'ini AAC formatına kodla (yaygın uyumluluk için)
  // -shortest: Çıktı videosunun süresini en kısa input'a göre ayarla (video veya sesten hangisi kısaysa)
  const ffmpegCommand = `ffmpeg -i "${tempOutputPath}" -i "${audioInputPath}" -c:v copy -c:a aac -shortest "${finalOutputPath}"`;

  console.log(`⚙️ Executing: ${ffmpegCommand}`);
  execSync(ffmpegCommand, { stdio: "inherit" });
  console.log(
    `✅ Audio added successfully. Final video is at: ${finalOutputPath}`
  );

  console.log(`\n🔄 STEP 3: Cleaning up temporary file...`);
  fs.unlinkSync(tempOutputPath);
  console.log(`✅ Temporary file deleted: ${tempOutputPath}`);
} catch (error) {
  console.error(`\n❌ Error generating video: ${error.message}`);
  // Hata durumunda geçici dosyayı silmeyi dene
  if (fs.existsSync(tempOutputPath)) {
    try {
      fs.unlinkSync(tempOutputPath);
      console.log(`🧹 Cleaned up temporary file after error.`);
    } catch (cleanupError) {
      console.error(
        `🧹 Error cleaning up temporary file: ${cleanupError.message}`
      );
    }
  }
  process.exit(1);
}
