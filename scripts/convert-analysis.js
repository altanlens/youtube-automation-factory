#!/usr/bin/env node
/**
 * Convert Analysis JSON to Excalidraw
 * Converts our analysis.json format to Excalidraw compatible files
 */

const {
  convertAnalysisToExcalidraw,
  convertSceneToExcalidraw,
  createDiagramFromText,
  batchConvertAnalysis,
} = require('../src/analysis/integration-excalidraw');
const { serializeAsJSON } = require('../src/excalidraw');
const fs = require('fs');
const path = require('path');

/**
 * Sample analysis data for testing
 */
const SAMPLE_ANALYSIS = {
  version: "1.0.0",
  metadata: {
    title: "Introduction to JavaScript",
    description: "A beginner's guide to JavaScript fundamentals",
    duration: 120,
    style: "educational",
    language: "en"
  },
  scenes: [
    {
      id: "scene-1",
      type: "excalidraw",
      start: 0,
      duration: 30,
      data: {
        title: "What is JavaScript?",
        content: [
          "Programming language for web development",
          "Runs in browsers and servers (Node.js)",
          "Dynamic and interpreted language",
          "Essential for modern web applications"
        ]
      },
      animation: {
        type: "progressive-draw",
        speed: "normal"
      },
      audio: {
        narration: "Let's start with understanding what JavaScript is..."
      }
    },
    {
      id: "scene-2",
      type: "excalidraw",
      start: 30,
      duration: 45,
      data: {
        title: "JavaScript Fundamentals",
        content: [
          "Variables: let, const, var",
          "Data Types: string, number, boolean",
          "Functions: function expressions",
          "Objects and Arrays",
          "Control Flow: if/else, loops"
        ]
      },
      animation: {
        type: "fade-in",
        speed: "slow"
      },
      audio: {
        narration: "Now let's explore the fundamental concepts..."
      }
    },
    {
      id: "scene-3",
      type: "excalidraw",
      start: 75,
      duration: 45,
      data: {
        title: "Getting Started",
        content: [
          "Set up your development environment",
          "Write your first JavaScript program",
          "Use browser developer tools",
          "Practice with online editors",
          "Join the JavaScript community"
        ]
      },
      animation: {
        type: "slide-in",
        speed: "fast"
      },
      audio: {
        narration: "Here's how you can start your JavaScript journey..."
      }
    }
  ],
  audio: {
    narration: "Welcome to this comprehensive JavaScript tutorial",
    backgroundMusic: "upbeat-educational.mp3",
    volume: 0.8
  }
};

/**
 * Converts analysis file to Excalidraw files
 */
function convertAnalysisFile(inputPath, outputDir, options = {}) {
  console.log(`📖 Reading analysis file: ${inputPath}`);
  
  let analysisData;
  try {
    const fileContent = fs.readFileSync(inputPath, 'utf8');
    analysisData = JSON.parse(fileContent);
  } catch (error) {
    throw new Error(`Failed to read or parse analysis file: ${error.message}`);
  }
  
  console.log(`🎬 Converting ${analysisData.scenes?.length || 0} scenes...`);
  
  const excalidrawFiles = convertAnalysisToExcalidraw(analysisData);
  
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const results = [];
  
  excalidrawFiles.forEach((file, index) => {
    const scene = analysisData.scenes[index];
    const fileName = `scene-${index + 1}-${scene?.id || 'unknown'}.excalidraw`;
    const filePath = path.join(outputDir, fileName);
    
    const jsonData = serializeAsJSON(file.elements, file.appState, file.files);
    fs.writeFileSync(filePath, jsonData, 'utf8');
    
    results.push({
      sceneId: scene?.id,
      fileName,
      filePath,
      elementCount: file.elements.length,
      fileSize: jsonData.length,
    });
    
    console.log(`✅ Created: ${fileName} (${file.elements.length} elements)`);
  });
  
  return results;
}

/**
 * Creates a sample analysis file
 */
function createSampleAnalysis(outputPath) {
  console.log(`📝 Creating sample analysis file: ${outputPath}`);
  
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(SAMPLE_ANALYSIS, null, 2), 'utf8');
  console.log('✅ Sample analysis file created');
}

