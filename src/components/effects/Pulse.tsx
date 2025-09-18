import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';

interface PulseProps {
  children: React.ReactNode;
  speed?: number;
  minScale?: number;
  maxScale?: number;
  startFrame?: number;
  style?: React.CSSProperties;
}

export const Pulse: React.FC<PulseProps> = ({
  children,
  speed = 1,
  minScale = 0.9,
  maxScale = 1.1,
  startFrame = 0,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const relativeFrame = Math.max(0, frame - startFrame);

  const pulseScale = interpolate(
    Math.sin(relativeFrame * 0.1 * speed),
    [-1, 1],
    [minScale, maxScale]
  );

  return (
    <div
      style={{
        transform: `scale(${pulseScale})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};