# 🚀 YouTube Automation Factory - Quick Start Guide

Bu rehber YouTube video üretim otomasyonunu hızlıca başlatmanızı sağlar.

## 📋 Ön Koşullar

```bash
# 1. Dependencies yükle
npm install

# 2. TypeScript kontrol et
npm run typecheck

# 3. Remotion preview'ı başlat
npm start
```

## 🎬 Video Oluşturma Yöntemleri

### Yöntem 1: AI Prompt'tan Video Oluşturma

```bash
# Eğitim videosu
npm run create-from-prompt -- --topic="Pisagor Teoremi" --style=educational --duration=90

# İş videosu
npm run create-from-prompt -- --topic="Startup İpuçları" --style=business --duration=60

# Motivasyon videosu
npm run create-from-prompt -- --topic="Başarı Hikayeleri" --style=motivational --duration=45
```

### Yöntem 2: Hazır JSON Template Kullanma

```bash
# Sample analysis kullan
node scripts/create-video-from-prompt.js --input=./examples/sample-analysis.json
```

### Yöntem 3: Remotion Compositions

Remotion preview'da (http://localhost:3000) mevcut compositions:

- **HelloWorld** - Basit test videosu
- **ExcalidrawDemo** - Elle çizim demo
- **SimpleExcalidraw** - Excalidraw entegrasyonu
- **AiVideo** - AI video composition

## 🔧 Ayarlar

### Environment Variables

```bash
# .env dosyası oluştur
cat > .env << EOF
GEMINI_API_KEY=your_gemini_api_key
ELEVENLABS_API_KEY=your_elevenlabs_key
YOUTUBE_API_KEY=your_youtube_key
EOF
```

### API Keys Alma

1. **Gemini AI**: https://ai.google.dev/
2. **ElevenLabs**: https://elevenlabs.io/
3. **YouTube Data API**: https://console.cloud.google.com/

## 🎨 İçerik Türleri

### Educational (Eğitim)
- Matematik dersleri
- Bilim konuları
- Tutorial'lar

### Business (İş)
- Startup hikayeleri
- İş stratejileri
- Pazar analizleri

### Motivational (Motivasyon)
- Başarı hikayeleri
- Kişisel gelişim
- İlham verici sözler

### Technical (Teknik)
- Yazılım açıklamaları
- Sistem mimarileri
- API dokümantasyonları

## 📁 Proje Yapısı

```
src/
├── automation/          # Video üretim pipeline
├── excalidraw/         # Çizim motoru
├── ai/                 # Gemini entegrasyonu
├── components/         # React bileşenleri
├── compositions/       # Remotion compositions
└── templates/          # Hazır şablonlar

scripts/
├── create-video-from-prompt.js  # Ana üretim scripti
└── ...

examples/
└── sample-analysis.json        # Örnek video yapısı
```

## 🚀 Hızlı Test

```bash
# 1. Remotion preview başlat
npm start

# 2. Excalidraw demo render et (30 frame)
npx remotion render ExcalidrawDemo --frames=0-30

# 3. Ana script'i test et
node scripts/create-video-from-prompt.js --help
```

## 🎯 İş Akışı

1. **Topic belirleme** → Hangi konuda video?
2. **Style seçme** → educational/business/motivational/technical
3. **Gemini ile içerik üretme** → AI senaryosu
4. **Excalidraw çizimleri** → Elle çizim görselleri
5. **ElevenLabs seslendirme** → AI ses
6. **Remotion render** → Video birleştirme
7. **YouTube upload** → Otomatik yayınlama

## 🛠 Troubleshooting

### Remotion başlamıyor
```bash
rm -rf node_modules package-lock.json
npm install
npm start
```

### TypeScript hataları
```bash
npm run typecheck
npm run lint --fix
```

### API key hataları
```bash
# .env dosyasını kontrol et
cat .env
```

## 📞 Yardım

- **Remotion Docs**: https://remotion.dev/docs/
- **Excalidraw API**: https://github.com/excalidraw/excalidraw
- **Project Issues**: Repository issues kısmında soru sorabilirsiniz

---

🎉 **Hazırsınız! Video üretim fabrikası aktif!**