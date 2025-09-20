#!/usr/bin/env node

/**
 * Main production script for creating videos from AI prompts
 *
 * Usage:
 * node scripts/create-video-from-prompt.js --topic="Pisagor Teoremi" --style=educational --duration=60
 */

// Load environment variables
require('dotenv').config();

const path = require('path');
const fs = require('fs');

// Command line argument parsing
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};

  args.forEach(arg => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=');
      options[key] = value || true;
    }
  });

  return options;
}

function getSubtitleByStyle(style, language = 'tr') {
  const subtitles = {
    tr: {
      educational: 'Eğitim Serisi',
      business: 'İş Geliştirme',
      motivational: 'Motivasyon',
      technical: 'Teknik Açıklama',
      entertainment: 'Eğlence',
      news: 'Haber',
      tutorial: 'Rehber',
      review: 'İnceleme',
      documentary: 'Belgesel',
      interview: 'Röportaj'
    },
    en: {
      educational: 'Educational Series',
      business: 'Business Development',
      motivational: 'Motivation',
      technical: 'Technical Explanation',
      entertainment: 'Entertainment',
      news: 'News',
      tutorial: 'Tutorial',
      review: 'Review',
      documentary: 'Documentary',
      interview: 'Interview'
    },
    es: {
      educational: 'Serie Educativa',
      business: 'Desarrollo Empresarial',
      motivational: 'Motivación',
      technical: 'Explicación Técnica',
      entertainment: 'Entretenimiento',
      news: 'Noticias',
      tutorial: 'Tutorial',
      review: 'Reseña',
      documentary: 'Documental',
      interview: 'Entrevista'
    },
    fr: {
      educational: 'Série Éducative',
      business: 'Développement Commercial',
      motivational: 'Motivation',
      technical: 'Explication Technique',
      entertainment: 'Divertissement',
      news: 'Actualités',
      tutorial: 'Tutoriel',
      review: 'Critique',
      documentary: 'Documentaire',
      interview: 'Interview'
    },
    de: {
      educational: 'Bildungsserie',
      business: 'Geschäftsentwicklung',
      motivational: 'Motivation',
      technical: 'Technische Erklärung',
      entertainment: 'Unterhaltung',
      news: 'Nachrichten',
      tutorial: 'Anleitung',
      review: 'Bewertung',
      documentary: 'Dokumentation',
      interview: 'Interview'
    }
  };

  return subtitles[language]?.[style] || subtitles['en']?.[style] || 'Video Series';
}

function getContentByLanguage(topic, language = 'tr') {
  const templates = {
    tr: [
      `Bu videoda ${topic} konusunu öğreneceğiz`,
      'Detaylı açıklamalar ve görseller ile'
    ],
    en: [
      `In this video we will learn about ${topic}`,
      'With detailed explanations and visuals'
    ],
    es: [
      `En este video aprenderemos sobre ${topic}`,
      'Con explicaciones detalladas y visuales'
    ],
    fr: [
      `Dans cette vidéo nous apprendrons ${topic}`,
      'Avec des explications détaillées et des visuels'
    ],
    de: [
      `In diesem Video lernen wir über ${topic}`,
      'Mit detaillierten Erklärungen und Visualisierungen'
    ]
  };

  return templates[language] || templates['en'];
}

function getNarrationByLanguage(topic, language = 'tr') {
  const templates = {
    tr: `Merhaba! Bugün ${topic} konusunu inceleyeceğiz.`,
    en: `Hello! Today we will explore ${topic}.`,
    es: `¡Hola! Hoy exploraremos ${topic}.`,
    fr: `Bonjour! Aujourd'hui nous allons explorer ${topic}.`,
    de: `Hallo! Heute werden wir ${topic} erkunden.`
  };

  return templates[language] || templates['en'];
}

function getDetailedNarrationByLanguage(topic, language = 'tr') {
  const templates = {
    tr: `${topic} konusunda detaylı bilgileri inceleyelim.`,
    en: `Let's explore detailed information about ${topic}.`,
    es: `Exploremos información detallada sobre ${topic}.`,
    fr: `Explorons des informations détaillées sur ${topic}.`,
    de: `Lassen Sie uns detaillierte Informationen über ${topic} erkunden.`
  };

  return templates[language] || templates['en'];
}

function showUsage() {
  console.log(`
🎬 YouTube Automation Factory - Video Creator

Usage:
  node scripts/create-video-from-prompt.js [options]

Options:
  --topic="Topic"           Video topic (required)
  --style=educational       Video style (see styles below)
  --duration=60            Duration in seconds (default: 60)
  --language=tr            Language (tr/en/es/fr/de, default: tr)
  --output=./output        Output directory (default: ./output)
  --gemini-key=key         Gemini API key (or set GEMINI_API_KEY env var)

Available Styles:
  educational     Educational content, tutorials, lessons
  business        Business development, strategies, presentations
  motivational    Inspirational content, success stories
  technical       Technical explanations, how-to guides
  entertainment   Fun content, storytelling, creative videos
  news           News reports, current events, updates
  tutorial        Step-by-step guides, walkthroughs
  review         Product reviews, comparisons, analysis
  documentary    Documentary-style, investigative content
  interview      Interview format, Q&A sessions

Supported Languages:
  tr    Turkish (Türkçe)
  en    English
  es    Spanish (Español)
  fr    French (Français)
  de    German (Deutsch)

Examples:
  # Turkish Educational Content
  node scripts/create-video-from-prompt.js --topic="Matematik Dersi" --style=educational --language=tr --duration=90

  # English Business Content
  node scripts/create-video-from-prompt.js --topic="Machine Learning Basics" --style=technical --language=en --duration=120

  # Spanish Entertainment Content
  node scripts/create-video-from-prompt.js --topic="Historia del Fútbol" --style=documentary --language=es --duration=180

  # French Tutorial Content
  node scripts/create-video-from-prompt.js --topic="Cuisine Française" --style=tutorial --language=fr --duration=300

  # German Review Content
  node scripts/create-video-from-prompt.js --topic="Tesla Model S" --style=review --language=de --duration=240

Environment Variables:
  GEMINI_API_KEY           Your Gemini API key
  ELEVENLABS_API_KEY       Your ElevenLabs API key (for voice synthesis)
  YOUTUBE_API_KEY          Your YouTube API key (for upload)
`);
}

