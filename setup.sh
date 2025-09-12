#!/bin/bash

# ================================================================
# YouTube Automation Station - Master Setup Script
# ================================================================
# Kapsamlı YouTube video otomasyonu için tüm bileşenleri kurar
#
# Kullanım: ./setup.sh [--full | --dev-only | --remotion-only]
# ================================================================

set -e # Herhangi bir hata durumunda script'i durdur

# Renkli çıktı için tanımlamalar
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Script banner'ı
display_banner() {
    echo -e "${BLUE}"
    echo "======================================================"
    echo "      YouTube Automation Station - Master Setup       "
    echo "======================================================"
    echo -e "${NC}"
    echo -e "👋 Merhaba ${YELLOW}$(whoami)${NC}! YouTube otomasyon ortamınızı kuruyoruz."
    echo -e "🔧 Bu script tüm gerekli bileşenleri kuracak"
    echo -e "🚀 Başlangıç: $(date)\n"
}

# Kurulum modunu işle
MODE="full"
if [[ "$1" == "--dev-only" ]]; then
    MODE="dev-only"
    echo -e "${YELLOW}Sadece geliştirme ortamı kurulacak${NC}"
elif [[ "$1" == "--remotion-only" ]]; then
    MODE="remotion-only"
    echo -e "${YELLOW}Sadece Remotion ortamı kurulacak${NC}"
fi

