import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';

interface CardProps {
  children: React.ReactNode;
  width?: number;
  height?: number;
  backgroundColor?: string;
  borderRadius?: number;
  shadow?: boolean;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffset?: { x: number; y: number };
  animated?: boolean;
  animationType?: 'fade' | 'slide' | 'scale';
  animationDuration?: number;
  startFrame?: number;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({
  children,
  width = 300,
  height = 200,
  backgroundColor = 'white',
  borderRadius = 12,
  shadow = true,
  shadowColor = 'rgba(0, 0, 0, 0.1)',
  shadowBlur = 20,
  shadowOffset = { x: 0, y: 4 },
  animated = true,
  animationType = 'fade',
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

  const getAnimationStyle = () => {
    switch (animationType) {
      case 'fade':
        return {
          opacity: animationProgress,
        };
      case 'slide':
        return {
          opacity: animationProgress,
          transform: `translateY(${30 * (1 - animationProgress)}px)`,
        };
      case 'scale':
        return {
          opacity: animationProgress,
          transform: `scale(${0.8 + 0.2 * animationProgress})`,
        };
      default:
        return { opacity: animationProgress };
    }
  };

  const boxShadow = shadow
    ? `${shadowOffset.x}px ${shadowOffset.y}px ${shadowBlur}px ${shadowColor}`
    : 'none';

  return (
    <div
      style={{
        width,
        height,
        backgroundColor,
        borderRadius,
        boxShadow,
        padding: 20,
        ...getAnimationStyle(),
        ...style,
      }}
    >
      {children}
    </div>
  );
};