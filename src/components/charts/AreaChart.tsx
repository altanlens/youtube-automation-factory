import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';

interface DataPoint {
  x: number;
  y: number;
  label?: string;
}

interface AreaChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  animated?: boolean;
  animationDuration?: number;
  startFrame?: number;
  gradient?: boolean;
  gradientColors?: string[];
  style?: React.CSSProperties;
}

export const AreaChart: React.FC<AreaChartProps> = ({
  data,
  width = 500,
  height = 300,
  fillColor = 'rgba(52, 152, 219, 0.3)',
  strokeColor = '#3498db',
  strokeWidth = 2,
  animated = true,
  animationDuration = 60,
  startFrame = 0,
  gradient = true,
  gradientColors = ['rgba(52, 152, 219, 0.6)', 'rgba(52, 152, 219, 0.1)'],
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

  const linePathData = data.map((point, index) => {
    const x = scaleX(point.x);
    const y = scaleY(point.y);
    return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
  }).join(' ');

  const areaPathData = linePathData +
    ` L ${scaleX(data[data.length - 1].x)} ${height - padding}` +
    ` L ${scaleX(data[0].x)} ${height - padding} Z`;

  const animationProgress = animated
    ? interpolate(relativeFrame, [0, animationDuration], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1;

  const pathLength = data.length * 50;
  const strokeDasharray = pathLength;
  const strokeDashoffset = pathLength * (1 - animationProgress);

  const gradientId = `areaGradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div style={{ ...style, width, height }}>
      <svg width={width} height={height}>
        {gradient && (
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={gradientColors[0]} />
              <stop offset="100%" stopColor={gradientColors[1]} />
            </linearGradient>
          </defs>
        )}

        {/* Grid lines */}
        <defs>
          <pattern id="areaGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#areaGrid)" opacity="0.3"/>

        {/* Area fill */}
        <path
          d={areaPathData}
          fill={gradient ? `url(#${gradientId})` : fillColor}
          opacity={animationProgress}
        />

        {/* Line */}
        <path
          d={linePathData}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={animated ? strokeDasharray : undefined}
          strokeDashoffset={animated ? strokeDashoffset : undefined}
        />
      </svg>
    </div>
  );
};