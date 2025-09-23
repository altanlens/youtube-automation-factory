# 🎥 YouTube Automation Factory

**Complete YouTube video production automation system with AI-powered Excalidraw integration**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Remotion](https://img.shields.io/badge/Remotion-000000?style=for-the-badge&logo=remotion&logoColor=white)](https://remotion.dev/)
[![Excalidraw](https://img.shields.io/badge/Excalidraw-6C63FF?style=for-the-badge&logo=excalidraw&logoColor=white)](https://excalidraw.com/)

## ✨ Features

### 🎨 **Excalidraw Integration**
- **Official JSON Schema** - 100% compatible with Excalidraw's format
- **Hand-drawn Aesthetics** - Powered by Rough.js for authentic sketchy visuals
- **Animation System** - Progressive drawing, fade-in, slide-in effects
- **Style Templates** - Educational, Business, Motivational, Technical themes
- **TypeScript Support** - Full type safety and IntelliSense

### 🤖 **AI Content Generation**
- **Gemini AI Integration** - Automated content creation from prompts
- **Smart Analysis** - JSON schema generation for video scenes
- **Multi-language Support** - Optimized for Turkish content
- **Template System** - Pre-built templates for different video types

### 🎬 **Video Production Pipeline**
- **Remotion Engine** - React-based video rendering
- **Batch Processing** - Multiple video generation
- **Quality Control** - 7-layer validation system
- **Performance Optimization** - Fast rendering with caching

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/altanlens/youtube-automation-factory.git
cd youtube-automation-factory

# Install dependencies
npm install

# Start development server
npm start
```

### Basic Usage

```bash
# 1. Create sample files and examples
npm run examples:create

# 2. Test Excalidraw demo
npm run excalidraw:demo

# 3. Convert analysis JSON to Excalidraw
npm run examples:convert

# 4. Generate video from prompt
npm run create-from-prompt -- --topic="React Hooks" --style=educational
```

## 📁 Project Structure

```
youtube-automation-factory/
├── src/
│   ├── excalidraw/              # 🎨 Excalidraw JSON Schema
│   │   ├── types/               # TypeScript definitions
│   │   ├── constants.ts         # Excalidraw constants
│   │   ├── validation.ts        # Schema validation
│   │   ├── serialization.ts     # JSON serialization
│   │   ├── transforms.ts        # Element factories
│   │   ├── utils.ts             # Utility functions
│   │   └── index.ts             # Main export
│   ├── analysis/                # 🤖 AI Integration
│   │   └── integration-excalidraw.ts  # Analysis → Excalidraw converter
│   ├── remotion/                # 🎬 Video Engine
│   └── utils/                   # 🛠 Utilities
├── scripts/                     # 📜 Automation Scripts
│   ├── demo-excalidraw.js       # Excalidraw demo generator
│   ├── convert-analysis.js      # Analysis converter CLI
│   └── create-video-from-prompt.js  # AI video generator
├── examples/                    # 📚 Examples & Documentation
│   ├── README.md                # Comprehensive guide
│   ├── sample-analysis.json     # Sample input file
│   └── style-demos/             # Style-specific examples
└── output/                      # 📤 Generated files
```

## 🎨 Excalidraw Integration

### Core Features

Our Excalidraw integration provides a complete implementation of the official Excalidraw JSON schema:

```typescript
import { 
  createExcalidrawFile, 
  newTextElement, 
  newRectangleElement,
  serializeAsJSON,
  validateExcalidrawFile 
} from './src/excalidraw';

// Create elements
const title = newTextElement({
  x: 100, y: 100,
  text: "My Diagram",
  fontSize: 32,
  fontFamily: 5 // Excalifont
});

// Create complete file
const excalidrawFile = createExcalidrawFile([title]);

// Validate and serialize
const isValid = validateExcalidrawFile(excalidrawFile);
const jsonData = serializeAsJSON(excalidrawFile.elements, excalidrawFile.appState);
```

### Animation System

Support for three animation types with customizable timing:

```javascript
{
  "animation": {
    "type": "progressive-draw",  // or "fade-in", "slide-in"
    "speed": "normal",           // or "slow", "fast" 
    "delay": 0.5                 // Optional delay in seconds
  }
}
```

### Style Templates

Four pre-configured visual styles:

| Style | Colors | Font | Use Case |
|-------|--------|------|----------|
| **Educational** | Blue/White | Excalifont | Tutorials, Courses |
| **Business** | Indigo/Gray | Helvetica | Presentations, Reports |
| **Motivational** | Orange/Yellow | Lilita One | Inspiration, Success |
| **Technical** | Green/Dark | Cascadia Code | Programming, Tech |

## 🤖 AI Content Generation

### From Prompt to Video

```bash
# Generate educational content
npm run create-from-prompt -- \\
  --topic="JavaScript Arrays" \\
  --style=educational \\
  --duration=120 \\
  --language=en

# Generate business presentation
npm run create-from-prompt -- \\
  --topic="Q4 Sales Report" \\
  --style=business \\
  --duration=180
```

### Analysis JSON Format

Our AI generates structured JSON that converts to Excalidraw:

```json
{
  "version": "1.0.0",
  "metadata": {
    "title": "React Hooks Tutorial",
    "style": "educational",
    "duration": 180
  },
  "scenes": [
    {
      "id": "intro",
      "type": "excalidraw",
      "start": 0,
      "duration": 30,
      "data": {
        "title": "What are React Hooks?",
        "content": [
          "State management in functional components",
          "Introduced in React 16.8",
          "Replaces class component logic"
        ]
      },
      "animation": {
        "type": "progressive-draw",
        "speed": "normal"
      }
    }
  ]
}
```

## 📜 Available Scripts

### Development
```bash
npm start              # Start Remotion preview server
npm run dev            # Alias for start
npm run typecheck      # TypeScript validation
npm run lint           # ESLint code checking
```

### Excalidraw Integration
```bash
npm run excalidraw:demo        # Generate demo Excalidraw file
npm run excalidraw:convert     # Convert analysis.json to .excalidraw
npm run excalidraw:samples     # Create sample files
npm run excalidraw:validate    # Validate schema implementation
```

### Examples & Testing
```bash
npm run examples:create        # Generate all example files
npm run examples:convert       # Convert sample analysis
npm run integration:test       # Full integration test
```

### Video Production
```bash
npm run render:fast            # Fast video rendering
npm run render:batch          # Batch process multiple videos
npm run pipeline              # Full automation pipeline
```

## 🛠 Advanced Usage

### Custom Element Creation

Extend the Excalidraw schema with custom elements:

```typescript
import { newRectangleElement, newTextElement } from './src/excalidraw';

// Create custom diagram component
export function createProcessDiagram(steps: string[], style: string) {
  const elements = [];
  
  steps.forEach((step, index) => {
    // Create step box
    const box = newRectangleElement({
      x: 100,
      y: 100 + (index * 120),
      width: 200,
      height: 80,
      strokeColor: getColorForStyle(style, 'primary'),
      backgroundColor: getColorForStyle(style, 'background')
    });
    
    // Add step text
    const text = newTextElement({
      x: 110,
      y: 120 + (index * 120),
      text: step,
      fontSize: 16
    });
    
    elements.push(box, text);
  });
  
  return elements;
}
```

### Integration with Remotion

Use Excalidraw data in Remotion compositions:

```tsx
import { useCurrentFrame, interpolate } from 'remotion';
import { ExcalidrawRenderer } from '../src/excalidraw-renderer';

export const ExcalidrawScene: React.FC<{data: ExcalidrawData}> = ({data}) => {
  const frame = useCurrentFrame();
  
  const opacity = interpolate(frame, [0, 30], [0, 1]);
  
  return (
    <div style={{opacity}}>
      <ExcalidrawRenderer 
        data={data}
        animationType="progressive-draw"
        style="educational"
      />
    </div>
  );
};
```

### Batch Processing

Process multiple analysis files:

```bash
# Convert multiple files
find ./input -name "*.json" -exec npm run excalidraw:convert -- -i {} \\;

# Generate multiple videos
npm run render:batch -- educational production
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file:

```env
# AI API Keys
GEMINI_API_KEY=your_gemini_api_key

# Video Settings
VIDEO_WIDTH=1920
VIDEO_HEIGHT=1080
VIDEO_FPS=30

# Output Settings
OUTPUT_DIR=./output
TEMP_DIR=./temp

# Style Defaults
DEFAULT_STYLE=educational
DEFAULT_DURATION=120
```

### TypeScript Configuration

The project includes comprehensive TypeScript support:

```json
{
  "compilerOptions": {
    "strict": true,
    "moduleResolution": "node",
    "esModuleInterop": true,
    "jsx": "react-jsx"
  },
  "include": [
    "src/**/*",
    "scripts/**/*"
  ]
}
```

## 📊 Performance

### Rendering Performance
- **Fast Mode**: ~2x speed with quality trade-offs
- **Production Mode**: Full quality, optimized encoding
- **Batch Mode**: Parallel processing for multiple videos
- **Preview Mode**: Quick iteration for development

### Memory Optimization
- **Element Pooling**: Reuse Excalidraw elements
- **Lazy Loading**: Load scenes on demand
- **Cleanup System**: Automatic memory management
- **Caching**: Intelligent asset caching

## 🧪 Testing

```bash
# Run all tests
npm test

# Type checking
npm run typecheck

# Integration testing
npm run integration:test

# Validate Excalidraw schema
npm run schema:validate
```

## 📚 Documentation

- **[Examples Guide](./examples/README.md)** - Comprehensive usage examples
- **[API Reference](./src/excalidraw/README.md)** - Complete API documentation
- **[Excalidraw Schema](https://github.com/excalidraw/excalidraw)** - Official documentation
- **[Remotion Docs](https://remotion.dev/docs/)** - Video rendering framework

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript strict mode
- Add tests for new features
- Update documentation
- Validate Excalidraw schema compliance

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[Excalidraw Team](https://github.com/excalidraw/excalidraw)** - Amazing drawing tool and schema
- **[Remotion](https://remotion.dev/)** - Powerful video rendering framework  
- **[Rough.js](https://roughjs.com/)** - Hand-drawn graphics library
- **[Google AI](https://ai.google.dev/)** - Gemini API for content generation

## 🚀 Roadmap

### ✅ Completed
- [x] Excalidraw JSON Schema implementation
- [x] TypeScript integration
- [x] Animation system
- [x] Style templates
- [x] CLI tools

### 🔄 In Progress
- [ ] Voice synthesis integration
- [ ] Advanced animation effects
- [ ] Custom element library

### 📋 Planned
- [ ] YouTube upload automation
- [ ] Real-time collaboration
- [ ] Template marketplace
- [ ] Mobile app support

---

**Made with ❤️ for the content creation community**

*Transform your ideas into professional videos with the power of AI and beautiful hand-drawn aesthetics.*