import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';

interface RotateProps {
  children: React.ReactNode;
  startFrame?: number;
  duration?: number;
  from?: number;
  to?: number;
  continuous?: boolean;
  speed?: number;
  style?: React.CSSProperties;
}

export const Rotate: React.FC<RotateProps> = ({
  children,
  startFrame = 0,
  duration = 60,
  from = 0,
  to = 360,
  continuous = false,
  speed = 1,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const relativeFrame = Math.max(0, frame - startFrame);

  const rotation = continuous
    ? (relativeFrame * speed) % 360
    : interpolate(relativeFrame, [0, duration], [from, to], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });

  return (
    <div
      style={{
        transform: `rotate(${rotation}deg)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};