# Adım görüntüleme fonksiyonu
step() {
    echo -e "\n${BLUE}[$1/${TOTAL_STEPS}] ${YELLOW}$2${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

log_info() {
    echo -e "${CYAN}ℹ️ $1${NC}"
}

# Toplam adım sayısı
TOTAL_STEPS=9

# Sistem gereksinimlerini kontrol et
check_system_requirements() {
    step "1" "Sistem gereksinimlerini kontrol ediyorum"

    # Node.js kontrolü
    if ! command -v node &> /dev/null; then
        log_error "Node.js bulunamadı. Kurulum yapılacak."
        install_nodejs
    else
        NODE_VERSION=$(node -v)
        log_success "Node.js $NODE_VERSION bulundu"
    fi

    # FFmpeg kontrolü
    if ! command -v ffmpeg &> /dev/null; then
        log_error "FFmpeg bulunamadı. Kurulum yapılacak."
        install_ffmpeg
    else
        FFMPEG_VERSION=$(ffmpeg -version | head -n1 | awk '{print $3}')
        log_success "FFmpeg $FFMPEG_VERSION bulundu"
    fi

    # Git kontrolü
    if ! command -v git &> /dev/null; then
        log_error "Git bulunamadı. Kurulum yapılacak."
        sudo apt-get update && sudo apt-get install -y git
    else
        GIT_VERSION=$(git --version | awk '{print $3}')
        log_success "Git $GIT_VERSION bulundu"
    fi

    # Python kontrolü (isteğe bağlı, veri işleme için)
    if ! command -v python3 &> /dev/null; then
        log_warning "Python3 bulunamadı. Bazı veri işleme özellikleri çalışmayabilir."
    else
        PYTHON_VERSION=$(python3 --version | awk '{print $2}')
        log_success "Python $PYTHON_VERSION bulundu"
    fi

    log_success "Sistem gereksinimleri tamamlandı"
}

# Node.js kurulumu
install_nodejs() {
    log_info "Node.js LTS sürümünü kuruyorum..."
    # DÜZELTME: Geçici dosya oluşturmak yerine doğrudan pipe (|) kullanmak daha temiz ve güvenlidir.
    curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
    sudo apt-get install -y nodejs
    log_success "Node.js kuruldu: $(node -v)"
}

# FFmpeg kurulumu
install_ffmpeg() {
    log_info "FFmpeg kuruyorum..."
    sudo apt-get update && sudo apt-get install -y ffmpeg
    log_success "FFmpeg kuruldu: $(ffmpeg -version | head -n1 | awk '{print $3}')"
}

# DevContainer kurulumu
setup_devcontainer() {
    step "2" "DevContainer ortamını kuruyorum"
    mkdir -p .devcontainer
    cat > .devcontainer/Dockerfile << 'EOF'
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
EOF
    cat > .devcontainer/devcontainer.json << 'EOF'
{
    "name": "YouTube Automation Station",
    "dockerFile": "Dockerfile",
    "customizations": {
        "vscode": {
            "extensions": [
                "dbaeumer.vscode-eslint",
                "esbenp.prettier-vscode",
                "ms-vscode.vscode-typescript-next",
                "VisualStudioExptTeam.vscodeintellicode",
                "streetsidesoftware.code-spell-checker",
                "ms-python.python",
                "ms-azuretools.vscode-docker"
            ],
            "settings": {
                "editor.formatOnSave": true,
                "editor.defaultFormatter": "esbenp.prettier-vscode",
                "typescript.tsdk": "node_modules/typescript/lib",
                "editor.codeActionsOnSave": {
                    "source.fixAll.eslint": true
                }
            }
        }
    },
    "forwardPorts": [3000, 3001, 8000],
    "postCreateCommand": "npm install",
    "remoteUser": "node"
}
EOF
    log_success "DevContainer konfigürasyonu oluşturuldu"
}

# Temel proje yapısını oluştur
create_project_structure() {
    step "3" "Proje yapısını oluşturuyorum"
    mkdir -p src/{api,components,compositions,hooks,utils,themes,data-adapters}
    mkdir -p assets/{audio,images,fonts}
    mkdir -p output/{videos,thumbnails,metadata}
    mkdir -p logs/{render,api,system}
    mkdir -p scripts
    mkdir -p config
    mkdir -p public
    mkdir -p tests/{unit,integration,e2e}
    cat > package.json << 'EOF'
{
  "name": "youtube-automation-station",
  "version": "1.0.0",
  "description": "Comprehensive YouTube video automation system",
  "main": "src/index.ts",
  "scripts": {
    "start": "remotion preview",
    "build": "remotion render",
    "upgrade": "remotion upgrade",
    "test": "jest",
    "lint": "eslint src --ext ts,tsx",
    "format": "prettier --write \"src/**/*.{ts,tsx}\"",
    "generate": "node scripts/generate-video.js",
    "upload": "node scripts/upload-to-youtube.js",
    "pipeline": "node scripts/run-pipeline.js"
  },
  "keywords": ["youtube", "automation", "video", "remotion", "content"],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "@remotion/cli": "^4.0.0",
    "@remotion/eslint-config": "^4.0.0",
    "@remotion/paths": "^4.0.0",
    "@remotion/zod-types": "^4.0.0",
    "remotion": "^4.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zod": "3.22.3",
    "googleapis": "^126.0.1",
    "dotenv": "^16.3.1",
    "axios": "^1.6.0",
    "csv-parse": "^5.5.0",
    "node-fetch": "^3.3.2",
    "openai": "^4.15.0",
    "winston": "^3.11.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/jest": "^29.5.7",
    "@types/node": "^20.8.10",
    "@typescript-eslint/eslint-plugin": "^6.9.1",
    "@typescript-eslint/parser": "^6.9.1",
    "eslint": "^8.52.0",
    "eslint-plugin-react": "^7.33.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "jest": "^29.7.0",
    "prettier": "^3.0.3",
    "ts-jest": "^29.1.1",
    "typescript": "^5.2.2"
  },
  "engines": {
    "node": ">=16.0.0"
  }
}
EOF
    cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "ESNext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@compositions/*": ["src/compositions/*"],
      "@hooks/*": ["src/hooks/*"],
      "@utils/*": ["src/utils/*"],
      "@themes/*": ["src/themes/*"],
      "@api/*": ["src/api/*"],
      "@assets/*": ["assets/*"],
      "@config/*": ["config/*"]
    }
  },
  "include": ["src", "scripts"],
  "exclude": ["node_modules", "output", "logs"]
}
EOF
    cat > .gitignore << 'EOF'
