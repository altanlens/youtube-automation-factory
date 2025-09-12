#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { createClient } = require("pexels");
const googleTTS = require("google-tts-api");
const axios = require("axios");

dotenv.config();

const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const NC = "\x1b[0m"; // No Color

// API istekleri arasına gecikme eklemek için yardımcı fonksiyon
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// --- API Entegrasyonları ---

const PexelsAPI = {
  searchImage: async (query) => {
    if (!process.env.PEXELS_API_KEY) {
      throw new Error("PEXELS_API_KEY .env dosyasında bulunamadı.");
    }
    try {
      const client = createClient(process.env.PEXELS_API_KEY);
      const response = await client.photos.search({ query, per_page: 1 });
      if (response.photos && response.photos.length > 0) {
        return response.photos[0].src.large;
      }
      return null;
    } catch (error) {
      console.warn(`Pexels API hatası (sorgu: ${query}):`, error.message);
      return null;
    }
  },
};

const GeminiAPI = {
  generateScript: async (topic, lengthInMinutes) => {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY .env dosyasında bulunamadı.");
    }
    const wordCount = lengthInMinutes * 150;
    console.log(
      `${CYAN}[Gemini API]${NC} "${topic}" için yaklaşık ${wordCount} kelimelik metin oluşturuluyor...`
    );
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `"${topic}" hakkında, yaklaşık ${wordCount} kelimeden oluşan, akıcı bir YouTube video senaryosu yaz. Senaryoyu paragraflar halinde, her paragraf bir cümle olacak şekilde oluştur. Sadece senaryoyu yaz, başlık veya ek açıklama ekleme.`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  },
  extractKeyword: async (sentence) => {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY .env dosyasında bulunamadı.");
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Aşağıdaki cümleyi en iyi özetleyen 1 veya 2 kelimelik anahtar kelimeyi ver: "${sentence}"`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim().replace(/["*.]/g, "");
  },
};

const GoogleTTSAPI = {
  generateSpeech: async (text, outputPath) => {
    try {
      console.log(`${CYAN}[Google TTS]${NC} Ses dosyası oluşturuluyor...`);

      // Metni parçalara böl (Google TTS sınırlaması için)
      const chunks = text.match(/.{1,200}/g) || [text];
      const audioFiles = [];

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const url = googleTTS.getAudioUrl(chunk, {
          lang: "tr",
          slow: false,
          host: "https://translate.google.com",
        });

        const response = await axios({
          method: "get",
          url: url,
          responseType: "arraybuffer",
        });

        const chunkPath = outputPath.replace(".mp3", `_chunk_${i}.mp3`);
        fs.writeFileSync(chunkPath, response.data);
        audioFiles.push(chunkPath);

        await sleep(1000); // API rate limit için bekle
      }

      // Birden fazla parça varsa birleştir
      if (audioFiles.length > 1) {
        const { execSync } = require("child_process");
        const fileList = audioFiles.map((f) => `file '${f}'`).join("\n");
        const listPath = outputPath.replace(".mp3", "_list.txt");
        fs.writeFileSync(listPath, fileList);

        execSync(
          `ffmpeg -f concat -safe 0 -i "${listPath}" -c copy "${outputPath}" -y`
        );

        // Geçici dosyaları temizle
        audioFiles.forEach((f) => fs.unlinkSync(f));
        fs.unlinkSync(listPath);
      } else {
        // Tek parça varsa dosyayı yeniden adlandır
        fs.renameSync(audioFiles[0], outputPath);
      }

      console.log(`${GREEN}✅ Ses dosyası oluşturuldu:${NC} ${outputPath}`);
      return { success: true, path: outputPath };
    } catch (error) {
      console.error(`${RED}❌ Google TTS hatası:${NC}`, error);
      throw error;
    }
  },
};

const ElevenLabsAPI = {
  generateSpeech: async (
    text,
    outputPath,
    voiceId = "21m00Tcm4TlvDq8ikWAM"
  ) => {
    if (!process.env.ELEVENLABS_API_KEY) {
      console.warn(
        `${RED}WARNING:${NC} ELEVENLABS_API_KEY bulunamadı, Google TTS kullanılacak`
      );
      return GoogleTTSAPI.generateSpeech(text, outputPath);
    }

    try {
      console.log(`${CYAN}[ElevenLabs]${NC} Ses dosyası oluşturuluyor...`);

      const response = await axios({
        method: "post",
        url: `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        data: {
          text,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        },
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        responseType: "arraybuffer",
      });

      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(outputPath, response.data);
      console.log(`${GREEN}✅ Ses dosyası oluşturuldu:${NC} ${outputPath}`);
      return { success: true, path: outputPath };
    } catch (error) {
      console.error(`${RED}❌ ElevenLabs hatası:${NC}`, error.message);
      console.log(`${CYAN}Fallback:${NC} Google TTS kullanılıyor...`);
      return GoogleTTSAPI.generateSpeech(text, outputPath);
    }
  },
};

