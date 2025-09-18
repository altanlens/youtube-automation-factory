import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';

interface GradientTextProps {
  text: string;
  gradientColors?: string[];
  fontSize?: number;
  fontWeight?: string | number;
  animated?: boolean;
  animationSpeed?: number;
  style?: React.CSSProperties;
}

export const GradientText: React.FC<GradientTextProps> = ({
  text,
  gradientColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'],
  fontSize = 64,
  fontWeight = 'bold',
  animated = true,
  animationSpeed = 2,
  style = {},
}) => {
  const frame = useCurrentFrame();

  const gradientAngle = animated
    ? interpolate(frame, [0, 120 / animationSpeed], [0, 360], {
        extrapolateRight: 'extend',
      })
    : 45;

  const gradientString = `linear-gradient(${gradientAngle}deg, ${gradientColors.join(', ')})`;

  return (
    <div
      style={{
        fontSize,
        fontWeight,
        fontFamily: 'Arial, sans-serif',
        background: gradientString,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        textAlign: 'center',
        ...style,
      }}
    >
      {text}
    </div>
  );
};