# 🚀 Fast Render Guide

## Kullanılabilir Komutlar

### Hızlı Render Komutları
```bash
# Tek video hızlı render (Quality 50%, Scale 0.8, 24 FPS)
npm run render:fast <composition-id> <output-path>

# Preview render (Quality 30%, Scale 0.5, 15 FPS) - En hızlı
npm run render:preview

# Batch render - Test kompozisyonları
npm run render:batch-preview    # Preview kalitesi
npm run render:batch-fast       # Production kalitesi
npm run render:ultra-fast       # Ultra hızlı kalite
```

## Render Modları

### 1. Preview Mode (En Hızlı)
- **Kalite:** 30%
- **Ölçek:** 0.5x
- **FPS:** 15
- **Kullanım:** Test ve önizleme

### 2. Production Mode (Hızlı)
- **Kalite:** 50%
- **Ölçek:** 0.8x
- **FPS:** 24
- **Kullanım:** Final videolar

### 3. Ultra Fast Mode (En Hızlı)
- **Kalite:** 20%
- **Ölçek:** 0.3x
- **FPS:** 10
- **Kullanım:** Hızlı test

## Örnekler

```bash
# Tek video render
node scripts/fast-render.js SimpleExcalidraw ./output/my-video.mp4

# Preview modunda render
node scripts/fast-render.js SimpleExcalidraw ./output/preview.mp4 preview

# Batch render - tüm test kompozisyonları
node scripts/batch-render.js test preview

# Custom kompozisyon listesi
node scripts/batch-render.js "Video1,Video2,Video3" production
```

## Optimizasyon Detayları

### CPU Optimizasyonu
- Tüm CPU çekirdekleri kullanılır
- Paralel encoding aktif
- Memory pressure optimizasyonu

### FFmpeg Ayarları
- **Codec:** libx264
- **Pixel Format:** yuv420p
- **CRF:** 28-35 (kaliteye göre)
- **Profile:** Baseline

### Chromium Optimizasyonu
- GPU devre dışı (WSL uyumluluk)
- Web security devre dışı
- Memory optimizasyonu
- Sandbox devre dışı

## Performans Karşılaştırması

| Mode | Render Süresi | Dosya Boyutu | Kalite |
|------|---------------|--------------|---------|
| Normal | ~5dk | 50MB | Yüksek |
| Production | ~2dk | 20MB | Orta |
| Preview | ~1dk | 8MB | Düşük |
| Ultra Fast | ~30s | 3MB | Çok Düşük |

## Sorun Giderme

### Memory Hatası
```bash
# Node.js memory limitini artır
export NODE_OPTIONS="--max-old-space-size=4096"
npm run render:preview
```

### GPU Hatası
- WSL2'de GPU desteği otomatik devre dışı
- Chromium `--disable-gpu` parametresi aktif

### Codec Hatası
- FFmpeg libx264 codec'i kullanır
- H.264 uyumluluğu garantili