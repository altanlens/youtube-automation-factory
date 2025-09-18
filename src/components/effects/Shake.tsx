import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';

interface ShakeProps {
  children: React.ReactNode;
  startFrame?: number;
  duration?: number;
  intensity?: number;
  frequency?: number;
  direction?: 'horizontal' | 'vertical' | 'both';
  style?: React.CSSProperties;
}

export const Shake: React.FC<ShakeProps> = ({
  children,
  startFrame = 0,
  duration = 30,
  intensity = 5,
  frequency = 10,
  direction = 'horizontal',
  style = {},
}) => {
  const frame = useCurrentFrame();
  const relativeFrame = Math.max(0, frame - startFrame);

  const isActive = relativeFrame >= 0 && relativeFrame <= duration;

  if (!isActive) {
    return <div style={style}>{children}</div>;
  }

  const shakeProgress = interpolate(relativeFrame, [0, duration], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const shakeX = direction === 'horizontal' || direction === 'both'
    ? Math.sin(relativeFrame * frequency) * intensity * shakeProgress
    : 0;

  const shakeY = direction === 'vertical' || direction === 'both'
    ? Math.cos(relativeFrame * frequency) * intensity * shakeProgress
    : 0;

  return (
    <div
      style={{
        transform: `translate(${shakeX}px, ${shakeY}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};