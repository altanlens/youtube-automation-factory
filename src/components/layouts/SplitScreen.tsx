import React from 'react';
import {AbsoluteFill} from 'remotion';

interface SplitScreenProps {
  leftComponent: React.ReactNode;
  rightComponent: React.ReactNode;
  split?: number; // 0-100, default 50
  direction?: 'horizontal' | 'vertical';
  gap?: number;
  style?: React.CSSProperties;
}

export const SplitScreen: React.FC<SplitScreenProps> = ({
  leftComponent,
  rightComponent,
  split = 50,
  direction = 'horizontal',
  gap = 0,
  style = {},
}) => {
  const splitPercentage = Math.max(0, Math.min(100, split));

  const getLeftStyle = () => {
    if (direction === 'horizontal') {
      return {
        width: `${splitPercentage}%`,
        height: '100%',
        paddingRight: gap / 2,
      };
    } else {
      return {
        width: '100%',
        height: `${splitPercentage}%`,
        paddingBottom: gap / 2,
      };
    }
  };

  const getRightStyle = () => {
    if (direction === 'horizontal') {
      return {
        width: `${100 - splitPercentage}%`,
        height: '100%',
        paddingLeft: gap / 2,
      };
    } else {
      return {
        width: '100%',
        height: `${100 - splitPercentage}%`,
        paddingTop: gap / 2,
      };
    }
  };

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: direction === 'horizontal' ? 'row' : 'column',
        ...style,
      }}
    >
      <div style={getLeftStyle()}>
        {leftComponent}
      </div>
      <div style={getRightStyle()}>
        {rightComponent}
      </div>
    </AbsoluteFill>
  );
};