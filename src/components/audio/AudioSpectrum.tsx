import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';

interface AudioSpectrumProps {
  frequencyData?: number[];
  barCount?: number;
  width?: number;
  height?: number;
  color?: string;
  gradient?: boolean;
  gradientColors?: string[];
  animated?: boolean;
  style?: React.CSSProperties;
}

export const AudioSpectrum: React.FC<AudioSpectrumProps> = ({
  frequencyData = [],
  barCount = 32,
  width = 400,
  height = 200,
  color = '#e74c3c',
  gradient = true,
  gradientColors = ['#e74c3c', '#f39c12', '#f1c40f'],
  animated = true,
  style = {},
}) => {
  const frame = useCurrentFrame();

  // Generate sample frequency data if none provided
  const sampleData = frequencyData.length > 0
    ? frequencyData
    : Array.from({ length: barCount }, (_, i) => {
        const baseFreq = Math.sin(frame * 0.1 + i * 0.2) * 0.5 + 0.5;
        const noise = Math.sin(frame * 0.05 + i * 0.1) * 0.3;
        return Math.max(0, Math.min(1, baseFreq + noise));
      });

  const barWidth = width / barCount;
  const gap = barWidth * 0.1;
  const actualBarWidth = barWidth - gap;

  const gradientId = `spectrum-gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div
      style={{
        width,
        height,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        ...style,
      }}
    >
      <svg width={width} height={height}>
        {gradient && (
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="100%" x2="0%" y2="0%">
              {gradientColors.map((color, index) => (
                <stop
                  key={index}
                  offset={`${(index / (gradientColors.length - 1)) * 100}%`}
                  stopColor={color}
                />
              ))}
            </linearGradient>
          </defs>
        )}

        {sampleData.slice(0, barCount).map((amplitude, index) => {
          const barHeight = amplitude * height * 0.9;
          const x = index * barWidth + gap / 2;
          const y = height - barHeight;

          const animationDelay = index * 2;
          const animatedHeight = animated
            ? interpolate(frame - animationDelay, [0, 30], [0, barHeight], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              })
            : barHeight;

          return (
            <rect
              key={index}
              x={x}
              y={height - animatedHeight}
              width={actualBarWidth}
              height={animatedHeight}
              fill={gradient ? `url(#${gradientId})` : color}
              rx={actualBarWidth / 4}
            />
          );
        })}
      </svg>
    </div>
  );
};