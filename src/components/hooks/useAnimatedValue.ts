import {useCurrentFrame, interpolate, spring} from 'remotion';

interface AnimationConfig {
  from: number;
  to: number;
  startFrame?: number;
  duration?: number;
  type?: 'linear' | 'spring' | 'ease-in' | 'ease-out' | 'ease-in-out';
  springConfig?: {
    damping?: number;
    stiffness?: number;
    mass?: number;
  };
}

export const useAnimatedValue = (config: AnimationConfig): number => {
  const frame = useCurrentFrame();
  const {
    from,
    to,
    startFrame = 0,
    duration = 60,
    type = 'linear',
    springConfig = { damping: 10, stiffness: 100, mass: 0.5 },
  } = config;

  const relativeFrame = Math.max(0, frame - startFrame);

  switch (type) {
    case 'spring':
      return spring({
        frame: relativeFrame,
        from,
        to,
        fps: 30,
        config: springConfig,
      });

    case 'ease-in':
      return interpolate(relativeFrame, [0, duration], [from, to], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: (t: number) => t * t,
      });

    case 'ease-out':
      return interpolate(relativeFrame, [0, duration], [from, to], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: (t: number) => 1 - Math.pow(1 - t, 2),
      });

    case 'ease-in-out':
      return interpolate(relativeFrame, [0, duration], [from, to], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
      });

    case 'linear':
    default:
      return interpolate(relativeFrame, [0, duration], [from, to], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
  }
};