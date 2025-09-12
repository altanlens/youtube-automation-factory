import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  from?: number;
  to?: number;
  style?: React.CSSProperties;
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  delay = 0,
  duration = 30,
  from = 0,
  to = 1,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame - delay,
    [0, duration],
    [from, to],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  return (
    <div style={{...style, opacity}}>
      {children}
    </div>
  );
};
