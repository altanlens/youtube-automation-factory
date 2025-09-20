import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';

interface StrokeTextProps {
  text: string;
  strokeWidth?: number;
  strokeColor?: string;
  fillColor?: string;
  fontSize?: number;
  fontWeight?: string | number;
  animated?: boolean;
  style?: React.CSSProperties;
}

export const StrokeText: React.FC<StrokeTextProps> = ({
  text,
  strokeWidth = 2,
  strokeColor = '#000',
  fillColor = 'transparent',
  fontSize = 64,
  fontWeight = 'bold',
  animated = false,
  style = {},
}) => {
  const frame = useCurrentFrame();

  const animatedStrokeWidth = animated
    ? interpolate(frame, [0, 30, 60], [0, strokeWidth * 2, strokeWidth], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : strokeWidth;

  return (
    <div
      style={{
        fontSize,
        fontWeight,
        fontFamily: 'Arial, sans-serif',
        color: fillColor,
        WebkitTextStroke: `${animatedStrokeWidth}px ${strokeColor}`,
        textAlign: 'center',
        ...style,
      }}
    >
      {text}
    </div>
  );
};