# Node modules
node_modules/
npm-debug.log
yarn-debug.log
yarn-error.log

# Environment
.env
.env.local
.env.*.local

# Output
/output
/dist

# Logs
/logs

# API keys and secrets
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
config/credentials.json
config/tokens.json

# Media files
*.mp4
*.wav
*.mp3
*.flac
*.png
*.jpg
*.jpeg
*.tiff
*.gif
*.webp

# Dependency directories
.pnp/
.pnp.js

# Testing
/coverage
.nyc_output

# OS files
.DS_Store
Thumbs.db

# IDE files
.idea/
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
EOF
    cat > .env.example << 'EOF'
# YouTube API Credentials
YOUTUBE_API_KEY=your_youtube_api_key_here
YOUTUBE_CLIENT_ID=your_youtube_client_id_here
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret_here
YOUTUBE_REDIRECT_URI=http://localhost:3000/oauth2callback

# OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here

# Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# ElevenLabs API Key
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Render Settings
VIDEO_FPS=30
VIDEO_WIDTH=1920
VIDEO_HEIGHT=1080
VIDEO_QUALITY=high

# Output Paths
OUTPUT_DIR=output/videos
THUMBNAIL_DIR=output/thumbnails
METADATA_DIR=output/metadata
LOGS_DIR=logs

# Feature Toggles
ENABLE_AUTO_UPLOAD=false
ENABLE_THUMBNAIL_GENERATION=true
ENABLE_METADATA_GENERATION=true
ENABLE_TTS=true
EOF
    log_success "Temel proje yapısı oluşturuldu"
}

# Remotion kurulumu
setup_remotion() {
    step "4" "Remotion kütüphanesini kuruyorum"
    cat > remotion.config.ts << 'EOF'
import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);

// Render işlemleri için tüm CPU çekdeklerini kullan
Config.setConcurrency(null);

// Güvenlik ayarları
Config.setChromiumDisableWebSecurity(false);
Config.setChromiumIgnoreCertificateErrors(false);

// Statik dosyaların yolu
Config.setPublicDir('./public');
EOF
    cat > src/index.ts << 'EOF'
import {registerRoot} from 'remotion';
import {RemotionRoot} from './Root';

registerRoot(RemotionRoot);
EOF
    cat > src/Root.tsx << 'EOF'
import React from 'react';
import {Composition} from 'remotion';
import {HelloWorld} from './compositions/HelloWorld';
import './style.css';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          titleText: 'Welcome to Remotion',
          titleColor: 'rgb(0, 123, 255)',
        }}
      />
    </>
  );
};
EOF
    cat > src/style.css << 'EOF'
html, body {
  margin: 0;
  padding: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background-color: white;
  color: black;
}

* {
  box-sizing: border-box;
}
EOF
    cat > src/compositions/HelloWorld.tsx << 'EOF'
import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame, spring, interpolate} from 'remotion';

const Title: React.FC<{
  titleText: string;
  titleColor: string;
}> = ({titleText, titleColor}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const scale = spring({
    frame,
    from: 0.5,
    to: 1,
    fps: 30,
    config: {
      damping: 10,
      stiffness: 100,
      mass: 0.5,
    },
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <h1
        style={{
          fontFamily: 'SF Pro Text, Helvetica, Arial, sans-serif',
          fontWeight: 'bold',
          fontSize: 100,
          textAlign: 'center',
          position: 'absolute',
          top: '40%',
          transform: `scale(${scale})`,
          color: titleColor,
          opacity,
        }}
      >
        {titleText}
      </h1>
    </AbsoluteFill>
  );
};

export const HelloWorld: React.FC<{
  titleText: string;
  titleColor: string;
}> = ({titleText, titleColor}) => {
  return (
    <AbsoluteFill style={{backgroundColor: 'white'}}>
      <Sequence from={0}>
        <Title titleText={titleText} titleColor={titleColor} />
      </Sequence>
    </AbsoluteFill>
  );
};
EOF
    log_success "Remotion kütüphanesi kuruldu"
}

