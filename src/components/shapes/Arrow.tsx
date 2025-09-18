import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';

interface ArrowProps {
  direction?: 'up' | 'down' | 'left' | 'right';
  size?: number;
  color?: string;
  strokeWidth?: number;
  animated?: boolean;
  animationType?: 'draw' | 'fade' | 'scale';
  animationDuration?: number;
  startFrame?: number;
  style?: React.CSSProperties;
}

export const Arrow: React.FC<ArrowProps> = ({
  direction = 'right',
  size = 50,
  color = '#333',
  strokeWidth = 3,
  animated = true,
  animationType = 'draw',
  animationDuration = 60,
  startFrame = 0,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const relativeFrame = Math.max(0, frame - startFrame);

  const animationProgress = animated
    ? interpolate(relativeFrame, [0, animationDuration], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1;

  const getArrowPath = () => {
    const half = size / 2;
    const quarter = size / 4;

    switch (direction) {
      case 'up':
        return `M ${half} ${quarter} L ${quarter} ${half + quarter} M ${half} ${quarter} L ${half + quarter} ${half + quarter}`;
      case 'down':
        return `M ${half} ${half + quarter} L ${quarter} ${quarter} M ${half} ${half + quarter} L ${half + quarter} ${quarter}`;
      case 'left':
        return `M ${quarter} ${half} L ${half + quarter} ${quarter} M ${quarter} ${half} L ${half + quarter} ${half + quarter}`;
      case 'right':
        return `M ${half + quarter} ${half} L ${quarter} ${quarter} M ${half + quarter} ${half} L ${quarter} ${half + quarter}`;
      default:
        return `M ${half + quarter} ${half} L ${quarter} ${quarter} M ${half + quarter} ${half} L ${quarter} ${half + quarter}`;
    }
  };

  const getAnimationProps = () => {
    switch (animationType) {
      case 'draw':
        return {
          strokeDasharray: size * 2,
          strokeDashoffset: size * 2 * (1 - animationProgress),
        };
      case 'fade':
        return {
          opacity: animationProgress,
        };
      case 'scale':
        return {
          transform: `scale(${animationProgress})`,
        };
      default:
        return {};
    }
  };

  return (
    <div style={{ width: size, height: size, ...style }}>
      <svg width={size} height={size}>
        <path
          d={getArrowPath()}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          {...getAnimationProps()}
        />
      </svg>
    </div>
  );
};