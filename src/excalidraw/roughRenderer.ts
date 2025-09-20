import rough from 'roughjs';
import { ExcalidrawElement } from './types';

export interface RoughStyleOptions {
  roughness?: number;
  bowing?: number;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  fillStyle?: 'hachure' | 'solid' | 'zigzag' | 'cross-hatch' | 'dots' | 'dashed' | 'zigzag-line';
  fillWeight?: number;
  hachureAngle?: number;
  hachureGap?: number;
  strokeLineDash?: number[];
  simplification?: number;
  preserveVertices?: boolean;
}

export class RoughRenderer {
  private canvas: HTMLCanvasElement;
  private roughCanvas: any;

  constructor(width: number = 800, height: number = 600) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.roughCanvas = rough.canvas(this.canvas);
  }

  // Convert Excalidraw elements to hand-drawn SVG using Rough.js
  static async renderToSVG(
    elements: ExcalidrawElement[],
    options: {
      width?: number;
      height?: number;
      background?: string;
      roughStyle?: RoughStyleOptions;
    } = {}
  ): Promise<string> {
    const {
      width = 800,
      height = 600,
      background = 'transparent',
      roughStyle = {}
    } = options;

    // Create SVG element
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width.toString());
    svg.setAttribute('height', height.toString());
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    if (background !== 'transparent') {
      const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bgRect.setAttribute('width', '100%');
      bgRect.setAttribute('height', '100%');
      bgRect.setAttribute('fill', background);
      svg.appendChild(bgRect);
    }

    const roughSvg = rough.svg(svg);

    // Render each element with hand-drawn style
    for (const element of elements) {
      if (element.isDeleted) continue;

      // FIXED: Use consistent seed based on element ID to prevent jittering
      const consistentSeed = element.seed || this.generateSeedFromId(element.id);

      const elementStyle: RoughStyleOptions = {
        roughness: element.roughness || 1,
        stroke: element.strokeColor,
        strokeWidth: element.strokeWidth,
        fill: element.backgroundColor === 'transparent' ? undefined : element.backgroundColor,
        fillStyle: element.fillStyle || 'hachure',
        seed: consistentSeed, // FIXED: Consistent seed prevents jittering
        ...roughStyle,
      };

      try {
        const roughElement = this.createRoughElement(roughSvg, element, elementStyle);
        if (roughElement) {
          svg.appendChild(roughElement);
        }
      } catch (error) {
        console.warn(`Failed to render element ${element.id}:`, error);
        // Fallback to simple SVG element
        const fallback = this.createFallbackElement(element);
        if (fallback) {
          svg.appendChild(fallback);
        }
      }
    }

    return svg.outerHTML;
  }

  private static createRoughElement(
    roughSvg: any,
    element: ExcalidrawElement,
    style: RoughStyleOptions
  ): SVGElement | null {
    switch (element.type) {
      case 'rectangle':
        return roughSvg.rectangle(
          element.x,
          element.y,
          element.width,
          element.height,
          style
        );

      case 'ellipse':
        return roughSvg.ellipse(
          element.x + element.width / 2,
          element.y + element.height / 2,
          element.width,
          element.height,
          style
        );

      case 'line':
      case 'arrow':
        if (element.points && element.points.length >= 2) {
          const startX = element.x + element.points[0][0];
          const startY = element.y + element.points[0][1];
          const endX = element.x + element.points[element.points.length - 1][0];
          const endY = element.y + element.points[element.points.length - 1][1];

          const lineElement = roughSvg.line(startX, startY, endX, endY, style);

          // Add arrowhead for arrow type
          if (element.type === 'arrow' && element.endArrowhead) {
            const arrowhead = this.createArrowhead(endX, endY, startX, startY, style);
            if (arrowhead) {
              const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
              g.appendChild(lineElement);
              g.appendChild(arrowhead);
              return g;
            }
          }

          return lineElement;
        }
        break;

      case 'draw':
        if (element.points && element.points.length >= 2) {
          const points = element.points.map(([x, y]) => [element.x + x, element.y + y]);
          return roughSvg.linearPath(points, style);
        }
        break;

      case 'text':
        // Rough.js doesn't handle text, so we create regular SVG text
        return this.createTextElement(element);

      default:
        console.warn(`Unsupported element type: ${element.type}`);
    }

    return null;
  }

  private static createArrowhead(
    x: number,
    y: number,
    fromX: number,
    fromY: number,
    style: RoughStyleOptions
  ): SVGElement | null {
    const angle = Math.atan2(y - fromY, x - fromX);
    const arrowLength = 10;
    const arrowAngle = Math.PI / 6;

    const x1 = x - arrowLength * Math.cos(angle - arrowAngle);
    const y1 = y - arrowLength * Math.sin(angle - arrowAngle);
    const x2 = x - arrowLength * Math.cos(angle + arrowAngle);
    const y2 = y - arrowLength * Math.sin(angle + arrowAngle);

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M ${x1} ${y1} L ${x} ${y} L ${x2} ${y2}`);
    path.setAttribute('stroke', style.stroke || '#000');
    path.setAttribute('stroke-width', (style.strokeWidth || 2).toString());
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');

    return path;
  }

  private static createTextElement(element: ExcalidrawElement): SVGElement {
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', element.x.toString());
    text.setAttribute('y', (element.y + (element.fontSize || 16)).toString());
    text.setAttribute('font-size', (element.fontSize || 16).toString());
    text.setAttribute('font-family', '"Virgil", "Segoe UI Emoji", sans-serif');
    text.setAttribute('fill', element.strokeColor);
    text.setAttribute('opacity', element.opacity.toString());

    if (element.textAlign) {
      text.setAttribute('text-anchor', element.textAlign === 'center' ? 'middle' : element.textAlign);
    }

    text.textContent = element.text || '';
    return text;
  }

  private static createFallbackElement(element: ExcalidrawElement): SVGElement | null {
    switch (element.type) {
      case 'rectangle':
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', element.x.toString());
        rect.setAttribute('y', element.y.toString());
        rect.setAttribute('width', element.width.toString());
        rect.setAttribute('height', element.height.toString());
        rect.setAttribute('stroke', element.strokeColor);
        rect.setAttribute('stroke-width', element.strokeWidth.toString());
        rect.setAttribute('fill', element.backgroundColor === 'transparent' ? 'none' : element.backgroundColor);
        rect.setAttribute('opacity', element.opacity.toString());
        return rect;

      case 'ellipse':
        const ellipse = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        ellipse.setAttribute('cx', (element.x + element.width / 2).toString());
        ellipse.setAttribute('cy', (element.y + element.height / 2).toString());
        ellipse.setAttribute('rx', (element.width / 2).toString());
        ellipse.setAttribute('ry', (element.height / 2).toString());
        ellipse.setAttribute('stroke', element.strokeColor);
        ellipse.setAttribute('stroke-width', element.strokeWidth.toString());
        ellipse.setAttribute('fill', element.backgroundColor === 'transparent' ? 'none' : element.backgroundColor);
        ellipse.setAttribute('opacity', element.opacity.toString());
        return ellipse;

      case 'text':
        return this.createTextElement(element);

      default:
        return null;
    }
  }

  // FIXED: Generate consistent seed from element ID to prevent jittering
  private static generateSeedFromId(id: string): number {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      const char = id.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) % 1000000; // Return positive number under 1M
  }

  // Get canvas for manual rendering
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  // Clear canvas
  clear(): void {
    const ctx = this.canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  // Convert canvas to data URL
  toDataURL(format: string = 'image/png'): string {
    return this.canvas.toDataURL(format);
  }
}

// Utility function to create rough style presets
export const RoughStylePresets = {
  handDrawn: {
    roughness: 2,
    bowing: 1,
    strokeWidth: 2,
    fillStyle: 'hachure' as const,
    hachureGap: 8,
  },

  sketchy: {
    roughness: 3,
    bowing: 2,
    strokeWidth: 1.5,
    fillStyle: 'cross-hatch' as const,
    hachureGap: 6,
  },

  clean: {
    roughness: 0.5,
    bowing: 0.5,
    strokeWidth: 2,
    fillStyle: 'solid' as const,
  },

  artistic: {
    roughness: 2.5,
    bowing: 1.5,
    strokeWidth: 3,
    fillStyle: 'zigzag' as const,
    hachureGap: 10,
  },

  technical: {
    roughness: 1,
    bowing: 0.5,
    strokeWidth: 1,
    fillStyle: 'dots' as const,
    hachureGap: 4,
  },
};