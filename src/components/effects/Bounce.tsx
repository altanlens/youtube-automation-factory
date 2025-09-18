import React from 'react';
import {useCurrentFrame, spring} from 'remotion';

interface BounceProps {
  children: React.ReactNode;
  startFrame?: number;
  intensity?: number;
  duration?: number;
  direction?: 'vertical' | 'horizontal' | 'both';
  style?: React.CSSProperties;
}

export const Bounce: React.FC<BounceProps> = ({
  children,
  startFrame = 0,
  intensity = 30,
  duration = 60,
  direction = 'vertical',
  style = {},
}) => {
  const frame = useCurrentFrame();
  const relativeFrame = Math.max(0, frame - startFrame);

  const springValue = spring({
    frame: relativeFrame,
    from: 0,
    to: 1,
    fps: 30,
    config: {
      damping: 8,
      stiffness: 120,
      mass: 0.8,
    },
  });

  const bounceEffect = (1 - springValue) * intensity;

  const getTransform = () => {
    switch (direction) {
      case 'vertical':
        return `translateY(${bounceEffect}px)`;
      case 'horizontal':
        return `translateX(${bounceEffect}px)`;
      case 'both':
        return `translate(${bounceEffect}px, ${bounceEffect}px)`;
      default:
        return `translateY(${bounceEffect}px)`;
    }
  };

  return (
    <div
      style={{
        transform: getTransform(),
        ...style,
      }}
    >
      {children}
    </div>
  );
};