import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';

interface RectangleProps {
  width?: number;
  height?: number;
  color?: string;
  strokeColor?: string;
  strokeWidth?: number;
  borderRadius?: number;
  filled?: boolean;
  animated?: boolean;
  animationType?: 'draw' | 'fade' | 'scale' | 'wipe';
  animationDuration?: number;
  startFrame?: number;
  style?: React.CSSProperties;
}

export const Rectangle: React.FC<RectangleProps> = ({
  width = 100,
  height = 60,
  color = '#3498db',
  strokeColor = '#3498db',
  strokeWidth = 3,
  borderRadius = 0,
  filled = false,
  animated = true,
  animationType = 'scale',
  animationDuration = 60,
  startFrame = 0,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const relativeFrame = Math.max(0, frame - startFrame);

  const animationProgress = animated
    ? interpolate(relativeFrame, [0, animationDuration], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1;

  const perimeter = 2 * (width + height);

  const getAnimationProps = () => {
    switch (animationType) {
      case 'draw':
        return {
          strokeDasharray: perimeter,
          strokeDashoffset: perimeter * (1 - animationProgress),
          fill: 'none',
          stroke: strokeColor,
          strokeWidth,
        };
      case 'fade':
        return {
          opacity: animationProgress,
          fill: filled ? color : 'none',
          stroke: strokeColor,
          strokeWidth: filled ? 0 : strokeWidth,
        };
      case 'scale':
        return {
          transform: `scale(${animationProgress})`,
          fill: filled ? color : 'none',
          stroke: strokeColor,
          strokeWidth: filled ? 0 : strokeWidth,
        };
      case 'wipe':
        return {
          fill: filled ? color : 'none',
          stroke: strokeColor,
          strokeWidth: filled ? 0 : strokeWidth,
          clipPath: `inset(0 ${100 - animationProgress * 100}% 0 0)`,
        };
      default:
        return {
          fill: filled ? color : 'none',
          stroke: strokeColor,
          strokeWidth: filled ? 0 : strokeWidth,
        };
    }
  };

  return (
    <div style={{ width, height, ...style }}>
      <svg width={width} height={height}>
        <rect
          x={strokeWidth / 2}
          y={strokeWidth / 2}
          width={width - strokeWidth}
          height={height - strokeWidth}
          rx={borderRadius}
          ry={borderRadius}
          {...getAnimationProps()}
        />
      </svg>
    </div>
  );
};