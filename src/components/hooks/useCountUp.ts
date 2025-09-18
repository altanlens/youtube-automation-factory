import {useCurrentFrame, interpolate} from 'remotion';

interface CountUpConfig {
  from: number;
  to: number;
  startFrame?: number;
  duration?: number;
  decimals?: number;
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

interface CountUpResult {
  value: number;
  formattedValue: string;
  progress: number;
  isComplete: boolean;
}

export const useCountUp = (config: CountUpConfig): CountUpResult => {
  const frame = useCurrentFrame();
  const {
    from,
    to,
    startFrame = 0,
    duration = 60,
    decimals = 0,
    easing = 'ease-out',
  } = config;

  const relativeFrame = Math.max(0, frame - startFrame);

  const getEasingFunction = (t: number): number => {
    switch (easing) {
      case 'ease-in':
        return t * t;
      case 'ease-out':
        return 1 - Math.pow(1 - t, 2);
      case 'ease-in-out':
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      case 'linear':
      default:
        return t;
    }
  };

  const progress = Math.min(relativeFrame / duration, 1);
  const easedProgress = getEasingFunction(progress);

  const value = interpolate(easedProgress, [0, 1], [from, to]);

  const formattedValue = decimals > 0
    ? value.toFixed(decimals)
    : Math.round(value).toLocaleString();

  const isComplete = progress >= 1;

  return {
    value,
    formattedValue,
    progress,
    isComplete,
  };
};