import React from 'react';
import {useCurrentFrame, interpolate, spring} from 'remotion';

interface AnimatedTitleProps {
  text: string;
  startFrame?: number;
  animationType?: 'slide' | 'fade' | 'scale' | 'bounce' | 'typewriter';
  direction?: 'left' | 'right' | 'top' | 'bottom';
  style?: React.CSSProperties;
  fontSize?: number;
  color?: string;
  fontWeight?: string | number;
  duration?: number;
}

export const AnimatedTitle: React.FC<AnimatedTitleProps> = ({
  text,
  startFrame = 0,
  animationType = 'slide',
  direction = 'left',
  style = {},
  fontSize = 48,
  color = 'white',
  fontWeight = 'bold',
  duration = 60,
}) => {
  const frame = useCurrentFrame();
  const relativeFrame = Math.max(0, frame - startFrame);

  const getAnimationValue = () => {
    switch (animationType) {
      case 'slide':
        const slideDistance = direction === 'left' || direction === 'right' ? 100 : 50;
        const x = direction === 'left' ? -slideDistance : direction === 'right' ? slideDistance : 0;
        const y = direction === 'top' ? -slideDistance : direction === 'bottom' ? slideDistance : 0;

        const translateX = interpolate(relativeFrame, [0, duration], [x, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const translateY = interpolate(relativeFrame, [0, duration], [y, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        return {
          transform: `translate(${translateX}px, ${translateY}px)`,
          opacity: interpolate(relativeFrame, [0, duration * 0.3], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        };

      case 'fade':
        return {
          opacity: interpolate(relativeFrame, [0, duration], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        };

      case 'scale':
        const scale = interpolate(relativeFrame, [0, duration], [0.5, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        return {
          transform: `scale(${scale})`,
          opacity: interpolate(relativeFrame, [0, duration * 0.3], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        };

      case 'bounce':
        const springValue = spring({
          frame: relativeFrame,
          from: 0,
          to: 1,
          fps: 30,
          config: {
            damping: 10,
            stiffness: 100,
            mass: 0.5,
          },
        });
        return {
          transform: `scale(${springValue})`,
          opacity: interpolate(relativeFrame, [0, 15], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        };

      case 'typewriter':
        const charactersToShow = Math.floor(
          interpolate(relativeFrame, [0, duration], [0, text.length], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
        );
        return {
          opacity: 1,
          content: text.substring(0, charactersToShow),
        };

      default:
        return { opacity: 1 };
    }
  };

  const animationProps = getAnimationValue();
  const displayText = animationType === 'typewriter' ? animationProps.content || '' : text;

  return (
    <div
      style={{
        fontSize,
        color,
        fontWeight,
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center',
        ...style,
        ...animationProps,
      }}
    >
      {displayText}
    </div>
  );
};