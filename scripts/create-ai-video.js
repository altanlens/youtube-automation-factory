#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { createClient } = require("pexels");
const googleTTS = require("google-tts-api");
const axios = require("axios");
const { execSync } = require("child_process");

dotenv.config();

const CYAN = "\x1b[36m";
const NC = "\x1b[0m";

// --- Yardımcı Fonksiyonlar ---
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const log = (step, message) => console.log(`\n[${step}] ${message}`);
const logInfo = (message) => console.log(`   - ${message}`);
const logSuccess = (message) => console.log(`✅ ${message}`);
const logError = (message, error = "") =>
  console.error(`❌ Hata: ${message}`, error);

// --- API Entegrasyonları ---
const GeminiAPI = {
  generateScriptWithKeywords: async (topic, sentenceCount) => {
    log("1/4", "Script ve anahtar kelimeler oluşturuluyor...");
    if (!process.env.GEMINI_API_KEY)
      throw new Error("GEMINI_API_KEY .env dosyasında bulunamadı.");

    logInfo(
      `[Gemini API] "${topic}" için tam olarak ${sentenceCount} cümlelik metin ve anahtar kelimeler isteniyor...`
    );
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
        " ${topic}" hakkında, tam olarak ${sentenceCount} cümleden oluşan, akıcı bir YouTube video senaryosu yaz.
        Cevabını bir JSON formatında ver. JSON objesi "script" adında bir dizi içermelidir.
        Bu dizideki her eleman, "sentence" (cümle metni) ve "keyword" (o cümle için Pexels.com'da aratılacak 1-2 kelimelik en uygun anahtar kelime) alanlarını içeren bir obje olmalıdır.
        Sadece JSON objesini döndür, başka hiçbir metin veya açıklama ekleme.
        Örnek format:
        {
          "script": [
            { "sentence": "İlk cümle burada olacak.", "keyword": "başlangıç" },
            { "sentence": "İkinci cümle burada.", "keyword": "gelişme" }
          ]
        }
      `;
    const result = await model.generateContent(prompt);
    const responseText = await result.response.text();
    const cleanedJson = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleanedJson);
    logSuccess(
      `Script ve anahtar kelimeler başarıyla oluşturuldu (${parsed.script.length} cümle).`
    );
    return parsed.script;
  },
};

const ElevenLabsAPI = {
  generateSpeech: async (text, outputPath) => {
    logInfo("[ElevenLabs] Ses dosyası oluşturuluyor...");
    if (!process.env.ELEVENLABS_API_KEY)
      throw new Error("ELEVENLABS_API_KEY .env dosyasında tanımlı değil.");

    const response = await axios({
      method: "post",
      url: `https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM`,
      data: { text, model_id: "eleven_multilingual_v2" },
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      responseType: "arraybuffer",
    });
    fs.writeFileSync(outputPath, response.data);
  },
};

const GoogleTTSAPI = {
  generateSpeech: async (text, tempDir, finalOutputPath) => {
    logInfo("Fallback: Google TTS kullanılıyor...");
    const sentences = text.match(/[^.!?]+[.!?\n]+/g) || [text];
    const chunkFiles = [];

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      const chunkPath = path.join(tempDir, `chunk_${i}.mp3`);
      const audioBase64 = await googleTTS.getAudioBase64(sentence, {
        lang: "tr",
        slow: false,
      });
      fs.writeFileSync(chunkPath, Buffer.from(audioBase64, "base64"));
      chunkFiles.push(chunkPath);
    }

    const listFilePath = path.join(tempDir, "list.txt");
    const fileListContent = chunkFiles
      .map((file) => `file '${path.resolve(file)}'`)
      .join("\n");
    fs.writeFileSync(listFilePath, fileListContent);

    const command = `ffmpeg -f concat -safe 0 -i "${listFilePath}" -c copy "${finalOutputPath}" -y`;
    execSync(command, { stdio: "pipe" });

    // Temizlik
    chunkFiles.forEach((file) => fs.unlinkSync(file));
    fs.unlinkSync(listFilePath);
  },
};

const PexelsAPI = {
  searchImage: async (query) => {
    if (!process.env.PEXELS_API_KEY)
      throw new Error("PEXELS_API_KEY .env dosyasında bulunamadı.");
    try {
      const client = createClient(process.env.PEXELS_API_KEY);
      const response = await client.photos.search({ query, per_page: 1 });
      return response.photos?.[0]?.src.large2x || null;
    } catch (error) {
      logError(`Pexels API hatası (sorgu: ${query}):`, error.message);
      return null;
    }
  },
};

// --- Ana Script Mantığı ---
async function main() {
  const args = process.argv.slice(2);
  const topicArg = args.find((arg) => !arg.startsWith("--"));
  const lengthArg = args.find((arg) => arg.startsWith("--length="));

  const topic = topicArg;
  const lengthInMinutes = lengthArg ? parseInt(lengthArg.split("=")[1], 10) : 1;
  const sentencesPerMinute = 12; // Ortalama konuşma hızı
  const sentenceCount = lengthInMinutes * sentencesPerMinute;

  if (!topic) {
    logError(
      'Lütfen bir konu belirtin. Kullanım: npm run create -- "Konu Başlığı" --length=1'
    );
    process.exit(1);
  }

  console.log(
    `🚀 AI video üretim süreci başlatıldı. Konu: "${topic}", Süre: ${lengthInMinutes} dakika (${sentenceCount} cümle)`
  );

  const safeTopic = topic
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const outputId = `${safeTopic}-${Date.now()}`;

  const audioDir = path.join(process.cwd(), "public", "audio");
  const tempAudioDir = path.join(audioDir, "temp"); // Geçici dosyalar için
  const dataDir = path.join(process.cwd(), "examples", "data");
  fs.mkdirSync(audioDir, { recursive: true });
  fs.mkdirSync(tempAudioDir, { recursive: true });
  fs.mkdirSync(dataDir, { recursive: true });

  try {
    const scriptData = await GeminiAPI.generateScriptWithKeywords(
      topic,
      sentenceCount
    );
    const fullScriptText = scriptData.map((item) => item.sentence).join(" ");

    log("2/4", "Ses dosyası oluşturuluyor...");
    const audioPath = path.join(audioDir, `${outputId}.mp3`);

    try {
      await ElevenLabsAPI.generateSpeech(fullScriptText, audioPath);
      logSuccess("ElevenLabs ile ses dosyası başarıyla oluşturuldu.");
    } catch (elevenError) {
      logError("ElevenLabs hatası:", elevenError.message);
      await GoogleTTSAPI.generateSpeech(
        fullScriptText,
        tempAudioDir,
        audioPath
      );
      logSuccess("Google TTS ile ses dosyası başarıyla oluşturuldu.");
    }

    log("3/4", "Görseller Pexels ile aranıyor ve altyazılar hazırlanıyor...");
    let currentTime = 0.5;
    const subtitles = [];
    const wordsPerSecond = 2.5;

    for (const item of scriptData) {
      const { sentence, keyword } = item;
      logInfo(
        `Anahtar kelime: "${keyword}", Cümle: "${sentence.substring(0, 30)}..."`
      );
      const imageUrl = await PexelsAPI.searchImage(keyword);

      const wordCount = sentence.trim().split(" ").length;
      const duration = Math.max(2.0, wordCount / wordsPerSecond);

      subtitles.push({
        text: sentence,
        start: currentTime,
        duration: duration,
        imageUrl: imageUrl,
      });
      currentTime += duration;
      await sleep(1000); // Pexels API limitleri için bekle
    }
    logSuccess(`${subtitles.length} adet altyazı ve görsel eşleştirildi.`);

    const totalDurationInFrames = Math.ceil(currentTime + 1) * 30;

    const videoData = {
      id: outputId,
      composition: "AiVideo",
      durationInFrames: totalDurationInFrames,
      audioUrl: path.join("audio", `${outputId}.mp3`),
      subtitles: subtitles,
    };

    const jsonPath = path.join(dataDir, `${outputId}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(videoData, null, 2));
    log("4/4", `Video veri dosyası oluşturuldu: ${jsonPath}`);

    console.log(
      "\n🎉 Süreç tamamlandı! Videoyu oluşturmak için aşağıdaki komutu çalıştırın:"
    );
    console.log(
      `\n${CYAN}npm run generate -- ${path.relative(process.cwd(), jsonPath)}${NC}\n`
    );
  } catch (error) {
    logError("Süreç sırasında kritik bir hata oluştu:", error);
    process.exit(1);
  } finally {
    // Geçici ses klasörünü temizle
    if (fs.existsSync(tempAudioDir)) {
      fs.rmSync(tempAudioDir, { recursive: true, force: true });
    }
  }
}

main();
