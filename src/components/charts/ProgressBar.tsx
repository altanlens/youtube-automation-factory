import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';

interface ProgressBarProps {
  percentage: number;
  width?: number;
  height?: number;
  backgroundColor?: string;
  fillColor?: string;
  animated?: boolean;
  animationDuration?: number;
  startFrame?: number;
  showLabel?: boolean;
  label?: string;
  labelPosition?: 'inside' | 'outside' | 'top';
  borderRadius?: number;
  style?: React.CSSProperties;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  width = 300,
  height = 20,
  backgroundColor = '#e0e0e0',
  fillColor = '#4caf50',
  animated = true,
  animationDuration = 60,
  startFrame = 0,
  showLabel = true,
  label,
  labelPosition = 'inside',
  borderRadius = 10,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const relativeFrame = Math.max(0, frame - startFrame);

  const progress = animated
    ? interpolate(relativeFrame, [0, animationDuration], [0, percentage], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : percentage;

  const displayLabel = label || `${Math.round(progress)}%`;

  return (
    <div style={{ ...style, width, position: 'relative' }}>
      {showLabel && labelPosition === 'top' && (
        <div
          style={{
            marginBottom: 5,
            fontSize: 14,
            color: '#333',
            textAlign: 'center',
          }}
        >
          {displayLabel}
        </div>
      )}

      <div
        style={{
          width,
          height,
          backgroundColor,
          borderRadius,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: fillColor,
            borderRadius,
            transition: animated ? 'none' : 'width 0.3s ease',
            position: 'relative',
          }}
        />

        {showLabel && labelPosition === 'inside' && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: 12,
              color: progress > 50 ? 'white' : '#333',
              fontWeight: 'bold',
              pointerEvents: 'none',
            }}
          >
            {displayLabel}
          </div>
        )}
      </div>

      {showLabel && labelPosition === 'outside' && (
        <div
          style={{
            marginTop: 5,
            fontSize: 14,
            color: '#333',
            textAlign: 'center',
          }}
        >
          {displayLabel}
        </div>
      )}
    </div>
  );
};