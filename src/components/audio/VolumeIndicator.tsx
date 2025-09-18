import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';

interface VolumeIndicatorProps {
  volume?: number; // 0-1
  width?: number;
  height?: number;
  orientation?: 'horizontal' | 'vertical';
  color?: string;
  backgroundColor?: string;
  animated?: boolean;
  showValue?: boolean;
  style?: React.CSSProperties;
}

export const VolumeIndicator: React.FC<VolumeIndicatorProps> = ({
  volume = 0.5,
  width = 200,
  height = 20,
  orientation = 'horizontal',
  color = '#2ecc71',
  backgroundColor = '#ecf0f1',
  animated = true,
  showValue = false,
  style = {},
}) => {
  const frame = useCurrentFrame();

  // Simulate volume changes if animated
  const animatedVolume = animated
    ? Math.abs(Math.sin(frame * 0.1)) * volume
    : volume;

  const getVolumeColor = (level: number) => {
    if (level < 0.3) return '#2ecc71'; // Green
    if (level < 0.7) return '#f39c12'; // Orange
    return '#e74c3c'; // Red
  };

  const currentColor = getVolumeColor(animatedVolume);

  const containerStyle = orientation === 'horizontal'
    ? { width, height }
    : { width: height, height: width };

  const fillStyle = orientation === 'horizontal'
    ? {
        width: `${animatedVolume * 100}%`,
        height: '100%',
      }
    : {
        width: '100%',
        height: `${animatedVolume * 100}%`,
        position: 'absolute' as const,
        bottom: 0,
      };

  return (
    <div
      style={{
        ...containerStyle,
        backgroundColor,
        borderRadius: Math.min(width, height) / 4,
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      <div
        style={{
          ...fillStyle,
          backgroundColor: currentColor,
          borderRadius: Math.min(width, height) / 4,
          transition: animated ? 'none' : 'all 0.3s ease',
        }}
      />

      {showValue && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: Math.min(width, height) * 0.6,
            fontWeight: 'bold',
            color: animatedVolume > 0.5 ? 'white' : '#333',
            pointerEvents: 'none',
          }}
        >
          {Math.round(animatedVolume * 100)}%
        </div>
      )}

      {/* Peak indicators */}
      {Array.from({ length: 5 }, (_, index) => {
        const threshold = (index + 1) * 0.2;
        const isActive = animatedVolume >= threshold;

        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: orientation === 'horizontal' ? '10%' : `${(1 - threshold) * 100 - 2}%`,
              left: orientation === 'horizontal' ? `${threshold * 100 - 1}%` : '10%',
              width: orientation === 'horizontal' ? '2px' : '80%',
              height: orientation === 'horizontal' ? '80%' : '2px',
              backgroundColor: isActive ? 'white' : 'transparent',
              opacity: 0.8,
            }}
          />
        );
      })}
    </div>
  );
};