// --- Ana İşlem ---
async function createAIVideo() {
  const args = process.argv.slice(2);
  const topic = args[0] || "Yapay Zeka'nın Geleceği";
  const lengthInMinutes = parseInt(args[1]) || 2;

  console.log(`${CYAN}🎬 AI Video Oluşturucu Başlatılıyor...${NC}`);
  console.log(`📝 Konu: ${topic}`);
  console.log(`⏱️ Süre: ${lengthInMinutes} dakika\n`);

  try {
    // 1. Script oluştur
    console.log(`${CYAN}[1/4]${NC} Script oluşturuluyor...`);
    const script = await GeminiAPI.generateScript(topic, lengthInMinutes);
    console.log(
      `${GREEN}✅ Script oluşturuldu${NC} (${script.length} karakter)\n`
    );

    // 2. Ses dosyası oluştur
    console.log(`${CYAN}[2/4]${NC} Ses dosyası oluşturuluyor...`);
    const audioDir = "output/audio";
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }

    const audioPath = path.join(audioDir, `${Date.now()}.mp3`);
    await ElevenLabsAPI.generateSpeech(script, audioPath);

    // 3. Görsel içerik için anahtar kelimeler çıkar
    console.log(
      `${CYAN}[3/4]${NC} Görsel içerik için anahtar kelimeler çıkarılıyor...`
    );
    const sentences = script
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 10);
    const scenes = [];

    for (let i = 0; i < Math.min(sentences.length, 5); i++) {
      const sentence = sentences[i].trim();
      if (sentence) {
        const keyword = await GeminiAPI.extractKeyword(sentence);
        const imageUrl = await PexelsAPI.searchImage(keyword);
        scenes.push({
          text: sentence,
          keyword,
          imageUrl,
          duration: 3000, // 3 saniye
        });
        await sleep(500); // API rate limit
      }
    }

    // 4. Video config dosyası oluştur
    console.log(`${CYAN}[4/4]${NC} Video konfigürasyonu oluşturuluyor...`);
    const videoConfig = {
      id: `ai-video-${Date.now()}`,
      title: topic,
      description: `AI ile oluşturulmuş video: ${topic}`,
      composition: "AIVideo",
      script,
      audioPath,
      scenes,
      fps: 30,
      width: 1920,
      height: 1080,
      tags: ["ai", "automation", topic.toLowerCase()],
      duration: lengthInMinutes * 60 * 1000, // milisaniye
    };

    const configDir = "output/configs";
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    const configPath = path.join(configDir, `${videoConfig.id}.json`);
    fs.writeFileSync(configPath, JSON.stringify(videoConfig, null, 2));

    console.log(`\n${GREEN}🎉 AI Video hazırlık tamamlandı!${NC}`);
    console.log(`📁 Config: ${configPath}`);
    console.log(`🔊 Audio: ${audioPath}`);
    console.log(`\n${CYAN}Video oluşturmak için:${NC}`);
    console.log(`npm run generate -- ${configPath}`);

    return configPath;
  } catch (error) {
    console.error(`${RED}❌ Hata:${NC}`, error);
    process.exit(1);
  }
}

if (require.main === module) {
  createAIVideo();
}

module.exports = { createAIVideo };
