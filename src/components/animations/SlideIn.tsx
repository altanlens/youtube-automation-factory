import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';

type SlideDirection = 'left' | 'right' | 'top' | 'bottom';

interface SlideInProps {
  children: React.ReactNode;
  direction?: SlideDirection;
  delay?: number;
  duration?: number;
  distance?: number;
  style?: React.CSSProperties;
}

export const SlideIn: React.FC<SlideInProps> = ({
  children,
  direction = 'left',
  delay = 0,
  duration = 30,
  distance = 100,
  style = {},
}) => {
  const frame = useCurrentFrame();

  const getPositionByDirection = () => {
    switch (direction) {
      case 'left':
        return {x: -distance, y: 0};
      case 'right':
        return {x: distance, y: 0};
      case 'top':
        return {x: 0, y: -distance};
      case 'bottom':
        return {x: 0, y: distance};
      default:
        return {x: 0, y: 0};
    }
  };

  const startPosition = getPositionByDirection();

  const x = interpolate(
    frame - delay,
    [0, duration],
    [startPosition.x, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  const y = interpolate(
    frame - delay,
    [0, duration],
    [startPosition.y, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  const opacity = interpolate(
    frame - delay,
    [0, duration * 0.8],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  return (
    <div
      style={{
        ...style,
        transform: `translate(${x}px, ${y}px)`,
        opacity,
      }}
    >
      {children}
    </div>
  );
};