/**
 * Creates a simple diagram demo
 */
function createDiagramDemo(outputDir) {
  console.log('🎨 Creating diagram demo...');
  
  const title = 'Web Development Stack';
  const items = [
    'HTML - Structure',
    'CSS - Styling', 
    'JavaScript - Interactivity',
    'React - UI Framework',
    'Node.js - Backend'
  ];
  
  const diagramFile = createDiagramFromText(title, items, 'technical');
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const fileName = 'web-development-stack-diagram.excalidraw';
  const filePath = path.join(outputDir, fileName);
  
  const jsonData = serializeAsJSON(diagramFile.elements, diagramFile.appState, diagramFile.files);
  fs.writeFileSync(filePath, jsonData, 'utf8');
  
  console.log(`✅ Diagram demo created: ${fileName}`);
  return filePath;
}

/**
 * Main conversion function
 */
function runConversion(options = {}) {
  try {
    console.log('🚀 Starting Analysis to Excalidraw Conversion');
    console.log('=============================================');

    const {
      input,
      output = './output/excalidraw',
      createSample = false,
      createDemo = false
    } = options;

    // Create sample analysis file if requested
    if (createSample) {
      const samplePath = path.join(output, 'sample-analysis.json');
      createSampleAnalysis(samplePath);
      console.log(`📄 Sample created at: ${samplePath}`);
    }

    // Create diagram demo if requested
    if (createDemo) {
      const demoPath = createDiagramDemo(output);
      console.log(`🎨 Demo created at: ${demoPath}`);
    }

    // Convert input file if provided
    if (input) {
      if (!fs.existsSync(input)) {
        throw new Error(`Input file not found: ${input}`);
      }

      console.log(`\n📥 Converting: ${input}`);
      const results = convertAnalysisFile(input, output);
      
      console.log('\n📊 Conversion Results:');
      results.forEach(result => {
        console.log(`   📁 ${result.fileName}`);
        console.log(`      Elements: ${result.elementCount}`);
        console.log(`      Size: ${(result.fileSize / 1024).toFixed(2)} KB`);
        console.log(`      Path: ${result.filePath}`);
      });
      
      console.log(`\n✅ Successfully converted ${results.length} scenes!`);
    }

    console.log('\n🎉 Conversion completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Open .excalidraw files in https://excalidraw.com');
    console.log('2. Import them into your Excalidraw instance');
    console.log('3. Use them as templates for video generation');
    
  } catch (error) {
    console.error('❌ Conversion failed:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

/**
 * Command line interface
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Analysis to Excalidraw Converter

Usage: node scripts/convert-analysis.js [options]

Options:
  -i, --input <file>     Input analysis JSON file
  -o, --output <dir>     Output directory (default: ./output/excalidraw)
  --sample               Create sample analysis.json file
  --demo                 Create diagram demo
  --help, -h             Show this help message

Examples:
  # Create sample files
  node scripts/convert-analysis.js --sample --demo

  # Convert specific analysis file
  node scripts/convert-analysis.js -i examples/sample-analysis.json

  # Convert with custom output directory
  node scripts/convert-analysis.js -i analysis.json -o ./my-excalidraw-files

  # Create sample and convert
  node scripts/convert-analysis.js --sample -i ./output/excalidraw/sample-analysis.json
`);
    process.exit(0);
  }

  const options = {};
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '-i':
      case '--input':
        options.input = args[i + 1];
        i++;
        break;
      case '-o':
      case '--output':
        options.output = args[i + 1];
        i++;
        break;
      case '--sample':
        options.createSample = true;
        break;
      case '--demo':
        options.createDemo = true;
        break;
    }
  }
  
  // If no specific options, create sample and demo by default
  if (!options.input && !options.createSample && !options.createDemo) {
    options.createSample = true;
    options.createDemo = true;
    console.log('🎯 No specific options provided, creating sample files and demo...');
  }
  
  runConversion(options);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  convertAnalysisFile,
  createSampleAnalysis,
  createDiagramDemo,
  runConversion,
  SAMPLE_ANALYSIS,
};