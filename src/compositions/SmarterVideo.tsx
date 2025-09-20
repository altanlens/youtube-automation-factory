import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
  spring,
  getInputProps
} from 'remotion';

interface Scene {
  id: string;
  duration: number;
  text: string;
  visuals: string;
  animation: string;
}

interface SmarterVideoProps {
  title?: string;
  scenes?: Scene[];
}

const AnimatedText: React.FC<{
  text: string;
  animation: string;
  delay?: number;
}> = ({ text, animation, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: {
      damping: 200,
      stiffness: 100,
      mass: 0.5,
    },
  });

  const animationStyles = {
    'fade-in': {
      opacity: progress,
      transform: `translateY(${interpolate(progress, [0, 1], [20, 0])}px)`,
    },
    'slide-up': {
      transform: `translateY(${interpolate(progress, [0, 1], [50, 0])}px)`,
      opacity: progress,
    },
    'zoom-in': {
      transform: `scale(${interpolate(progress, [0, 1], [0.8, 1])})`,
      opacity: progress,
    },
    'morph': {
      transform: `scale(${interpolate(progress, [0, 1], [0.9, 1])}) rotate(${interpolate(progress, [0, 1], [-2, 0])}deg)`,
      opacity: progress,
    },
    'stack-up': {
      transform: `translateY(${interpolate(progress, [0, 1], [30, 0])}px)`,
      opacity: progress,
    },
    'glow': {
      opacity: progress,
      textShadow: `0 0 ${interpolate(progress, [0, 1], [0, 20])}px rgba(59, 130, 246, 0.8)`,
    },
  };

  return (
    <div
      style={{
        ...animationStyles[animation as keyof typeof animationStyles],
        fontSize: '42px',
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        padding: '0 40px',
        lineHeight: 1.2,
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {text}
    </div>
  );
};

const BrainIcon: React.FC<{ progress: number }> = ({ progress }) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '80px',
        opacity: progress,
        filter: `hue-rotate(${interpolate(progress, [0, 1], [0, 360])}deg)`,
      }}
    >
      🧠
    </div>
  );
};

const BookIcon: React.FC<{ progress: number }> = ({ progress }) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: '25%',
        left: '50%',
        transform: `translateX(-50%) scale(${interpolate(progress, [0, 1], [0.5, 1])})`,
        fontSize: '60px',
        opacity: progress,
      }}
    >
      📚
    </div>
  );
};

const StatGraph: React.FC<{ progress: number }> = ({ progress }) => {
  const barHeight = interpolate(progress, [0, 1], [20, 120]);

  return (
    <div
      style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'end',
        gap: '10px',
      }}
    >
      <div
        style={{
          width: '40px',
          height: `${barHeight}px`,
          background: 'linear-gradient(to top, #3b82f6, #1d4ed8)',
          borderRadius: '4px',
        }}
      />
      <div
        style={{
          color: 'white',
          fontSize: '24px',
          fontWeight: 'bold',
          marginLeft: '10px',
        }}
      >
        +23%
      </div>
    </div>
  );
};

const Timer: React.FC<{ progress: number }> = ({ progress }) => {
  const minutes = Math.floor(interpolate(progress, [0, 1], [0, 30]));

  return (
    <div
      style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(59, 130, 246, 0.2)',
        border: '2px solid #3b82f6',
        borderRadius: '20px',
        padding: '20px 40px',
        color: 'white',
        fontSize: '36px',
        fontWeight: 'bold',
      }}
    >
      {minutes} min
    </div>
  );
};

const NeuralNetwork: React.FC<{ progress: number }> = ({ progress }) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: '15%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '300px',
        height: '200px',
      }}
    >
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: '20px',
            height: '20px',
            background: '#3b82f6',
            borderRadius: '50%',
            left: `${(i % 3) * 100 + 50}px`,
            top: `${Math.floor(i / 3) * 80 + 50}px`,
            opacity: interpolate(progress, [0, 1], [0.3, 1]),
            transform: `scale(${interpolate(progress, [0, 1], [0.5, 1])})`,
            boxShadow: `0 0 ${interpolate(progress, [0, 1], [0, 15])}px #3b82f6`,
          }}
        />
      ))}
    </div>
  );
};

export const SmarterVideo: React.FC<SmarterVideoProps> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scenes: Scene[] = [
    {
      id: "intro",
      duration: 8,
      text: "Can you really get smarter by doing just ONE thing?",
      visuals: "brain",
      animation: "fade-in"
    },
    {
      id: "question",
      duration: 10,
      text: "Scientists studied thousands of people and found something shocking...",
      visuals: "research",
      animation: "slide-up"
    },
    {
      id: "reveal",
      duration: 12,
      text: "Reading for just 30 minutes daily increased cognitive function by 23%",
      visuals: "stats",
      animation: "zoom-in"
    },
    {
      id: "explanation",
      duration: 15,
      text: "Reading builds neural pathways, improves focus, and enhances memory. It's like exercise for your brain!",
      visuals: "neural",
      animation: "morph"
    },
    {
      id: "practical",
      duration: 10,
      text: "Start with 10 minutes. Fiction, non-fiction, even articles count!",
      visuals: "books",
      animation: "stack-up"
    },
    {
      id: "cta",
      duration: 5,
      text: "What will you read today?",
      visuals: "book",
      animation: "glow"
    }
  ];

  let currentTime = 0;
  const currentScene = scenes.find(scene => {
    const sceneStart = currentTime;
    const sceneEnd = currentTime + scene.duration * fps;
    currentTime += scene.duration * fps;

    return frame >= sceneStart && frame < sceneEnd;
  });

  const getSceneProgress = (scene: Scene) => {
    let sceneStartFrame = 0;
    for (const s of scenes) {
      if (s.id === scene.id) break;
      sceneStartFrame += s.duration * fps;
    }

    const sceneFrame = frame - sceneStartFrame;
    const sceneDuration = scene.duration * fps;
    return Math.max(0, Math.min(1, sceneFrame / sceneDuration));
  };

  const renderVisual = (scene: Scene, progress: number) => {
    switch (scene.visuals) {
      case 'brain':
        return <BrainIcon progress={progress} />;
      case 'research':
        return <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', fontSize: '60px', opacity: progress }}>📊📈📋</div>;
      case 'stats':
        return <StatGraph progress={progress} />;
      case 'neural':
        return <NeuralNetwork progress={progress} />;
      case 'books':
        return <BookIcon progress={progress} />;
      case 'book':
        return <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', fontSize: '80px', opacity: progress, filter: `drop-shadow(0 0 ${interpolate(progress, [0, 1], [0, 20])}px #f59e0b)` }}>📖</div>;
      default:
        return null;
    }
  };

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      {/* Background Animation */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at ${interpolate(frame, [0, 60 * fps], [20, 80])}% ${interpolate(frame, [0, 60 * fps], [30, 70])}%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)`,
        }}
      />

      {scenes.map((scene, index) => {
        const sceneStartFrame = scenes.slice(0, index).reduce((acc, s) => acc + s.duration * fps, 0);
        const sceneDuration = scene.duration * fps;

        return (
          <Sequence
            key={scene.id}
            from={sceneStartFrame}
            durationInFrames={sceneDuration}
          >
            <AbsoluteFill
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {renderVisual(scene, getSceneProgress(scene))}

              <div
                style={{
                  position: 'absolute',
                  bottom: '20%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '90%',
                  maxWidth: '800px',
                }}
              >
                <AnimatedText
                  text={scene.text}
                  animation={scene.animation}
                />
              </div>
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};