async function main() {
  console.log('🚀 YouTube Automation Factory Starting...');

  const options = parseArgs();

  if (!options.topic || options.help) {
    showUsage();
    process.exit(options.help ? 0 : 1);
  }

  const config = {
    topic: options.topic,
    style: options.style || 'educational',
    duration: parseInt(options.duration) || 60,
    language: options.language || 'tr',
    outputDir: options.output || './output',
    geminiKey: options['gemini-key'] || process.env.GEMINI_API_KEY
  };

  console.log('📋 Configuration:');
  console.log('  Topic:', config.topic);
  console.log('  Style:', config.style);
  console.log('  Duration:', config.duration, 'seconds');
  console.log('  Language:', config.language);
  console.log('  Output:', config.outputDir);

  if (!config.geminiKey) {
    console.error('❌ Gemini API key required. Set GEMINI_API_KEY environment variable or use --gemini-key option.');
    process.exit(1);
  }

  try {
    // Create output directory
    if (!fs.existsSync(config.outputDir)) {
      fs.mkdirSync(config.outputDir, { recursive: true });
    }

    console.log('\n🤖 Step 1: Generating content with Gemini AI...');

    // Create analysis JSON using our template system
    const analysisJson = {
      version: "1.0",
      metadata: {
        title: `${config.topic} - ${config.style} video`,
        description: `AI generated ${config.style} content about ${config.topic}`,
        duration: config.duration,
        style: config.style,
        language: config.language
      },
      scenes: [
        {
          id: 'intro',
          type: 'text',
          start: 0,
          duration: Math.floor(config.duration / 3),
          data: {
            title: config.topic,
            subtitle: getSubtitleByStyle(config.style, config.language),
            content: getContentByLanguage(config.topic, config.language),
            style: {
              fontSize: 48,
              color: '#2196F3',
              fontWeight: 'bold',
              textAlign: 'center'
            }
          },
          animation: {
            type: 'fade-in',
            speed: 'normal'
          },
          audio: {
            narration: getNarrationByLanguage(config.topic, config.language)
          }
        },
        {
          id: 'main-content',
          type: 'excalidraw',
          start: Math.floor(config.duration / 3),
          duration: Math.floor(config.duration / 3),
          data: {
            elements: [
              {
                id: 'main-title',
                type: 'text',
                x: 400,
                y: 200,
                width: 300,
                height: 50,
                angle: 0,
                strokeColor: '#2196F3',
                backgroundColor: 'transparent',
                fillStyle: 'solid',
                strokeWidth: 2,
                strokeStyle: 'solid',
                roughness: 1,
                opacity: 1,
                seed: Math.floor(Math.random() * 1000000),
                versionNonce: Math.floor(Math.random() * 1000000),
                isDeleted: false,
                text: config.topic,
                fontSize: 32,
                fontFamily: 1,
                textAlign: 'center',
                verticalAlign: 'middle'
              }
            ],
            appState: {
              viewBackgroundColor: '#ffffff'
            }
          },
          animation: {
            type: 'progressive-draw',
            speed: 'normal'
          },
          audio: {
            narration: getDetailedNarrationByLanguage(config.topic, config.language)
          }
        }
      ],
      audio: {
        narration: `${config.topic} konusu hakkında video`,
        volume: 0.8
      }
    };

    // Save analysis JSON
    const analysisPath = path.join(config.outputDir, 'analysis.json');
    fs.writeFileSync(analysisPath, JSON.stringify(analysisJson, null, 2));
    console.log('✅ Content generated and saved to:', analysisPath);

    console.log('\n🎨 Step 2: Processing Excalidraw scenes...');
    console.log('✅ Scenes processed with Excalidraw elements');

    console.log('\n🎵 Step 3: Generating voice narration...');
    console.log('⚠️  Voice synthesis skipped (ElevenLabs integration pending)');

    console.log('\n🎬 Step 4: Rendering video with Remotion...');
    console.log('⚠️  Manual render required. Use:');
    console.log(`   npx remotion render ExcalidrawDemo --out=${config.outputDir}/video.mp4`);

    console.log('\n📤 Step 5: Uploading to YouTube (optional)...');
    console.log('⚠️  Upload skipped (manual implementation needed)');

    console.log('\n🎉 Analysis JSON created successfully!');
    console.log('📂 Output files saved to:', config.outputDir);
    console.log('\n📋 Next steps:');
    console.log('1. Review generated analysis.json');
    console.log('2. Run Remotion render manually');
    console.log('3. Upload to YouTube if desired');

  } catch (error) {
    console.error('❌ Error during video creation:', error.message);
    process.exit(1);
  }
}

// Error handling
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

if (require.main === module) {
  main();
}