#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const dotenv = require("dotenv");
const { createAIVideo } = require("./create-ai-video");

dotenv.config();

const args = process.argv.slice(2);
let inputFile = args[0];

// Eğer JSON dosyası verilmemişse, AI ile oluştur
if (!inputFile) {
  console.log("📝 Input file not provided. Creating AI video...");
  const topic = args[0] || "Teknolojinin Geleceği";
  const length = parseInt(args[1]) || 2;

  console.log(`🤖 AI Video oluşturuluyor: "${topic}" (${length} dakika)`);
  try {
    inputFile = require("./create-ai-video").createAIVideo();
  } catch (error) {
    console.error(`❌ AI video creation failed: ${error.message}`);
    process.exit(1);
  }
}

if (!fs.existsSync(inputFile)) {
  console.error(`Error: Input file ${inputFile} not found`);
  process.exit(1);
}

console.log("🚀 Starting full video production pipeline");
console.log(`📝 Input: ${inputFile}`);

try {
  console.log("\n📹 STEP 1: Generating video with audio");
  execSync(`node scripts/generate-video.js ${inputFile}`, { stdio: "inherit" });
} catch (error) {
  console.error(`❌ Video generation failed: ${error.message}`);
  process.exit(1);
}

let videoConfig;
try {
  videoConfig = JSON.parse(fs.readFileSync(inputFile, "utf8"));
} catch (error) {
  console.error(`Error parsing JSON file: ${error.message}`);
  process.exit(1);
}

const videoId = videoConfig.id || path.basename(inputFile, ".json");
const outputDir = process.env.OUTPUT_DIR || "output/videos";
const metadataDir = process.env.METADATA_DIR || "output/metadata";
const videoPath = path.join(outputDir, `${videoId}.mp4`);
const metadataPath = path.join(metadataDir, `${videoId}.json`);

if (!fs.existsSync(metadataDir)) {
  fs.mkdirSync(metadataDir, { recursive: true });
}

const metadata = {
  title: videoConfig.title || `Video ${videoId}`,
  description: videoConfig.description || "",
  tags: videoConfig.tags || [],
  categoryId: videoConfig.categoryId || "22",
  privacyStatus: videoConfig.privacyStatus || "private",
  thumbnailPath: videoConfig.thumbnailPath || null,
};

fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
console.log(`\n📝 STEP 2: Metadata created at ${metadataPath}`);

// Video dosyasının oluşturulduğunu ve ses içerdiğini doğrula
if (fs.existsSync(videoPath)) {
  const stats = fs.statSync(videoPath);
  console.log(
    `✅ Video file created successfully (${(stats.size / 1024 / 1024).toFixed(2)} MB)`
  );

  // FFprobe ile ses track'ini kontrol et
  try {
    const ffprobeOutput = execSync(
      `ffprobe -v quiet -show_streams -select_streams a "${videoPath}"`,
      { encoding: "utf8" }
    );
    if (ffprobeOutput.includes("[STREAM]")) {
      console.log(`🔊 Audio track detected in video file`);
    } else {
      console.warn(`⚠️ No audio track found in video file`);
    }
  } catch (error) {
    console.warn(`⚠️ Could not verify audio track: ${error.message}`);
  }
} else {
  console.error(`❌ Video file not found: ${videoPath}`);
  process.exit(1);
}

if (process.env.ENABLE_AUTO_UPLOAD === "true") {
  try {
    console.log("\n📤 STEP 3: Uploading to YouTube");
    execSync(`node scripts/upload-to-youtube.js ${videoPath} ${metadataPath}`, {
      stdio: "inherit",
    });
  } catch (error) {
    console.error(`❌ YouTube upload failed: ${error.message}`);
    process.exit(1);
  }
} else {
  console.log(
    "\n⏩ STEP 3: YouTube upload skipped (ENABLE_AUTO_UPLOAD is not set to true)"
  );
  console.log(
    `To upload manually, run: npm run upload -- ${videoPath} ${metadataPath}`
  );
}

console.log("\n🎉 Pipeline completed successfully!");
console.log(`📁 Video: ${videoPath}`);
console.log(`📝 Metadata: ${metadataPath}`);
console.log(`🔊 Audio: ${videoConfig.audioPath ? "Included" : "Not included"}`);
