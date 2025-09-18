import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';

interface CircleProps {
  size?: number;
  color?: string;
  strokeColor?: string;
  strokeWidth?: number;
  filled?: boolean;
  animated?: boolean;
  animationType?: 'draw' | 'fade' | 'scale' | 'fill';
  animationDuration?: number;
  startFrame?: number;
  style?: React.CSSProperties;
}

export const Circle: React.FC<CircleProps> = ({
  size = 100,
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

  const radius = size / 2;
  const circumference = 2 * Math.PI * radius;

  const getAnimationProps = () => {
    switch (animationType) {
      case 'draw':
        return {
          strokeDasharray: circumference,
          strokeDashoffset: circumference * (1 - animationProgress),
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
      case 'fill':
        const fillRadius = radius * animationProgress;
        return {
          fill: color,
          stroke: strokeColor,
          strokeWidth: filled ? 0 : strokeWidth,
          r: fillRadius,
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
        <circle
          cx={radius}
          cy={radius}
          r={animationType === 'fill' ? undefined : radius}
          {...getAnimationProps()}
        />
      </svg>
    </div>
  );
};