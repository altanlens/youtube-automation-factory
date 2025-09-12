import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame, spring, interpolate} from 'remotion';

const Title: React.FC<{
  titleText: string;
  titleColor: string;
}> = ({titleText, titleColor}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const scale = spring({
    frame,
    from: 0.5,
    to: 1,
    fps: 30,
    config: {
      damping: 10,
      stiffness: 100,
      mass: 0.5,
    },
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <h1
        style={{
          fontFamily: 'SF Pro Text, Helvetica, Arial, sans-serif',
          fontWeight: 'bold',
          fontSize: 100,
          textAlign: 'center',
          position: 'absolute',
          top: '40%',
          transform: `scale(${scale})`,
          color: titleColor,
          opacity,
        }}
      >
        {titleText}
      </h1>
    </AbsoluteFill>
  );
};

export const HelloWorld: React.FC<{
  titleText: string;
  titleColor: string;
}> = ({titleText, titleColor}) => {
  return (
    <AbsoluteFill style={{backgroundColor: 'white'}}>
      <Sequence from={0}>
        <Title titleText={titleText} titleColor={titleColor} />
      </Sequence>
    </AbsoluteFill>
  );
};
