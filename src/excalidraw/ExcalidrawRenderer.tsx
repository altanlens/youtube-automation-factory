import React, { useEffect, useState, useMemo } from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';
import { ExcalidrawElement, ExcalidrawScene } from './types';
import { ExcalidrawParser } from './parser';
import { RoughRenderer, RoughStyleOptions, RoughStylePresets } from './roughRenderer';

export interface ExcalidrawRendererProps {
  scene?: ExcalidrawScene;
  animated?: boolean;
  animationType?: 'progressive-draw' | 'fade-in' | 'slide-in' | 'none';
  animationSpeed?: 'slow' | 'normal' | 'fast';
  startFrame?: number;
  duration?: number;
  width?: number;
  height?: number;
  useRoughStyle?: boolean;
  roughStylePreset?: keyof typeof RoughStylePresets;
  customRoughStyle?: RoughStyleOptions;
  style?: React.CSSProperties;
}

export const ExcalidrawRenderer: React.FC<ExcalidrawRendererProps> = ({
  scene,
  animated = true,
  animationType = 'progressive-draw',
  animationSpeed = 'normal',
  startFrame = 0,
  duration = 120,
  width = 800,
  height = 600,
  useRoughStyle = true,
  roughStylePreset = 'handDrawn',
  customRoughStyle = {},
  style = {},
}) => {
  const frame = useCurrentFrame();
  const [svgContent, setSvgContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false); // FIXED: Start with false to prevent loading text

  // Return early if no scene provided
  if (!scene) {
    console.log('ExcalidrawRenderer: No scene data provided');
    return (
      <AbsoluteFill style={{ backgroundColor: '#f0f0f0', ...style }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <p>No scene data provided</p>
        </div>
      </AbsoluteFill>
    );
  }

  console.log('ExcalidrawRenderer: Scene received', {
    elements: scene.elements?.length || 0,
    frame,
    animated,
    useRoughStyle
  });

  const relativeFrame = Math.max(0, frame - startFrame);

  // FIXED: Calculate dynamic camera bounds for full-screen composition
  const calculateSceneTransform = useMemo(() => {
    if (!scene?.elements || scene.elements.length === 0) {
      return { scale: 1, translateX: 0, translateY: 0 };
    }

    // Calculate bounding box of all elements
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    scene.elements.forEach(element => {
      if (!element.isDeleted) {
        const elementMaxX = element.x + (element.width || 0);
        const elementMaxY = element.y + (element.height || 0);

        minX = Math.min(minX, element.x);
        minY = Math.min(minY, element.y);
        maxX = Math.max(maxX, elementMaxX);
        maxY = Math.max(maxY, elementMaxY);
      }
    });

    // Add padding to the content
    const padding = 100;
    const contentWidth = maxX - minX + padding * 2;
    const contentHeight = maxY - minY + padding * 2;

    // Calculate scale to fit content into video dimensions
    const scaleX = width / contentWidth;
    const scaleY = height / contentHeight;
    const scale = Math.min(scaleX, scaleY, 2); // Max scale of 2x

    // Calculate translation to center content
    const scaledContentWidth = contentWidth * scale;
    const scaledContentHeight = contentHeight * scale;
    const translateX = (width - scaledContentWidth) / 2 - (minX - padding) * scale;
    const translateY = (height - scaledContentHeight) / 2 - (minY - padding) * scale;

    return { scale, translateX, translateY };
  }, [scene, width, height]);

  // Animation timing based on speed
  const animationDuration = useMemo(() => {
    const speedMap = {
      slow: duration * 1.5,
      normal: duration,
      fast: duration * 0.5,
    };
    return speedMap[animationSpeed];
  }, [duration, animationSpeed]);

  // Generate SVG from Excalidraw scene
  useEffect(() => {
    const generateSVG = async () => {
      try {
        setIsLoading(true);

        if (!ExcalidrawParser.validateScene(scene)) {
          throw new Error('Invalid Excalidraw scene format');
        }

        let elementsToRender = scene.elements;

        // FIXED: Progressive draw animation with better timing
        if (animated && animationType === 'progressive-draw') {
          const progress = interpolate(
            relativeFrame,
            [0, animationDuration],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );

          // IMPROVED: More gradual element appearance with smoother timing
          const elementCount = scene.elements.length;
          const visibleElementCount = Math.ceil(progress * elementCount);
          elementsToRender = scene.elements.slice(0, Math.max(1, visibleElementCount));

          // Add opacity animation for the currently drawing element
          if (visibleElementCount < elementCount && visibleElementCount > 0) {
            const currentElementProgress = (progress * elementCount) % 1;
            const currentElement = elementsToRender[visibleElementCount - 1];
            if (currentElement) {
              currentElement.opacity = currentElementProgress;
            }
          }
        }

        const sceneToRender: ExcalidrawScene = {
          ...scene,
          elements: elementsToRender,
        };

        let svg: string;

        if (useRoughStyle) {
          // Use Rough.js for hand-drawn style
          const roughStyle = {
            ...RoughStylePresets[roughStylePreset],
            ...customRoughStyle,
          };

          svg = await RoughRenderer.renderToSVG(sceneToRender.elements, {
            width,
            height,
            background: scene.appState?.viewBackgroundColor || 'transparent',
            roughStyle,
          });
        } else {
          // Use clean SVG parser
          svg = await ExcalidrawParser.parseToSVG(sceneToRender, {
            width,
            height,
            background: scene.appState?.viewBackgroundColor || 'transparent',
          });
        }

        setSvgContent(svg);
        setIsLoading(false); // FIXED: Explicitly set loading to false on success
      } catch (error) {
        console.error('Error generating SVG:', error);
        setSvgContent(`
          <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <text x="50%" y="50%" text-anchor="middle" fill="red" font-size="16">
              Error rendering Excalidraw scene
            </text>
          </svg>
        `);
        setIsLoading(false); // FIXED: Set loading to false on error too
      }
    };

    generateSVG();
  }, [scene, animated, animationType, relativeFrame, animationDuration, width, height, useRoughStyle, roughStylePreset, customRoughStyle]);

  // Animation progress for non-progressive animations
  const animationProgress = animated
    ? interpolate(
        relativeFrame,
        [0, animationDuration],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      )
    : 1;

  // Apply animation styles
  const getAnimationStyle = (): React.CSSProperties => {
    if (!animated || animationType === 'progressive-draw') {
      return {};
    }

    switch (animationType) {
      case 'fade-in':
        return {
          opacity: animationProgress,
        };
      case 'slide-in':
        return {
          opacity: animationProgress,
          transform: `translateY(${30 * (1 - animationProgress)}px)`,
        };
      default:
        return {};
    }
  };

  // FIXED: Remove loading state completely - render immediately
  // Loading is handled internally, no need to show loading text

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        ...getAnimationStyle(),
        ...style,
      }}
    >
      <div
        style={{
          width,
          height,
          position: 'relative',
          transform: `translate(${calculateSceneTransform.translateX}px, ${calculateSceneTransform.translateY}px) scale(${calculateSceneTransform.scale})`,
          transformOrigin: '0 0',
        }}
        dangerouslySetInnerHTML={{
          __html: svgContent,
        }}
      />
    </AbsoluteFill>
  );
};

