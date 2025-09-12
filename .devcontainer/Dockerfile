FROM mcr.microsoft.com/devcontainers/javascript-node:0-18

# FFmpeg ve diğer bağımlılıkları yükle
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    ffmpeg \
    chromium-browser \
    libvips \
    libcairo2-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    libpango1.0-dev

# Npm paketlerini global olarak yükle
RUN npm install -g npm@latest typescript ts-node nodemon

# Chromium için gerekli dizini oluştur
RUN mkdir -p /tmp/puppeteer_downloads

# Çalışma dizinini ayarla
WORKDIR /workspaces/youtube-automation-station

# Python3 ve pip kur (opsiyonel, veri işleme için)
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv

# Kullanıcı izinlerini ayarla
RUN mkdir -p /home/node/.npm && chown -R node:node /home/node/.npm
