# 🔐 GitHub MCP Kurulum Rehberi

Video Otomasyon Platformu için DevContainer + GitHub MCP entegrasyonu.

## 🚀 Hızlı Başlangıç

### 1. GitHub Fine-Grained Token Oluşturma

1. **GitHub'a gidin**: https://github.com/settings/personal-access-tokens/new
2. **Token details**:
   - **Token name**: `video-automation-mcp`
   - **Expiration**: 90 days
   - **Description**: `DevContainer GitHub MCP for Video Automation Platform`

3. **Repository access**: 
   - **Selected repositories** → `altanlens/youtube-automation-factory`

4. **Repository permissions**:
   - **Contents**: `Read and write` ✅
   - **Metadata**: `Read` ✅  
   - **Pull requests**: `Read and write` (opsiyonel)
   - **Issues**: `Read and write` (opsiyonel)

5. **Generate token** ve kopyalayın

### 2. Environment Variables Ayarlama

**macOS/Linux:**
```bash
# ~/.bashrc veya ~/.zshrc dosyasına ekleyin
export GITHUB_TOKEN="ghp_your_fine_grained_token_here"
export ANTHROPIC_API_KEY="your_anthropic_api_key_here"

# Değişiklikleri aktifleştirin
source ~/.bashrc  # veya source ~/.zshrc
```

**Windows PowerShell:**
```powershell
# Kalıcı (system-wide)
[Environment]::SetEnvironmentVariable("GITHUB_TOKEN", "ghp_your_token_here", "User")
[Environment]::SetEnvironmentVariable("ANTHROPIC_API_KEY", "your_api_key_here", "User")

# PowerShell'i yeniden başlatın
```

### 3. DevContainer Başlatma

1. VS Code'da projeyi açın
2. **Command Palette** (`Ctrl+Shift+P`) → **Remote-Containers: Reopen in Container**
3. Container build edilecek ve MCP otomatik kurulacak

### 4. Doğrulama

Container içinde terminal'de:
```bash
# MCP durumunu kontrol et
claude mcp list

# GitHub bağlantısını test et
claude "Bu repo'nun son 3 commit'ini listele"

# Video otomasyon analizi
claude "Analysis.json dosyalarını bulup Easy Actually stiline uygunluk açısından analiz et"
```

## 🎬 Video Otomasyon Platformu Komutları

Container hazır olduktan sonra şu komutları deneyebilirsiniz:

```bash
# Proje analizi
claude "Bu repo'daki analysis.json dosyalarını analiz et ve Uygulama Anayasası'na uygunluğunu değerlendir"

# Remotion bileşenlerini incele
claude "src/compositions klasöründeki Remotion bileşenlerini 'easy, actually' stiline göre gözden geçir"

# Pipeline durumu
claude "Video otomasyon pipeline'ının durumunu kontrol et ve son değişiklikleri özetle"

# Yeni özellik geliştirme
claude "GitHub Actions ile otomatik video rendering workflow'u oluştur"

# Kod kalitesi analizi
claude "TypeScript kodlarını analysis.json mimarisine uygunluk açısından incele"
```

## 🛡️ Güvenlik Notları

- **Fine-grained token'lar** sadece seçilen repo'ya erişir
- **Container izolasyonu** host sistemi korur
- **Token'ları `.gitignore`'da tutun**
- **--dangerously-skip-permissions** container içinde güvenli

## 🔧 Troubleshooting

### Problem: "GITHUB_TOKEN not found"
```bash
# Container içinde kontrol edin
echo $GITHUB_TOKEN
```

### Problem: "MCP server not responding"
```bash
# Container'ı rebuild edin
# Command Palette → Remote-Containers: Rebuild Container
```

### Problem: Token izinleri
- Token'ın **Contents: Read and write** izninin olduğundan emin olun
- **Repository access**'te doğru repo'yu seçtiğinizi kontrol edin

## 📊 Özellikler

✅ **GitHub MCP entegrasyonu** - Direkt repo işlemleri  
✅ **Context7 MCP** - Güncel dokümantasyon  
✅ **Otomatik kurulum** - Script bazlı setup  
✅ **Error handling** - Robust hata yönetimi  
✅ **Video automation** - Platform specific komutlar  
✅ **Container isolation** - Güvenli geliştirme ortamı  

## 🎯 Video Platform Integration

Bu kurulum sayesinde Claude Code:

- **Analysis.json dosyalarınızı** analiz edebilir
- **"Easy, actually" stiline** uygunluk kontrol eder  
- **Remotion bileşenlerini** optimize eder
- **GitHub Actions workflow'ları** oluşturur
- **Otomatik commit/PR'lar** yapar
- **Proje dokümantasyonunu** güncel tutar

---

**Not**: Bu README, Video Otomasyon Platformu için özelleştirilmiş GitHub MCP kurulum rehberidir.
