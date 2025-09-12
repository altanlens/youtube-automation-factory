# YouTube Automation Station

YouTube video içeriği üretimi için kapsamlı bir otomasyon sistemi.

## 🚀 Başlarken

### Kurulum

```bash
# Tam kurulum (geliştirme ortamı ve Remotion)
./setup.sh

# Sadece geliştirme ortamını kur
./setup.sh --dev-only

# Sadece Remotion ortamını kur
./setup.sh --remotion-only
```

### Video Üretimi

1.  **Veri Dosyası Oluşturun**: `examples/data/sample-video.json` dosyasını kopyalayın veya kendi JSON dosyanızı oluşturun. Bu dosya, videonuzun özelliklerini (metin, renkler, vb.) içerir.

2.  **Videoyu Oluşturun**:
    ```bash
    npm run generate -- examples/data/sample-video.json
    ```
    Bu komut, `output/videos/` klasöründe bir MP4 dosyası oluşturacaktır.

3.  **Tam Otomasyon Hattını Çalıştırın**: Bu komut videoyu oluşturur, metadata'yı hazırlar ve (eğer `.env` dosyasında etkinleştirilmişse) YouTube'a yükler.
    ```bash
    npm run pipeline -- examples/data/sample-video.json
    ```

### Önizleme

Remotion stüdyosunu başlatarak canlı önizleme yapabilirsiniz:
```bash
npm start
```
