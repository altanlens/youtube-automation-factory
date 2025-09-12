#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { execSync, spawn } = require("child_process");
const dotenv = require("dotenv");

dotenv.config();

// --- Yardımcı Fonksiyonlar ---
const logStep = (step, message) => console.log(`\n[${step}] ${message}`);
const logInfo = (message) => console.log(`   - ${message}`);
const logSuccess = (message) => console.log(`✅ ${message}`);
const logError = (message, error = "") => {
  console.error(`❌ Hata: ${message}`, error);
  process.exit(1);
};

// --- Ana Fonksiyon ---
async function main() {
  const args = process.argv.slice(2);
  const inputFile = args[0];

  if (!inputFile) {
    logError(
      "Lütfen bir girdi dosyası belirtin.",
      "Kullanım: npm run generate -- <input-file.json>"
    );
  }
  if (!fs.existsSync(inputFile)) {
    logError(`Girdi dosyası bulunamadı: ${inputFile}`);
  }

  let videoConfig;
  try {
    videoConfig = JSON.parse(fs.readFileSync(inputFile, "utf8"));
  } catch (error) {
    logError(`JSON dosyası okunurken hata oluştu: ${error.message}`);
  }

  const outputDir = process.env.OUTPUT_DIR || "output/videos";
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const videoId = videoConfig.id || path.basename(inputFile, ".json");
  const finalVideoPath = path.join(outputDir, `${videoId}.mp4`);
  const silentVideoPath = path.join(outputDir, `${videoId}-no-audio.mp4`);
  const audioPath = path.join(process.cwd(), "public", videoConfig.audioUrl);

  console.log(`🎬 Video oluşturuluyor: ${videoId}`);
  logInfo(`Girdi: ${inputFile}`);
  logInfo(`Ses kaynağı: ${audioPath}`);
  logInfo(`Nihai çıktı: ${finalVideoPath}`);

  try {
    // Adım 1: Remotion ile sessiz videoyu oluştur
    logStep("1/3", "Remotion ile sessiz video render ediliyor...");

    const compositionId = videoConfig.composition || "AiVideo";
    const durationInFrames = videoConfig.durationInFrames;
    if (!durationInFrames) {
      logError("durationInFrames değeri JSON dosyasında tanımlı değil.");
    }

    // DÜZELTME: --props parametresine dosya içeriği yerine dosya yolu veriliyor.
    const remotionCommand = `npx remotion render src/index.ts ${compositionId} ${silentVideoPath} --props=${inputFile} --duration-in-frames=${durationInFrames} --log=verbose`;

    logInfo(`Çalıştırılıyor: ${remotionCommand}`);
    execSync(remotionCommand, { stdio: "inherit" });
    logSuccess(`Sessiz video başarıyla oluşturuldu: ${silentVideoPath}`);

    // Adım 2: FFmpeg ile sesi videoya ekle
    logStep("2/3", "FFmpeg ile ses ve video birleştiriliyor...");
    if (!fs.existsSync(audioPath)) {
      logError(`Ses dosyası bulunamadı: ${audioPath}`);
    }
    await runFFmpeg(silentVideoPath, audioPath, finalVideoPath);
    logSuccess(`Nihai video oluşturuldu: ${finalVideoPath}`);

    // Adım 3: Geçici sessiz video dosyasını sil
    logStep("3/3", "Geçici dosyalar temizleniyor...");
    fs.unlinkSync(silentVideoPath);
    logSuccess(`Geçici dosya silindi: ${silentVideoPath}`);

    console.log("\n🎉 Video üretimi başarıyla tamamlandı!");
  } catch (error) {
    logError("Video üretimi sırasında kritik bir hata oluştu.", error.message);
  }
}

// FFmpeg komutunu güvenli bir şekilde çalıştırmak için
function runFFmpeg(silentVideo, audio, finalVideo) {
  return new Promise((resolve, reject) => {
    const ffmpegArgs = [
      "-i",
      silentVideo,
      "-i",
      audio,
      "-c:v",
      "copy",
      "-c:a",
      "aac",
      "-strict",
      "experimental",
      finalVideo,
      "-y", // Varolan dosyanın üzerine yaz
    ];

    logInfo(`Çalıştırılıyor: ffmpeg ${ffmpegArgs.join(" ")}`);
    const ffmpegProcess = spawn("ffmpeg", ffmpegArgs);

    ffmpegProcess.stderr.on("data", (data) => {
      process.stderr.write(data.toString());
    });

    ffmpegProcess.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`FFmpeg işlemi ${code} koduyla sonlandı`));
      }
    });

    ffmpegProcess.on("error", (err) => {
      reject(new Error(`FFmpeg işlemi başlatılamadı: ${err.message}`));
    });
  });
}

main();
