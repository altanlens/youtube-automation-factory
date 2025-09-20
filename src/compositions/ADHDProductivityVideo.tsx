import React from 'react';
import { Composition, AbsoluteFill, useCurrentFrame, interpolate, Sequence } from 'remotion';
import { ExcalidrawRenderer } from '../excalidraw/ExcalidrawRenderer';
import { ExcalidrawScene } from '../excalidraw/types';
import videoContent from '../video-content/adhd-productivity.json';

// Convert JSON to ExcalidrawScene format
const convertToExcalidrawScene = (sceneData: any): ExcalidrawScene => {
  return {
    elements: sceneData.excalidraw.elements.map((element: any) => ({
      ...element,
      seed: Math.floor(Math.random() * 1000000),
      versionNonce: Math.floor(Math.random() * 1000000),
      isDeleted: false,
      opacity: element.opacity || 1,
      angle: element.angle || 0,
    })),
    appState: {
      viewBackgroundColor: '#ffffff',
    },
  };
};

// Individual scene components
const IntroScene: React.FC = () => {
  const scene = convertToExcalidrawScene(videoContent.scenes[0]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#f8f9fa' }}>
      <ExcalidrawRenderer
        scene={scene}
        animated={true}
        animationType="progressive-draw"
        animationSpeed="fast"
        duration={120}  // FIXED: 4 seconds for intro animation
        width={800}
        height={600}
        useRoughStyle={true}
        roughStylePreset="handDrawn"
      />
    </AbsoluteFill>
  );
};

const ProblemsScene: React.FC = () => {
  const scene = convertToExcalidrawScene(videoContent.scenes[1]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#fff5f5' }}>
      <ExcalidrawRenderer
        scene={scene}
        animated={true}
        animationType="progressive-draw"
        animationSpeed="slow"
        duration={240}  // FIXED: 8 seconds for drawing animation
        width={800}
        height={600}
        useRoughStyle={true}
        roughStylePreset="sketchy"
      />
    </AbsoluteFill>
  );
};

const TimeBlockingScene: React.FC = () => {
  const scene = convertToExcalidrawScene(videoContent.scenes[2]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#f0f8ff' }}>
      <ExcalidrawRenderer
        scene={scene}
        animated={true}
        animationType="progressive-draw"
        animationSpeed="slow"
        duration={240}  // FIXED: 8 seconds for drawing animation
        width={800}
        height={600}
        useRoughStyle={true}
        roughStylePreset="clean"
      />
    </AbsoluteFill>
  );
};

const PomodoroScene: React.FC = () => {
  const scene = convertToExcalidrawScene(videoContent.scenes[3]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#fffaf0' }}>
      <ExcalidrawRenderer
        scene={scene}
        animated={true}
        animationType="progressive-draw"
        animationSpeed="slow"
        duration={240}  // FIXED: 8 seconds for drawing animation
        width={800}
        height={600}
        useRoughStyle={true}
        roughStylePreset="artistic"
      />
    </AbsoluteFill>
  );
};

const OutroScene: React.FC = () => {
  const scene = convertToExcalidrawScene(videoContent.scenes[4]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#f0fff4' }}>
      <ExcalidrawRenderer
        scene={scene}
        animated={true}
        animationType="progressive-draw"
        animationSpeed="slow"
        duration={240}  // FIXED: 8 seconds for drawing animation
        width={800}
        height={600}
        useRoughStyle={true}
        roughStylePreset="handDrawn"
      />
    </AbsoluteFill>
  );
};

// Main video composition
export const ADHDProductivityVideo: React.FC = () => {
  const frame = useCurrentFrame();

  // Calculate total frames for 60 seconds at 30 FPS
  const totalFrames = 60 * 30; // 1800 frames

  // FIXED: Ideal scene distribution based on AI analysis
  const sceneDurations = [
    5 * 30,   // Intro: 150 frames (5 seconds)
    15 * 30,  // Problems: 450 frames (15 seconds)
    15 * 30,  // Time Blocking: 450 frames (15 seconds)
    15 * 30,  // Pomodoro: 450 frames (15 seconds)
    10 * 30,  // Outro: 300 frames (10 seconds)
  ];

  let currentFrame = 0;

  return (
    <AbsoluteFill>
      {/* Intro Scene */}
      <Sequence from={currentFrame} durationInFrames={sceneDurations[0]}>
        <IntroScene />
      </Sequence>

      {/* Problems Scene */}
      <Sequence from={currentFrame += sceneDurations[0]} durationInFrames={sceneDurations[1]}>
        <ProblemsScene />
      </Sequence>

      {/* Time Blocking Scene */}
      <Sequence from={currentFrame += sceneDurations[1]} durationInFrames={sceneDurations[2]}>
        <TimeBlockingScene />
      </Sequence>

      {/* Pomodoro Scene */}
      <Sequence from={currentFrame += sceneDurations[2]} durationInFrames={sceneDurations[3]}>
        <PomodoroScene />
      </Sequence>

      {/* Outro Scene */}
      <Sequence from={currentFrame += sceneDurations[3]} durationInFrames={sceneDurations[4]}>
        <OutroScene />
      </Sequence>

      {/* Progress indicator */}
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          height: 4,
          backgroundColor: 'rgba(0,0,0,0.1)',
          borderRadius: 2,
        }}>
          <div style={{
            height: '100%',
            backgroundColor: '#1c7ed6',
            borderRadius: 2,
            width: `${(frame / totalFrames) * 100}%`,
            transition: 'width 0.1s ease',
          }} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Remotion composition export
export const ADHDProductivityComposition: React.FC = () => {
  return (
    <Composition
      id="adhd-productivity"
      component={ADHDProductivityVideo}
      durationInFrames={1800} // 60 seconds at 30 FPS
      fps={30}
      width={1920}
      height={1080}
    />
  );
};