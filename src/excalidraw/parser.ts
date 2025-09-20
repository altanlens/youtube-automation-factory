import { ExcalidrawElement, ExcalidrawScene } from './types';

export class ExcalidrawParser {

  // Convert Excalidraw JSON to SVG using built-in Excalidraw functions
  static async parseToSVG(scene: ExcalidrawScene, options: {
    width?: number;
    height?: number;
    background?: string;
    exportPadding?: number;
  } = {}): Promise<string> {

    const {
      width = 800,
      height = 600,
      background = 'transparent',
      exportPadding = 20
    } = options;

    try {
      // We'll use Excalidraw's built-in exportToSvg function
      // This is a placeholder - will be implemented with actual Excalidraw API
      const svgString = await this.convertElementsToSVG(scene.elements, {
        width,
        height,
        background,
        exportPadding
      });

      return svgString;
    } catch (error) {
      console.error('Error parsing Excalidraw to SVG:', error);
      throw new Error(`Failed to convert Excalidraw scene to SVG: ${error}`);
    }
  }

  // Manual SVG conversion for basic shapes (fallback)
  private static async convertElementsToSVG(
    elements: ExcalidrawElement[],
    options: { width: number; height: number; background: string; exportPadding: number }
  ): Promise<string> {

    const { width, height, background, exportPadding } = options;

    let svgContent = '';

    for (const element of elements) {
      if (element.isDeleted) continue;

      switch (element.type) {
        case 'rectangle':
          svgContent += this.createRectangleSVG(element);
          break;
        case 'ellipse':
          svgContent += this.createEllipseSVG(element);
          break;
        case 'line':
        case 'arrow':
          svgContent += this.createLineSVG(element);
          break;
        case 'text':
          svgContent += this.createTextSVG(element);
          break;
        case 'draw':
          svgContent += this.createDrawSVG(element);
          break;
        default:
          console.warn(`Unsupported element type: ${element.type}`);
      }
    }

    return `
      <svg
        width="${width}"
        height="${height}"
        viewBox="0 0 ${width} ${height}"
        xmlns="http://www.w3.org/2000/svg"
        style="background-color: ${background};"
      >
        <defs>
          <style>
            .excalidraw-text {
              font-family: "Virgil", "Segoe UI Emoji", sans-serif;
              white-space: pre;
            }
          </style>
        </defs>
        ${svgContent}
      </svg>
    `.trim();
  }

  private static createRectangleSVG(element: ExcalidrawElement): string {
    const { x, y, width, height, strokeColor, backgroundColor, strokeWidth, opacity } = element;

    return `
      <rect
        x="${x}"
        y="${y}"
        width="${width}"
        height="${height}"
        stroke="${strokeColor}"
        stroke-width="${strokeWidth}"
        fill="${backgroundColor === 'transparent' ? 'none' : backgroundColor}"
        opacity="${opacity}"
        rx="2"
      />
    `;
  }

  private static createEllipseSVG(element: ExcalidrawElement): string {
    const { x, y, width, height, strokeColor, backgroundColor, strokeWidth, opacity } = element;
    const cx = x + width / 2;
    const cy = y + height / 2;
    const rx = width / 2;
    const ry = height / 2;

    return `
      <ellipse
        cx="${cx}"
        cy="${cy}"
        rx="${rx}"
        ry="${ry}"
        stroke="${strokeColor}"
        stroke-width="${strokeWidth}"
        fill="${backgroundColor === 'transparent' ? 'none' : backgroundColor}"
        opacity="${opacity}"
      />
    `;
  }

  private static createLineSVG(element: ExcalidrawElement): string {
    const { x, y, points = [], strokeColor, strokeWidth, opacity, type } = element;

    if (points.length < 2) return '';

    let pathData = `M ${x + points[0][0]} ${y + points[0][1]}`;

    for (let i = 1; i < points.length; i++) {
      pathData += ` L ${x + points[i][0]} ${y + points[i][1]}`;
    }

    let markerEnd = '';
    if (type === 'arrow' && element.endArrowhead) {
      markerEnd = 'marker-end="url(#arrowhead)"';
    }

    return `
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7"
         refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="${strokeColor}" />
        </marker>
      </defs>
      <path
        d="${pathData}"
        stroke="${strokeColor}"
        stroke-width="${strokeWidth}"
        fill="none"
        opacity="${opacity}"
        ${markerEnd}
      />
    `;
  }

  private static createTextSVG(element: ExcalidrawElement): string {
    const { x, y, text = '', fontSize = 16, strokeColor, opacity } = element;

    return `
      <text
        x="${x}"
        y="${y + fontSize}"
        font-size="${fontSize}"
        fill="${strokeColor}"
        opacity="${opacity}"
        class="excalidraw-text"
      >${text}</text>
    `;
  }

  private static createDrawSVG(element: ExcalidrawElement): string {
    const { x, y, points = [], strokeColor, strokeWidth, opacity } = element;

    if (points.length < 2) return '';

    let pathData = `M ${x + points[0][0]} ${y + points[0][1]}`;

    for (let i = 1; i < points.length; i++) {
      pathData += ` L ${x + points[i][0]} ${y + points[i][1]}`;
    }

    return `
      <path
        d="${pathData}"
        stroke="${strokeColor}"
        stroke-width="${strokeWidth}"
        fill="none"
        opacity="${opacity}"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    `;
  }

  // Validate Excalidraw JSON structure
  static validateScene(scene: any): scene is ExcalidrawScene {
    if (!scene || typeof scene !== 'object') {
      return false;
    }

    if (!Array.isArray(scene.elements)) {
      return false;
    }

    return scene.elements.every((element: any) =>
      element &&
      typeof element.id === 'string' &&
      typeof element.type === 'string' &&
      typeof element.x === 'number' &&
      typeof element.y === 'number'
    );
  }

  // Get bounding box of all elements
  static getBoundingBox(elements: ExcalidrawElement[]): {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
  } {
    if (elements.length === 0) {
      return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    elements.forEach(element => {
      if (element.isDeleted) return;

      minX = Math.min(minX, element.x);
      minY = Math.min(minY, element.y);
      maxX = Math.max(maxX, element.x + element.width);
      maxY = Math.max(maxY, element.y + element.height);
    });

    return {
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - minY
    };
  }
}