# 📚 Excalidraw Integration Examples

This directory contains examples showcasing the Excalidraw JSON Schema integration with the YouTube Automation Factory.

## 📁 Directory Structure

```
examples/
├── README.md                    # This file
├── sample-analysis.json         # Complete analysis.json example
├── sample-excalidraw.json       # Generated Excalidraw file example
└── style-demos/                 # Style-specific demo files
    ├── educational-demo.excalidraw
    ├── business-demo.excalidraw
    ├── motivational-demo.excalidraw
    └── technical-demo.excalidraw
```

## 🚀 Quick Start

### 1. Generate Sample Files
```bash
# Create sample analysis and demo files
node scripts/convert-analysis.js --sample --demo
```

### 2. Convert Analysis to Excalidraw
```bash
# Convert sample analysis file
node scripts/convert-analysis.js -i examples/sample-analysis.json
```

### 3. Test Excalidraw Demo
```bash
# Run the Excalidraw demo script
node scripts/demo-excalidraw.js
```

## 📖 File Descriptions

### `sample-analysis.json`
A complete example of our analysis.json format containing:
- Video metadata (title, duration, style)
- Multiple scenes with Excalidraw data
- Animation configurations
- Audio narration text
- Style-specific settings

### `sample-excalidraw.json`
Generated Excalidraw file showing:
- Official Excalidraw JSON schema compliance
- Element definitions (rectangles, text, arrows)
- App state configuration
- Styling and color schemes

### Style Demos
Four different video styles with their visual characteristics:

#### 🎓 Educational Demo
- **Colors**: Blue primary, clean backgrounds
- **Fonts**: Excalifont for readability
- **Style**: Professional, clear diagrams
- **Use Case**: Tutorial videos, courses

#### 💼 Business Demo
- **Colors**: Indigo, corporate palette
- **Fonts**: Helvetica for professionalism
- **Style**: Clean, minimal design
- **Use Case**: Presentations, reports

#### 🔥 Motivational Demo
- **Colors**: Orange, energetic yellows
- **Fonts**: Lilita One for impact
- **Style**: Bold, inspiring visuals
- **Use Case**: Motivational content

#### ⚡ Technical Demo
- **Colors**: Green on dark background
- **Fonts**: Cascadia Code for tech feel
- **Style**: Developer-friendly
- **Use Case**: Coding tutorials, tech explanations

## 🎯 Usage Examples

### Creating Custom Analysis Files

```javascript
const customAnalysis = {
  version: "1.0.0",
  metadata: {
    title: "Your Video Title",
    description: "Video description",
    duration: 120,
    style: "educational", // or business, motivational, technical
    language: "en"
  },
  scenes: [
    {
      id: "intro",
      type: "excalidraw",
      start: 0,
      duration: 30,
      data: {
        title: "Introduction",
        content: [
          "Point 1",
          "Point 2",
          "Point 3"
        ]
      },
      animation: {
        type: "progressive-draw",
        speed: "normal"
      }
    }
  ]
};
```

### Converting to Excalidraw Format

```javascript
const {
  convertAnalysisToExcalidraw,
  createDiagramFromText
} = require('../src/analysis/integration-excalidraw');

// Convert full analysis
const excalidrawFiles = convertAnalysisToExcalidraw(analysisData);

// Or create simple diagram
const diagram = createDiagramFromText(
  'My Process',
  ['Step 1', 'Step 2', 'Step 3'],
  'educational'
);
```

### Using in Video Production

```javascript
// In your Remotion composition
import { ExcalidrawRenderer } from '../src/excalidraw-renderer';

const MyVideo = () => {
  return (
    <ExcalidrawRenderer
      data={excalidrawData}
      animationType="progressive-draw"
      style="educational"
    />
  );
};
```

## 🛠 Customization

### Adding New Styles

1. Update `STYLE_CONFIGURATIONS` in `integration-excalidraw.ts`
2. Add color scheme in `getColorForStyle()` function
3. Create demo file in `style-demos/` directory
4. Test with convert-analysis script

### Custom Element Types

Extend the element creation system:

```javascript
// Add to transforms.ts
export const newCustomElement = (opts) => {
  return {
    ...getDefaultElementProps(),
    type: "custom-type",
    // your custom properties
    ...opts,
  };
};
```

### Animation Configurations

Supported animation types:
- `progressive-draw`: Elements appear by drawing
- `fade-in`: Elements fade into view
- `slide-in`: Elements slide from edges
- `none`: No animation

Speed options:
- `slow`: 2x slower than normal
- `normal`: Default timing
- `fast`: 2x faster than normal

## 🔗 Integration Points

### With AI Content Generation
```javascript
// Generate content with Gemini AI
const aiContent = await generateContent(prompt);
const analysisJson = formatForAnalysis(aiContent);
const excalidrawFiles = convertAnalysisToExcalidraw(analysisJson);
```

### With Remotion Rendering
```javascript
// Use in Remotion composition
import { ExcalidrawDemo } from '../src/remotion/compositions';

<ExcalidrawDemo excalidrawData={convertedData} />
```

### With Pipeline Automation
```bash
# Full pipeline from prompt to video
node scripts/create-video-from-prompt.js \
  --topic="JavaScript Basics" \
  --style=educational \
  --duration=120
```

## 📋 Validation

All generated Excalidraw files are validated against the official schema:

```javascript
const { validateExcalidrawFile } = require('../src/excalidraw/validation');

const isValid = validateExcalidrawFile(excalidrawData);
if (!isValid) {
  console.error('Invalid Excalidraw format');
}
```

## 🎬 Animation Timeline

Understanding the timing system:

```javascript
{
  "start": 0,        // Start time in seconds
  "duration": 30,    // Scene duration
  "animation": {
    "type": "progressive-draw",
    "speed": "normal",
    "delay": 0.5     // Optional delay before animation starts
  }
}
```

## 🔧 Troubleshooting

### Common Issues

1. **Invalid JSON Format**
   ```bash
   # Validate JSON syntax
   node -c examples/sample-analysis.json
   ```

2. **Missing Dependencies**
   ```bash
   # Reinstall modules
   npm install
   ```

3. **TypeScript Errors**
   ```bash
   # Check types
   npm run typecheck
   ```

4. **File Paths**
   ```bash
   # Use absolute paths if relative paths fail
   node scripts/convert-analysis.js -i $(pwd)/examples/sample-analysis.json
   ```

## 🤝 Contributing

To contribute new examples:

1. Create your analysis.json file
2. Test conversion with the script
3. Add documentation to this README
4. Submit PR with examples

## 📚 Further Reading

- [Excalidraw Official Docs](https://github.com/excalidraw/excalidraw)
- [Remotion Documentation](https://remotion.dev/docs/)
- [Project Main README](../README.md)
- [API Reference](../src/excalidraw/README.md)

---

🎉 **Ready to create amazing automated videos with Excalidraw integration!**