FROM mcr.microsoft.com/devcontainers/javascript-node:0-18

# GÜNCELLEME: Chrome'un sorunsuz çalışması için gerekli tüm kütüphaneler eklendi.
# Bu, "paylaşılan kütüphane" hatalarını önler.
RUN apt-get update && apt-get install -yq --no-install-recommends \
  libasound2 \
  libatk1.0-0 \
  libc6 \
  libcairo2 \
  libcups2 \
  libdbus-1-3 \
  libexpat1 \
  libfontconfig1 \
  libgcc1 \
  libgconf-2-4 \
  libgdk-pixbuf2.0-0 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libstdc++6 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6 \
  ca-certificates \
  fonts-liberation \
  libappindicator1 \
  libnss3 \
  lsb-release \
  xdg-utils \
  wget \
  # FFmpeg ve diğer proje bağımlılıkları
  ffmpeg \
  libvips \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

# Npm paketlerini global olarak yükle
# GÜNCELLEME: Uyumsuzluk yaratan 'npm@latest' kaldırıldı. Mevcut Node.js ile gelen npm sürümü yeterlidir.
RUN npm install -g typescript ts-node nodemon

# Chromium için gerekli dizini oluştur
RUN mkdir -p /tmp/puppeteer_downloads

# Çalışma dizinini ayarla
WORKDIR /workspaces/youtube-automation-factory

# Kullanıcı izinlerini ayarla
RUN mkdir -p /home/node/.npm && chown -R node:node /home/node/.npm

