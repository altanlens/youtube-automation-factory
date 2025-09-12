import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';

interface TypeWriterProps {
  text: string;
  startFrame?: number;
  charactersPerFrame?: number;
  showCursor?: boolean;
  cursorCharacter?: string;
  style?: React.CSSProperties;
}

export const TypeWriter: React.FC<TypeWriterProps> = ({
  text,
  startFrame = 0,
  charactersPerFrame = 0.5,
  showCursor = true,
  cursorCharacter = '|',
  style = {},
}) => {
  const frame = useCurrentFrame();
  const relativeFrame = Math.max(0, frame - startFrame);

  const charactersToShow = Math.floor(relativeFrame * charactersPerFrame);
  const displayedText = text.substring(0, charactersToShow);

  const cursorOpacity = showCursor
    ? interpolate(
        frame % 30,
        [0, 15, 30],
        [1, 0, 1],
        {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        }
      )
    : 0;

  return (
    <div style={style}>
      {displayedText}
      <span style={{opacity: cursorOpacity}}>{cursorCharacter}</span>
    </div>
  );
};
