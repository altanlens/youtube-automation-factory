import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';

interface DataPoint {
  x: number;
  y: number;
  label?: string;
}

interface LineChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  strokeColor?: string;
  strokeWidth?: number;
  animated?: boolean;
  animationDuration?: number;
  startFrame?: number;
  showDots?: boolean;
  dotColor?: string;
  dotSize?: number;
  style?: React.CSSProperties;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  width = 500,
  height = 300,
  strokeColor = '#3498db',
  strokeWidth = 3,
  animated = true,
  animationDuration = 60,
  startFrame = 0,
  showDots = true,
  dotColor = '#e74c3c',
  dotSize = 6,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const relativeFrame = Math.max(0, frame - startFrame);

  if (data.length === 0) return null;

  const maxX = Math.max(...data.map(d => d.x));
  const minX = Math.min(...data.map(d => d.x));
  const maxY = Math.max(...data.map(d => d.y));
  const minY = Math.min(...data.map(d => d.y));

  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const scaleX = (x: number) => ((x - minX) / (maxX - minX)) * chartWidth + padding;
  const scaleY = (y: number) => height - (((y - minY) / (maxY - minY)) * chartHeight + padding);

  const pathData = data.map((point, index) => {
    const x = scaleX(point.x);
    const y = scaleY(point.y);
    return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
  }).join(' ');

  const animationProgress = animated
    ? interpolate(relativeFrame, [0, animationDuration], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1;

  const pathLength = data.length * 50; // Approximate path length
  const strokeDasharray = pathLength;
  const strokeDashoffset = pathLength * (1 - animationProgress);

  return (
    <div style={{ ...style, width, height }}>
      <svg width={width} height={height}>
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" opacity="0.3"/>

        {/* Line */}
        <path
          d={pathData}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={animated ? strokeDasharray : undefined}
          strokeDashoffset={animated ? strokeDashoffset : undefined}
        />

        {/* Dots */}
        {showDots && data.map((point, index) => {
          const x = scaleX(point.x);
          const y = scaleY(point.y);
          const dotProgress = animated
            ? interpolate(relativeFrame, [animationDuration * (index / data.length), animationDuration * ((index + 1) / data.length)], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              })
            : 1;

          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r={dotSize * dotProgress}
              fill={dotColor}
              opacity={dotProgress}
            />
          );
        })}

        {/* Labels */}
        {data.map((point, index) => {
          if (!point.label) return null;
          const x = scaleX(point.x);
          const y = scaleY(point.y);
          return (
            <text
              key={index}
              x={x}
              y={y - 15}
              textAnchor="middle"
              fontSize="12"
              fill="#333"
            >
              {point.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
};