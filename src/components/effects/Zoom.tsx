import React from 'react';
import {useCurrentFrame, interpolate, spring} from 'remotion';

interface ZoomProps {
  children: React.ReactNode;
  startFrame?: number;
  duration?: number;
  from?: number;
  to?: number;
  springConfig?: {
    damping?: number;
    stiffness?: number;
    mass?: number;
  };
  useSpring?: boolean;
  style?: React.CSSProperties;
}

export const Zoom: React.FC<ZoomProps> = ({
  children,
  startFrame = 0,
  duration = 60,
  from = 0,
  to = 1,
  springConfig = {
    damping: 10,
    stiffness: 100,
    mass: 0.5,
  },
  useSpring = false,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const relativeFrame = Math.max(0, frame - startFrame);

  const scale = useSpring
    ? spring({
        frame: relativeFrame,
        from,
        to,
        fps: 30,
        config: springConfig,
      })
    : interpolate(relativeFrame, [0, duration], [from, to], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });

  return (
    <div
      style={{
        transform: `scale(${scale})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};