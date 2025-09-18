import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';

interface WaveformProps {
  audioData?: number[];
  width?: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
  animated?: boolean;
  responsive?: boolean;
  style?: React.CSSProperties;
}

export const Waveform: React.FC<WaveformProps> = ({
  audioData = [],
  width = 400,
  height = 100,
  color = '#3498db',
  backgroundColor = 'transparent',
  animated = true,
  responsive = true,
  style = {},
}) => {
  const frame = useCurrentFrame();

  // Generate sample data if none provided
  const sampleData = audioData.length > 0 ? audioData : Array.from({ length: 50 }, (_, i) =>
    Math.sin(i * 0.2) * 0.5 + Math.sin(i * 0.1) * 0.3 + Math.random() * 0.2
  );

  const barWidth = width / sampleData.length;
  const currentTime = frame / 30; // Assuming 30fps

  return (
    <div
      style={{
        width,
        height,
        backgroundColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      <svg width={width} height={height}>
        {sampleData.map((amplitude, index) => {
          const barHeight = Math.abs(amplitude) * height * 0.8;
          const x = index * barWidth;
          const y = (height - barHeight) / 2;

          const progress = animated ? currentTime * 2 : index / sampleData.length;
          const isActive = index / sampleData.length <= progress % 1;

          const opacity = isActive ? 1 : 0.3;
          const barColor = isActive ? color : `${color}66`;

          return (
            <rect
              key={index}
              x={x}
              y={y}
              width={barWidth * 0.8}
              height={barHeight}
              fill={barColor}
              opacity={opacity}
              rx={1}
            />
          );
        })}

        {/* Progress line */}
        {animated && (
          <line
            x1={(progress % 1) * width}
            y1={0}
            x2={(progress % 1) * width}
            y2={height}
            stroke={color}
            strokeWidth={2}
            opacity={0.8}
          />
        )}
      </svg>
    </div>
  );
};