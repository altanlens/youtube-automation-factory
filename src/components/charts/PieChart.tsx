import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';

interface PieDataPoint {
  value: number;
  label: string;
  color?: string;
}

interface PieChartProps {
  data: PieDataPoint[];
  radius?: number;
  centerX?: number;
  centerY?: number;
  animated?: boolean;
  animationDuration?: number;
  startFrame?: number;
  showLabels?: boolean;
  showValues?: boolean;
  style?: React.CSSProperties;
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  radius = 100,
  centerX = 150,
  centerY = 150,
  animated = true,
  animationDuration = 90,
  startFrame = 0,
  showLabels = true,
  showValues = false,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const relativeFrame = Math.max(0, frame - startFrame);

  const defaultColors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#34495e', '#e67e22'];

  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;

  const animationProgress = animated
    ? interpolate(relativeFrame, [0, animationDuration], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1;

  const createArcPath = (startAngle: number, endAngle: number, progress: number) => {
    const actualEndAngle = startAngle + (endAngle - startAngle) * progress;
    const x1 = centerX + radius * Math.cos((startAngle - 90) * Math.PI / 180);
    const y1 = centerY + radius * Math.sin((startAngle - 90) * Math.PI / 180);
    const x2 = centerX + radius * Math.cos((actualEndAngle - 90) * Math.PI / 180);
    const y2 = centerY + radius * Math.sin((actualEndAngle - 90) * Math.PI / 180);

    const largeArcFlag = actualEndAngle - startAngle <= 180 ? 0 : 1;

    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  return (
    <div style={{ ...style, width: centerX * 2, height: centerY * 2 }}>
      <svg width={centerX * 2} height={centerY * 2}>
        {data.map((item, index) => {
          const percentage = item.value / total;
          const angleSpan = percentage * 360;
          const endAngle = currentAngle + angleSpan;

          const segmentProgress = animated
            ? interpolate(relativeFrame, [animationDuration * (index / data.length), animationDuration * ((index + 1) / data.length)], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              })
            : 1;

          const path = createArcPath(currentAngle, endAngle, segmentProgress);
          const color = item.color || defaultColors[index % defaultColors.length];

          // Label position
          const labelAngle = currentAngle + (angleSpan * segmentProgress) / 2;
          const labelRadius = radius + 20;
          const labelX = centerX + labelRadius * Math.cos((labelAngle - 90) * Math.PI / 180);
          const labelY = centerY + labelRadius * Math.sin((labelAngle - 90) * Math.PI / 180);

          const result = (
            <g key={index}>
              <path
                d={path}
                fill={color}
                stroke="white"
                strokeWidth="2"
                opacity={segmentProgress}
              />
              {showLabels && segmentProgress > 0.5 && (
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#333"
                  opacity={segmentProgress}
                >
                  {item.label}
                </text>
              )}
              {showValues && segmentProgress > 0.5 && (
                <text
                  x={labelX}
                  y={labelY + 15}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#666"
                  opacity={segmentProgress}
                >
                  {(percentage * 100).toFixed(1)}%
                </text>
              )}
            </g>
          );

          currentAngle = endAngle;
          return result;
        })}
      </svg>
    </div>
  );
};