// Helper component for simple text-based scenes
export const ExcalidrawTextScene: React.FC<{
  title: string;
  elements: ExcalidrawElement[];
  animated?: boolean;
  style?: React.CSSProperties;
}> = ({
  title,
  elements,
  animated = true,
  style = {},
}) => {
  const scene: ExcalidrawScene = {
    elements,
    appState: {
      viewBackgroundColor: 'white',
    },
  };

  return (
    <div style={{ textAlign: 'center', ...style }}>
      <h2 style={{ marginBottom: 20, color: '#333' }}>{title}</h2>
      <ExcalidrawRenderer
        scene={scene}
        animated={animated}
        animationType="progressive-draw"
        width={600}
        height={400}
      />
    </div>
  );
};

// Quick builder for common shapes
export const ExcalidrawShapes = {
  rectangle: (x: number, y: number, width: number, height: number, options: Partial<ExcalidrawElement> = {}): ExcalidrawElement => ({
    id: `rect_${Math.random().toString(36).substr(2, 9)}`,
    type: 'rectangle',
    x,
    y,
    width,
    height,
    angle: 0,
    strokeColor: '#000000',
    backgroundColor: 'transparent',
    fillStyle: 'hachure',
    strokeWidth: 2,
    strokeStyle: 'solid',
    roughness: 1,
    opacity: 1,
    seed: Math.floor(Math.random() * 1000000),
    versionNonce: Math.floor(Math.random() * 1000000),
    isDeleted: false,
    ...options,
  }),

  circle: (x: number, y: number, radius: number, options: Partial<ExcalidrawElement> = {}): ExcalidrawElement => ({
    id: `circle_${Math.random().toString(36).substr(2, 9)}`,
    type: 'ellipse',
    x: x - radius,
    y: y - radius,
    width: radius * 2,
    height: radius * 2,
    angle: 0,
    strokeColor: '#000000',
    backgroundColor: 'transparent',
    fillStyle: 'hachure',
    strokeWidth: 2,
    strokeStyle: 'solid',
    roughness: 1,
    opacity: 1,
    seed: Math.floor(Math.random() * 1000000),
    versionNonce: Math.floor(Math.random() * 1000000),
    isDeleted: false,
    ...options,
  }),

  text: (x: number, y: number, text: string, options: Partial<ExcalidrawElement> = {}): ExcalidrawElement => ({
    id: `text_${Math.random().toString(36).substr(2, 9)}`,
    type: 'text',
    x,
    y,
    width: text.length * 10, // Approximate width
    height: 20,
    angle: 0,
    strokeColor: '#000000',
    backgroundColor: 'transparent',
    fillStyle: 'hachure',
    strokeWidth: 1,
    strokeStyle: 'solid',
    roughness: 1,
    opacity: 1,
    seed: Math.floor(Math.random() * 1000000),
    versionNonce: Math.floor(Math.random() * 1000000),
    isDeleted: false,
    text,
    fontSize: 16,
    fontFamily: 1,
    textAlign: 'left',
    verticalAlign: 'top',
    ...options,
  }),
};