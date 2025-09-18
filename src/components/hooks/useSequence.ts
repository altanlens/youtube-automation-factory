import {useCurrentFrame} from 'remotion';

interface SequenceItem {
  startFrame: number;
  duration: number;
  id: string;
}

interface SequenceResult {
  currentSequence: SequenceItem | null;
  isActive: (id: string) => boolean;
  getProgress: (id: string) => number;
  getRelativeFrame: (id: string) => number;
}

export const useSequence = (sequences: SequenceItem[]): SequenceResult => {
  const frame = useCurrentFrame();

  const currentSequence = sequences.find(
    seq => frame >= seq.startFrame && frame < seq.startFrame + seq.duration
  ) || null;

  const isActive = (id: string): boolean => {
    const sequence = sequences.find(seq => seq.id === id);
    if (!sequence) return false;
    return frame >= sequence.startFrame && frame < sequence.startFrame + sequence.duration;
  };

  const getProgress = (id: string): number => {
    const sequence = sequences.find(seq => seq.id === id);
    if (!sequence) return 0;

    if (frame < sequence.startFrame) return 0;
    if (frame >= sequence.startFrame + sequence.duration) return 1;

    return (frame - sequence.startFrame) / sequence.duration;
  };

  const getRelativeFrame = (id: string): number => {
    const sequence = sequences.find(seq => seq.id === id);
    if (!sequence) return 0;

    return Math.max(0, frame - sequence.startFrame);
  };

  return {
    currentSequence,
    isActive,
    getProgress,
    getRelativeFrame,
  };
};