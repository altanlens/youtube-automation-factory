import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';

interface TriangleProps {
  size?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  color?: string;
  strokeColor?: string;
  strokeWidth?: number;
  filled?: boolean;
  animated?: boolean;
  animationType?: 'draw' | 'fade' | 'scale';
  animationDuration?: number;
  startFrame?: number;
  style?: React.CSSProperties;
}

export const Triangle: React.FC<TriangleProps> = ({
  size = 100,
  direction = 'up',
  color = '#3498db',
  strokeColor = '#3498db',
  strokeWidth = 3,
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

  const getTrianglePath = () => {
    const half = size / 2;

    switch (direction) {
      case 'up':
        return `M ${half} 10 L 10 ${size - 10} L ${size - 10} ${size - 10} Z`;
      case 'down':
        return `M ${half} ${size - 10} L 10 10 L ${size - 10} 10 Z`;
      case 'left':
        return `M 10 ${half} L ${size - 10} 10 L ${size - 10} ${size - 10} Z`;
      case 'right':
        return `M ${size - 10} ${half} L 10 10 L 10 ${size - 10} Z`;
      default:
        return `M ${half} 10 L 10 ${size - 10} L ${size - 10} ${size - 10} Z`;
    }
  };

  const perimeter = size * 3; // Approximate perimeter

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
      default:
        return {
          fill: filled ? color : 'none',
          stroke: strokeColor,
          strokeWidth: filled ? 0 : strokeWidth,
        };
    }
  };

  return (
    <div style={{ width: size, height: size, ...style }}>
      <svg width={size} height={size}>
        <path
          d={getTrianglePath()}
          {...getAnimationProps()}
        />
      </svg>
    </div>
  );
};