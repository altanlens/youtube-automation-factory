import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';

interface CountingNumberProps {
  to: number;
  from?: number;
  duration?: number;
  startFrame?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  style?: React.CSSProperties;
  fontSize?: number;
  color?: string;
  fontWeight?: string | number;
}

export const CountingNumber: React.FC<CountingNumberProps> = ({
  to,
  from = 0,
  duration = 60,
  startFrame = 0,
  prefix = '',
  suffix = '',
  decimals = 0,
  style = {},
  fontSize = 48,
  color = 'white',
  fontWeight = 'bold',
}) => {
  const frame = useCurrentFrame();
  const relativeFrame = Math.max(0, frame - startFrame);

  const currentValue = interpolate(
    relativeFrame,
    [0, duration],
    [from, to],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  const formattedValue = decimals > 0
    ? currentValue.toFixed(decimals)
    : Math.round(currentValue).toLocaleString();

  return (
    <div
      style={{
        fontSize,
        color,
        fontWeight,
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center',
        ...style,
      }}
    >
      {prefix}{formattedValue}{suffix}
    </div>
  );
};