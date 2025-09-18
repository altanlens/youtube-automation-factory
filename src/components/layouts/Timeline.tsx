import React from 'react';
import {useCurrentFrame, interpolate, AbsoluteFill} from 'remotion';

interface TimelineEvent {
  title: string;
  description?: string;
  time: string;
  icon?: React.ReactNode;
  color?: string;
}

interface TimelineProps {
  events: TimelineEvent[];
  animated?: boolean;
  animationDuration?: number;
  startFrame?: number;
  lineColor?: string;
  lineWidth?: number;
  style?: React.CSSProperties;
}

export const Timeline: React.FC<TimelineProps> = ({
  events,
  animated = true,
  animationDuration = 90,
  startFrame = 0,
  lineColor = '#3498db',
  lineWidth = 4,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const relativeFrame = Math.max(0, frame - startFrame);

  const animationProgress = animated
    ? interpolate(relativeFrame, [0, animationDuration], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1;

  const eventHeight = 120;
  const totalHeight = events.length * eventHeight;

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        ...style,
      }}
    >
      <div
        style={{
          position: 'relative',
          height: totalHeight,
          width: 800,
        }}
      >
        {/* Timeline line */}
        <div
          style={{
            position: 'absolute',
            left: 40,
            top: 0,
            width: lineWidth,
            height: totalHeight * animationProgress,
            backgroundColor: lineColor,
            borderRadius: lineWidth / 2,
          }}
        />

        {/* Events */}
        {events.map((event, index) => {
          const eventProgress = animated
            ? interpolate(
                relativeFrame,
                [animationDuration * (index / events.length), animationDuration * ((index + 1) / events.length)],
                [0, 1],
                {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                }
              )
            : 1;

          const top = index * eventHeight;

          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                top,
                left: 0,
                width: '100%',
                height: eventHeight,
                opacity: eventProgress,
                transform: `translateX(${30 * (1 - eventProgress)}px)`,
              }}
            >
              {/* Timeline dot */}
              <div
                style={{
                  position: 'absolute',
                  left: 40 - 8,
                  top: 20,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  backgroundColor: event.color || lineColor,
                  border: `3px solid white`,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}
              />

              {/* Event content */}
              <div
                style={{
                  marginLeft: 80,
                  padding: 15,
                  backgroundColor: 'white',
                  borderRadius: 8,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  border: '1px solid #e0e0e0',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: 5,
                  }}
                >
                  {event.icon && (
                    <div style={{ marginRight: 10 }}>
                      {event.icon}
                    </div>
                  )}
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 18,
                      fontWeight: 'bold',
                      color: '#333',
                    }}
                  >
                    {event.title}
                  </h3>
                </div>
                {event.description && (
                  <p
                    style={{
                      margin: 0,
                      fontSize: 14,
                      color: '#666',
                      marginBottom: 5,
                    }}
                  >
                    {event.description}
                  </p>
                )}
                <span
                  style={{
                    fontSize: 12,
                    color: '#999',
                    fontWeight: 'bold',
                  }}
                >
                  {event.time}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};