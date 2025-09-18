import {useCurrentFrame, interpolate} from 'remotion';

interface TypedTextConfig {
  text: string;
  startFrame?: number;
  charactersPerFrame?: number;
  showCursor?: boolean;
  cursorBlinkRate?: number;
}

interface TypedTextResult {
  displayText: string;
  cursorVisible: boolean;
  isComplete: boolean;
  progress: number;
}

export const useTypedText = (config: TypedTextConfig): TypedTextResult => {
  const frame = useCurrentFrame();
  const {
    text,
    startFrame = 0,
    charactersPerFrame = 0.5,
    showCursor = true,
    cursorBlinkRate = 15,
  } = config;

  const relativeFrame = Math.max(0, frame - startFrame);
  const charactersToShow = Math.floor(relativeFrame * charactersPerFrame);
  const displayText = text.substring(0, Math.min(charactersToShow, text.length));

  const isComplete = charactersToShow >= text.length;
  const progress = Math.min(charactersToShow / text.length, 1);

  const cursorVisible = showCursor
    ? interpolate(frame % (cursorBlinkRate * 2), [0, cursorBlinkRate, cursorBlinkRate * 2], [1, 0, 1]) > 0.5
    : false;

  return {
    displayText,
    cursorVisible,
    isComplete,
    progress,
  };
};