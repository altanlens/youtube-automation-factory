import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';

interface BarChartProps {
  data: number[];
  labels?: string[];
  height?: number;
  width?: number;
  color?: string;
  animated?: boolean;
  startFrame?: number;
  style?: React.CSSProperties;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  labels = [],
  height = 300,
  width = 500,
  color = '#3498db',
  animated = true,
  startFrame = 0,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const maxValue = Math.max(...data);

  return (
    <div style={{...style, height, width, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around'}}>
      {data.map((value, i) => {
        const barHeight = animated
          ? interpolate(
              frame - startFrame,
              [0, 30],
              [0, (value / maxValue) * height],
              {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }
            )
          : (value / maxValue) * height;

        return (
          <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <div
              style={{
                width: width / data.length / 2,
                height: barHeight,
                backgroundColor: color,
                marginBottom: 5,
              }}
            />
            {labels[i] && <div style={{fontSize: 12}}>{labels[i]}</div>}
          </div>
        );
      })}
    </div>
  );
};
