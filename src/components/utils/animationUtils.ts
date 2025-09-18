export const animationUtils = {
  // Easing functions
  easing: {
    linear: (t: number): number => t,
    easeIn: (t: number): number => t * t,
    easeOut: (t: number): number => 1 - Math.pow(1 - t, 2),
    easeInOut: (t: number): number => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
    easeInCubic: (t: number): number => t * t * t,
    easeOutCubic: (t: number): number => 1 - Math.pow(1 - t, 3),
    easeInQuart: (t: number): number => t * t * t * t,
    easeOutQuart: (t: number): number => 1 - Math.pow(1 - t, 4),
    elastic: (t: number): number => {
      if (t === 0 || t === 1) return t;
      return -Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI);
    },
    bounce: (t: number): number => {
      if (t < 1 / 2.75) {
        return 7.5625 * t * t;
      } else if (t < 2 / 2.75) {
        return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
      } else if (t < 2.5 / 2.75) {
        return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
      } else {
        return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
      }
    },
  },

  // Common animation presets
  presets: {
    fadeIn: {
      from: 0,
      to: 1,
      duration: 30,
      property: 'opacity',
    },
    slideInLeft: {
      from: -100,
      to: 0,
      duration: 45,
      property: 'translateX',
    },
    slideInRight: {
      from: 100,
      to: 0,
      duration: 45,
      property: 'translateX',
    },
    slideInUp: {
      from: 100,
      to: 0,
      duration: 45,
      property: 'translateY',
    },
    slideInDown: {
      from: -100,
      to: 0,
      duration: 45,
      property: 'translateY',
    },
    scaleIn: {
      from: 0,
      to: 1,
      duration: 30,
      property: 'scale',
    },
    rotateIn: {
      from: -180,
      to: 0,
      duration: 60,
      property: 'rotate',
    },
  },

  // Stagger animations
  getStaggeredDelay: (index: number, staggerAmount: number = 5): number => {
    return index * staggerAmount;
  },

  // Sequence timing helpers
  createSequence: (items: Array<{ duration: number; delay?: number }>) => {
    let currentFrame = 0;
    return items.map((item, index) => {
      const startFrame = currentFrame + (item.delay || 0);
      currentFrame = startFrame + item.duration;
      return {
        startFrame,
        endFrame: currentFrame,
        duration: item.duration,
        index,
      };
    });
  },

  // Wave animation
  wave: (frame: number, frequency: number = 0.1, amplitude: number = 1): number => {
    return Math.sin(frame * frequency) * amplitude;
  },

  // Pulse animation
  pulse: (frame: number, speed: number = 0.1, min: number = 0.8, max: number = 1.2): number => {
    return min + (max - min) * (Math.sin(frame * speed) + 1) / 2;
  },
};