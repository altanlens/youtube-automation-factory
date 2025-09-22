FROM mcr.microsoft.com/devcontainers/javascript-node:0-18

# Chrome'un sorunsuz çalışması için gerekli tüm kütüphaneler + MCP dependencies
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
    curl \
    git \
    ffmpeg \
    libvips \
    # MCP için gerekli araçlar
    jq \
    vim \
    nano \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Global npm paketlerini yükle
RUN npm install -g typescript ts-node nodemon

# Puppeteer için gerekli dizinleri oluştur ve izinleri ayarla
RUN mkdir -p /tmp/puppeteer_downloads \
    && mkdir -p /home/node/.npm \
    && mkdir -p /home/node/.claude \
    && chown -R node:node /home/node/.npm \
    && chown -R node:node /home/node/.claude \
    && chown -R node:node /tmp/puppeteer_downloads

# MCP setup script'ini executable yap (container build sırasında)
COPY --chown=node:node .devcontainer/setup-mcp.sh /tmp/setup-mcp.sh
RUN chmod +x /tmp/setup-mcp.sh && \
    cp /tmp/setup-mcp.sh /home/node/setup-mcp.sh && \
    rm /tmp/setup-mcp.sh

# Çalışma dizinini ayarla
WORKDIR /workspaces/youtube-automation-factory

# Node kullanıcısına geç
USER node
