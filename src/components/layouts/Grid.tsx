import React from 'react';
import {AbsoluteFill} from 'remotion';

interface GridItem {
  component: React.ReactNode;
  colspan?: number;
  rowspan?: number;
}

interface GridProps {
  items: GridItem[];
  columns?: number;
  rows?: number;
  gap?: number;
  padding?: number;
  style?: React.CSSProperties;
}

export const Grid: React.FC<GridProps> = ({
  items,
  columns = 2,
  rows = 2,
  gap = 10,
  padding = 20,
  style = {},
}) => {
  const cellWidth = (1920 - padding * 2 - gap * (columns - 1)) / columns;
  const cellHeight = (1080 - padding * 2 - gap * (rows - 1)) / rows;

  return (
    <AbsoluteFill style={{ padding, ...style }}>
      {items.map((item, index) => {
        const row = Math.floor(index / columns);
        const col = index % columns;

        const left = col * (cellWidth + gap);
        const top = row * (cellHeight + gap);

        const width = cellWidth * (item.colspan || 1) + gap * ((item.colspan || 1) - 1);
        const height = cellHeight * (item.rowspan || 1) + gap * ((item.rowspan || 1) - 1);

        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left,
              top,
              width,
              height,
            }}
          >
            {item.component}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};