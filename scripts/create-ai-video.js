#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { createClient } = require("pexels");
const googleTTS = require("google-tts-api");

dotenv.config();

const CYAN = "\x1b[36m";
const NC = "\x1b[0m"; // No Color

// API istekleri arasına gecikme eklemek için yardımcı fonksiyon
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// --- API Entegrasyonları ---

const PexelsAPI = {
  searchImage: async (query) => {
    if (!process.env.PEXELS_API_KEY) {
      console.warn(
        "PEXELS_API_KEY .env dosyasında bulunamadı, görseller olmadan devam ediliyor."
      );
      return null;
    }
    try {
      const client = createClient(process.env.PEXELS_API_KEY);
      const response = await client.photos.search({ query, per_page: 1 });
      if (response.photos && response.photos.length > 0) {
        return response.photos[0].src.large;
      }
      console.warn(`Pexels'ta "${query}" için görsel bulunamadı.`);
      return null;
    } catch (error) {
      console.warn(`Pexels API hatası (sorgu: ${query}):`, error.message);
      return null;
    }
  },
};

const GeminiAPI = {
  generateScriptWithKeywords: async (topic, sentenceCount) => {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY .env dosyasında bulunamadı.");
    }
    console.log(
      `[Gemini API] "${topic}" için tam olarak ${sentenceCount} cümlelik metin ve anahtar kelimeler oluşturuluyor...`
    );

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Konu: '${topic}'. Bu konu hakkında ${sentenceCount} cümleden oluşan bir YouTube video senaryosu oluştur. Cevabını, her biri 'sentence' ve o cümleyi en iyi anlatan 1-2 kelimelik 'keyword' anahtar kelimesini içeren bir JSON formatında bir dizi olarak ver. Sadece JSON dizisini döndür, başka bir metin veya markdown formatlaması ekleme.

Örnek format:
[
  { "sentence": "İlk cümle burada.", "keyword": "başlangıç kelimesi" },
  { "sentence": "İkinci cümle burada.", "keyword": "ikinci kelime" }
]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Gemini'nin cevabından JSON'ı ayıkla
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("Gemini'den geçerli bir JSON dizisi alınamadı.");
      }
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.error("Gemini'den gelen JSON parse edilemedi. Ham yanıt:", text);
      throw new Error("Gemini response could not be parsed as JSON.");
    }
  },
};

const GoogleTTSAPI = {
  generateSpeech: async (text, outputPath) => {
    console.log(`[Google TTS] Ses dosyası oluşturuluyor: ${outputPath}`);
    const base64AudioChunks = await googleTTS.getAllAudioBase64(text, {
      lang: "tr",
      slow: false,
    });

    const audioBuffers = base64AudioChunks.map((chunk) =>
      Buffer.from(chunk.base64, "base64")
    );
    const finalAudioBuffer = Buffer.concat(audioBuffers);

    fs.writeFileSync(outputPath, finalAudioBuffer);
    return { success: true, path: outputPath };
  },
};

// --- Ana Script Mantığı ---

const args = process.argv.slice(2);
const topicArg = args.find((arg) => !arg.startsWith("--"));
const lengthArg = args.find((arg) => arg.startsWith("--length="));

const topic = topicArg;
const lengthInMinutes = lengthArg ? parseInt(lengthArg.split("=")[1], 10) : 1;

if (!topic) {
  console.error(
    'Lütfen bir konu belirtin. Kullanım: npm run create -- "Konu Başlığı" --length=1'
  );
  process.exit(1);
}

// Bir dakikada yaklaşık 12 cümle olduğunu varsayalım
const sentenceCount = lengthInMinutes * 12;

console.log(
  `🚀 AI video üretim süreci başlatıldı. Konu: "${topic}", Süre: ${lengthInMinutes} dakika (${sentenceCount} cümle)`
);

const safeTopic = topic
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");
const outputId = `${safeTopic}-${Date.now()}`;

const audioDir = path.join(process.cwd(), "public", "audio");
const dataDir = path.join(process.cwd(), "examples", "data");
fs.mkdirSync(audioDir, { recursive: true });
fs.mkdirSync(dataDir, { recursive: true });

async function main() {
  try {
    console.log(
      "\n📝 1. Adım: Video metni ve anahtar kelimeler Gemini ile tek seferde oluşturuluyor..."
    );
    const scriptData = await GeminiAPI.generateScriptWithKeywords(
      topic,
      sentenceCount
    );

    const fullScriptText = scriptData.map((item) => item.sentence).join(" ");
    console.log(
      `✅ Metin oluşturuldu: "${fullScriptText.substring(0, 80)}..."`
    );

    console.log("\n🔊 2. Adım: Seslendirme Google TTS ile oluşturuluyor...");
    const audioPath = path.join(audioDir, `${outputId}.mp3`);
    await GoogleTTSAPI.generateSpeech(fullScriptText, audioPath);
    const relativeAudioPath = path.join("audio", `${outputId}.mp3`);
    console.log(`✅ Ses dosyası oluşturuldu: ${audioPath}`);

    const wordsPerSecond = 2.5;
    let currentTime = 0.5;
    const subtitles = [];

    console.log(
      "\n🖼️ 3. Adım: Görseller Pexels ile aranıyor ve altyazılar oluşturuluyor..."
    );
    for (const item of scriptData) {
      const { sentence, keyword } = item;
      const trimmedSentence = sentence.trim();
      if (trimmedSentence.length === 0) continue;

      console.log(`   - Cümle için anahtar kelime: "${keyword}"`);
      const imageUrl = await PexelsAPI.searchImage(keyword);
      await sleep(1000); // Pexels API limitine takılmamak için 1 saniye bekle

      const wordCount = trimmedSentence.split(" ").length;
      const duration = Math.max(3.0, wordCount / wordsPerSecond);
      subtitles.push({
        text: trimmedSentence,
        start: currentTime,
        duration: duration,
        imageUrl: imageUrl,
      });
      currentTime += duration;
    }
    console.log(`✅ ${subtitles.length} adet altyazı ve görsel eşleştirildi.`);

    const videoDurationInSeconds = Math.ceil(currentTime) + 1;
    const videoData = {
      id: outputId,
      composition: "AiVideo",
      durationInFrames: videoDurationInSeconds * 30,
      audioUrl: relativeAudioPath,
      subtitles: subtitles,
    };

    const jsonPath = path.join(dataDir, `${outputId}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(videoData, null, 2));
    console.log(`\n✅ 4. Adım: Video veri dosyası oluşturuldu: ${jsonPath}`);

    console.log(
      "\n🎉 Süreç tamamlandı! Videoyu oluşturmak için aşağıdaki komutu çalıştırın:"
    );
    console.log(
      `\n${CYAN}npm run generate -- ${path.relative(process.cwd(), jsonPath)}${NC}\n`
    );
  } catch (error) {
    console.error("\n❌ Süreç sırasında bir hata oluştu:", error);
    process.exit(1);
  }
}

main();