# Remotion bileşen kütüphanesini oluştur
create_remotion_library() {
    step "5" "Remotion bileşen kütüphanesini oluşturuyorum"
    mkdir -p src/components/animations
    cat > src/components/animations/FadeIn.tsx << 'EOF'
import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  from?: number;
  to?: number;
  style?: React.CSSProperties;
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  delay = 0,
  duration = 30,
  from = 0,
  to = 1,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame - delay,
    [0, duration],
    [from, to],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  return (
    <div style={{...style, opacity}}>
      {children}
    </div>
  );
};
EOF
    cat > src/components/animations/SlideIn.tsx << 'EOF'
import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';

type SlideDirection = 'left' | 'right' | 'top' | 'bottom';

interface SlideInProps {
  children: React.ReactNode;
  direction?: SlideDirection;
  delay?: number;
  duration?: number;
  distance?: number;
  style?: React.CSSProperties;
}

export const SlideIn: React.FC<SlideInProps> = ({
  children,
  direction = 'left',
  delay = 0,
  duration = 30,
  distance = 100,
  style = {},
}) => {
  const frame = useCurrentFrame();

  const getPositionByDirection = () => {
    switch (direction) {
      case 'left':
        return {x: -distance, y: 0};
      case 'right':
        return {x: distance, y: 0};
      case 'top':
        return {x: 0, y: -distance};
      case 'bottom':
        return {x: 0, y: distance};
      default:
        return {x: 0, y: 0};
    }
  };

  const startPosition = getPositionByDirection();

  const x = interpolate(
    frame - delay,
    [0, duration],
    [startPosition.x, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  const y = interpolate(
    frame - delay,
    [0, duration],
    [startPosition.y, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  const opacity = interpolate(
    frame - delay,
    [0, duration * 0.8],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  return (
    <div
      style={{
        ...style,
        transform: `translate(${x}px, ${y}px)`,
        opacity,
      }}
    >
      {children}
    </div>
  );
};
EOF
    cat > src/components/animations/TypeWriter.tsx << 'EOF'
import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';

interface TypeWriterProps {
  text: string;
  startFrame?: number;
  charactersPerFrame?: number;
  showCursor?: boolean;
  cursorCharacter?: string;
  style?: React.CSSProperties;
}

export const TypeWriter: React.FC<TypeWriterProps> = ({
  text,
  startFrame = 0,
  charactersPerFrame = 0.5,
  showCursor = true,
  cursorCharacter = '|',
  style = {},
}) => {
  const frame = useCurrentFrame();
  const relativeFrame = Math.max(0, frame - startFrame);

  const charactersToShow = Math.floor(relativeFrame * charactersPerFrame);
  const displayedText = text.substring(0, charactersToShow);

  const cursorOpacity = showCursor
    ? interpolate(
        frame % 30,
        [0, 15, 30],
        [1, 0, 1],
        {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        }
      )
    : 0;

  return (
    <div style={style}>
      {displayedText}
      <span style={{opacity: cursorOpacity}}>{cursorCharacter}</span>
    </div>
  );
};
EOF
    cat > src/components/animations/index.ts << 'EOF'
export * from './FadeIn';
export * from './SlideIn';
export * from './TypeWriter';
EOF
    mkdir -p src/components/data-visualization
    cat > src/components/data-visualization/BarChart.tsx << 'EOF'
import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';

interface BarChartProps {
  data: number[];
  labels?: string[];
  height?: number;
  width?: number;
  color?: string;
  animated?: boolean;
  startFrame?: number;
  style?: React.CSSProperties;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  labels = [],
  height = 300,
  width = 500,
  color = '#3498db',
  animated = true,
  startFrame = 0,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const maxValue = Math.max(...data);

  return (
    <div style={{...style, height, width, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around'}}>
      {data.map((value, i) => {
        const barHeight = animated
          ? interpolate(
              frame - startFrame,
              [0, 30],
              [0, (value / maxValue) * height],
              {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }
            )
          : (value / maxValue) * height;

        return (
          <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <div
              style={{
                width: width / data.length / 2,
                height: barHeight,
                backgroundColor: color,
                marginBottom: 5,
              }}
            />
            {labels[i] && <div style={{fontSize: 12}}>{labels[i]}</div>}
          </div>
        );
      })}
    </div>
  );
};
EOF
    cat > src/components/data-visualization/index.ts << 'EOF'
export * from './BarChart';
EOF
    log_success "Remotion bileşen kütüphanesi oluşturuldu"
}

# API ve servis katmanını oluştur
setup_api_services() {
    step "6" "API ve servis katmanını kuruyorum"
    mkdir -p src/api/{youtube,openai,elevenlabs}
    cat > src/api/youtube/youtube-api.ts << 'EOF'
import { google, youtube_v3 } from 'googleapis';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const SCOPES = ['https://www.googleapis.com/auth/youtube.upload', 'https://www.googleapis.com/auth/youtube'];
const TOKEN_PATH = path.join(process.cwd(), 'config', 'youtube-token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'config', 'youtube-credentials.json');

export class YouTubeAPI {
  private youtube: youtube_v3.Youtube | null = null;
  private auth: any = null;

  async authenticate() {
    try {
      if (process.env.YOUTUBE_API_KEY) {
        this.youtube = google.youtube({
          version: 'v3',
          auth: process.env.YOUTUBE_API_KEY
        });
        return;
      }
      const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
      const { client_secret, client_id, redirect_uris } = credentials.installed;
      const oauth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]
      );
      if (fs.existsSync(TOKEN_PATH)) {
        const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
        oauth2Client.setCredentials(token);
        this.auth = oauth2Client;
        this.youtube = google.youtube({ version: 'v3', auth: oauth2Client });
      } else {
        throw new Error('No YouTube API token found. Please run the authentication script first.');
      }
    } catch (error) {
      console.error('Error authenticating with YouTube API:', error);
      throw error;
    }
  }

  async uploadVideo(videoPath: string, metadata: {
    title: string;
    description: string;
    tags?: string[];
    categoryId?: string;
    privacyStatus?: 'public' | 'private' | 'unlisted';
  }) {
    if (!this.youtube) {
      await this.authenticate();
    }
    try {
      const res = await this.youtube!.videos.insert({
        part: ['snippet', 'status'],
        requestBody: {
          snippet: {
            title: metadata.title,
            description: metadata.description,
            tags: metadata.tags,
            categoryId: metadata.categoryId || '22'
          },
          status: {
            privacyStatus: metadata.privacyStatus || 'private'
          }
        },
        media: {
          body: fs.createReadStream(videoPath)
        }
      });
      return res.data;
    } catch (error) {
      console.error('Error uploading video to YouTube:', error);
      throw error;
    }
  }

  async setThumbnail(videoId: string, thumbnailPath: string) {
    if (!this.youtube) {
      await this.authenticate();
    }
    try {
      const res = await this.youtube!.thumbnails.set({
        videoId,
        media: {
          body: fs.createReadStream(thumbnailPath)
        }
      });
      return res.data;
    } catch (error) {
      console.error('Error setting thumbnail:', error);
      throw error;
    }
  }
}

export default new YouTubeAPI();
EOF
    cat > src/api/openai/openai-api.ts << 'EOF'
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.OPENAI_API_KEY) {
  console.warn('WARNING: OPENAI_API_KEY is not set in .env file');
}

export class OpenAIAPI {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async generateScript(topic: string, outline: string[], tone: string = 'informative', maxWords: number = 500): Promise<string> {
    try {
      const outlineText = outline.map(item => `- ${item}`).join('\n');
      const response = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a professional YouTube script writer. Your task is to create engaging scripts with a ${tone} tone. The script should be clear, concise, and optimized for video content.`
          },
          {
            role: 'user',
            content: `Write a script for a YouTube video about "${topic}".
            Here's the outline:
            ${outlineText}

            Keep it under ${maxWords} words. Make it engaging and easy to follow when narrated.`
          }
        ],
        max_tokens: 1500
      });
      return response.choices[0].message.content || '';
    } catch (error) {
      console.error('Error generating script with OpenAI:', error);
      throw error;
    }
  }

  async generateOutline(topic: string, pointCount: number = 5): Promise<string[]> {
    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a content strategy expert. Generate clear, educational outlines for YouTube videos.'
          },
          {
            role: 'user',
            content: `Create a ${pointCount}-point outline for a YouTube video about "${topic}". Make each point concise but descriptive.`
          }
        ],
        max_tokens: 500
      });
      const content = response.choices[0].message.content || '';
      const points = content
        .split('\n')
        .filter(line => line.trim().match(/^\d+\.\s+/))
        .map(line => line.replace(/^\d+\.\s+/, '').trim());
      return points;
    } catch (error) {
      console.error('Error generating outline with OpenAI:', error);
      throw error;
    }
  }
}

export default new OpenAIAPI();
EOF
    cat > src/api/elevenlabs/elevenlabs-api.ts << 'EOF'
import axios from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.ELEVENLABS_API_KEY) {
  console.warn('WARNING: ELEVENLABS_API_KEY is not set in .env file');
}

export class ElevenLabsAPI {
  private apiKey: string;
  private baseUrl: string = 'https://api.elevenlabs.io/v1';

  constructor() {
    this.apiKey = process.env.ELEVENLABS_API_KEY || '';
  }

  async listVoices() {
    try {
      const response = await axios.get(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      });
      return response.data.voices;
    } catch (error) {
      console.error('Error listing ElevenLabs voices:', error);
      throw error;
    }
  }

  async generateSpeech(text: string, voiceId: string = '21m00Tcm4TlvDq8ikWAM', outputPath: string) {
    try {
      const response = await axios({
        method: 'post',
        url: `${this.baseUrl}/text-to-speech/${voiceId}`,
        data: {
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        },
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        },
        responseType: 'arraybuffer'
      });

      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(outputPath, response.data);
      return {
        success: true,
        path: outputPath,
        duration: null
      };
    } catch (error) {
      console.error('Error generating speech with ElevenLabs:', error);
      throw error;
    }
  }
}

export default new ElevenLabsAPI();
EOF
    log_success "API ve servis katmanı kuruldu"
}

# Yardımcı script'leri oluştur
create_utility_scripts() {
    step "7" "Yardımcı script'leri oluşturuyorum"
    cat > scripts/generate-video.js << 'EOF'
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const dotenv = require('dotenv');

dotenv.config();

const args = process.argv.slice(2);
const inputFile = args[0];

if (!inputFile) {
  console.error('Usage: npm run generate -- <input-file.json>');
  process.exit(1);
}

if (!fs.existsSync(inputFile)) {
  console.error(`Error: Input file ${inputFile} not found`);
  process.exit(1);
}

let videoConfig;
try {
  videoConfig = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
} catch (error) {
  console.error(`Error parsing JSON file: ${error.message}`);
  process.exit(1);
}

const outputDir = process.env.OUTPUT_DIR || 'output/videos';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const videoId = videoConfig.id || path.basename(inputFile, '.json');
const outputPath = path.join(outputDir, `${videoId}.mp4`);

console.log(`🎬 Generating video: ${videoId}`);
console.log(`📝 Input: ${inputFile}`);
console.log(`📹 Output: ${outputPath}`);

try {
  const compositionId = videoConfig.composition || 'Main';
  const fps = videoConfig.fps || process.env.VIDEO_FPS || 30;
  const width = videoConfig.width || process.env.VIDEO_WIDTH || 1920;
  const height = videoConfig.height || process.env.VIDEO_HEIGHT || 1080;

  console.log(`🔄 Rendering composition: ${compositionId}`);

  const command = `npx remotion render src/index.ts ${compositionId} ${outputPath} --props="${inputFile}" --fps=${fps} --width=${width} --height=${height} --log=verbose`;

  console.log(`⚙️ Executing: ${command}`);
  execSync(command, { stdio: 'inherit' });

  console.log(`✅ Video generated successfully: ${outputPath}`);
} catch (error) {
  console.error(`❌ Error generating video: ${error.message}`);
  process.exit(1);
}
EOF
    chmod +x scripts/generate-video.js
    cat > scripts/upload-to-youtube.js << 'EOF'
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

console.log('🔄 Importing YouTube API...');
console.log('⚠️ This is a mock implementation. In a real project, you would need to build TypeScript files first.');

const YouTubeAPI = {
  authenticate: async () => console.log('🔑 Authenticated with YouTube API'),
  uploadVideo: async (videoPath, metadata) => {
    console.log(`📤 Uploading video: ${videoPath}`);
    console.log(`📝 Title: ${metadata.title}`);
    console.log(`📝 Description: ${metadata.description}`);
    console.log(`📝 Tags: ${metadata.tags?.join(', ')}`);
    console.log(`📝 Privacy: ${metadata.privacyStatus || 'private'}`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { id: 'MOCK_VIDEO_ID_' + Date.now() };
  },
  setThumbnail: async (videoId, thumbnailPath) => {
    console.log(`🖼️ Setting thumbnail for video ${videoId}: ${thumbnailPath}`);
    return { success: true };
  }
};

const args = process.argv.slice(2);
const videoPath = args[0];
const metadataPath = args[1];

if (!videoPath || !metadataPath) {
  console.error('Usage: npm run upload -- <video-file.mp4> <metadata-file.json>');
  process.exit(1);
}

if (!fs.existsSync(videoPath)) {
  console.error(`Error: Video file ${videoPath} not found`);
  process.exit(1);
}

if (!fs.existsSync(metadataPath)) {
  console.error(`Error: Metadata file ${metadataPath} not found`);
  process.exit(1);
}

let metadata;
try {
  metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
} catch (error) {
  console.error(`Error parsing metadata file: ${error.message}`);
  process.exit(1);
}

async function uploadVideo() {
  try {
    await YouTubeAPI.authenticate();
    const uploadResult = await YouTubeAPI.uploadVideo(videoPath, {
      title: metadata.title,
      description: metadata.description,
      tags: metadata.tags,
      categoryId: metadata.categoryId,
      privacyStatus: metadata.privacyStatus || 'private'
    });

    console.log(`✅ Video uploaded successfully! Video ID: ${uploadResult.id}`);

    if (metadata.thumbnailPath && fs.existsSync(metadata.thumbnailPath)) {
      await YouTubeAPI.setThumbnail(uploadResult.id, metadata.thumbnailPath);
      console.log('✅ Custom thumbnail set successfully!');
    }
    return uploadResult;
  } catch (error) {
    console.error(`❌ Error uploading video: ${error.message}`);
    process.exit(1);
  }
}

uploadVideo();
EOF
    chmod +x scripts/upload-to-youtube.js
    cat > scripts/run-pipeline.js << 'EOF'
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const dotenv = require('dotenv');

dotenv.config();

const args = process.argv.slice(2);
const inputFile = args[0];

if (!inputFile) {
  console.error('Usage: npm run pipeline -- <input-file.json>');
  process.exit(1);
}
if (!fs.existsSync(inputFile)) {
  console.error(`Error: Input file ${inputFile} not found`);
  process.exit(1);
}

console.log('🚀 Starting full video production pipeline');
console.log(`📝 Input: ${inputFile}`);

try {
  console.log('\n📹 STEP 1: Generating video');
  execSync(`node scripts/generate-video.js ${inputFile}`, { stdio: 'inherit' });
} catch (error) {
  console.error(`❌ Video generation failed: ${error.message}`);
  process.exit(1);
}

let videoConfig;
try {
  videoConfig = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
} catch (error) {
  console.error(`Error parsing JSON file: ${error.message}`);
  process.exit(1);
}

const videoId = videoConfig.id || path.basename(inputFile, '.json');
const outputDir = process.env.OUTPUT_DIR || 'output/videos';
const metadataDir = process.env.METADATA_DIR || 'output/metadata';
const videoPath = path.join(outputDir, `${videoId}.mp4`);
const metadataPath = path.join(metadataDir, `${videoId}.json`);

if (!fs.existsSync(metadataDir)) {
  fs.mkdirSync(metadataDir, { recursive: true });
}

const metadata = {
  title: videoConfig.title || `Video ${videoId}`,
  description: videoConfig.description || '',
  tags: videoConfig.tags || [],
  categoryId: videoConfig.categoryId || '22',
  privacyStatus: videoConfig.privacyStatus || 'private',
  thumbnailPath: videoConfig.thumbnailPath || null
};

fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
console.log(`\n📝 STEP 2: Metadata created at ${metadataPath}`);

if (process.env.ENABLE_AUTO_UPLOAD === 'true') {
  try {
    console.log('\n📤 STEP 3: Uploading to YouTube');
    execSync(`node scripts/upload-to-youtube.js ${videoPath} ${metadataPath}`, { stdio: 'inherit' });
  } catch (error) {
    console.error(`❌ YouTube upload failed: ${error.message}`);
    process.exit(1);
  }
} else {
  console.log('\n⏩ STEP 3: YouTube upload skipped (ENABLE_AUTO_UPLOAD is not set to true)');
  console.log(`To upload manually, run: npm run upload -- ${videoPath} ${metadataPath}`);
}

console.log('\n✅ Pipeline completed successfully!');
EOF
    chmod +x scripts/run-pipeline.js
    log_success "Yardımcı script'ler oluşturuldu"
}

# Örnek içerik ve template oluştur
create_sample_content() {
    step "8" "Örnek içerik oluşturuyorum"
    mkdir -p examples/data
    cat > examples/data/sample-video.json << 'EOF'
{
  "id": "sample-video-001",
  "composition": "HelloWorld",
  "fps": 30,
  "width": 1920,
  "height": 1080,
  "title": "Sample Video - Introduction to Remotion",
  "description": "This is a sample video created with the YouTube Automation Station.",
  "tags": ["sample", "remotion", "automation"],
  "privacyStatus": "private",
  "titleText": "Hello, Automation!",
  "titleColor": "rgb(41, 128, 185)"
}
EOF
    # DÜZELTME: README dosyası içeriği daha bilgilendirici olacak şekilde genişletildi.
    cat > README.md << 'EOF'
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
EOF
}

# Banner'ı göster
display_banner

# Sistem gereksinimlerini kontrol et
check_system_requirements

# Kurulum moduna göre adımları uygula
if [[ "$MODE" == "full" ]]; then
    # Tüm bileşenleri kur
    setup_devcontainer
    create_project_structure
    setup_remotion
    create_remotion_library
    setup_api_services
    create_utility_scripts
    create_sample_content
elif [[ "$MODE" == "dev-only" ]]; then
    # Sadece geliştirme ortamını kur
    setup_devcontainer
    create_project_structure
    create_sample_content
elif [[ "$MODE" == "remotion-only" ]]; then
    # Sadece Remotion ortamını kur
    setup_remotion
    create_remotion_library
fi

log_success "Kurulum tamamlandı! YouTube otomasyon istasyonunuz artık kullanıma hazır."

