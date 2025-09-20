import React from 'react';
import { AbsoluteFill } from 'remotion';
import { ExcalidrawRenderer } from '../excalidraw/ExcalidrawRenderer';
import { ExcalidrawScene } from '../excalidraw/types';

// Quick 5-second test of ADHD video
export const ADHDQuickTest: React.FC = () => {
  const scene: ExcalidrawScene = {
    elements: [
      {
        id: "test_brain",
        type: "ellipse",
        x: 300,
        y: 200,
        width: 200,
        height: 150,
        strokeColor: "#e03131",
        backgroundColor: "#ffc9c9",
        strokeWidth: 3,
        roughness: 2,
        fillStyle: "hachure",
        angle: 0,
        opacity: 1,
        seed: 123456,
        versionNonce: 123456,
        isDeleted: false
      },
      {
        id: "test_lightning",
        type: "line",
        x: 350,
        y: 230,
        points: [[0, 0], [15, 30], [5, 30], [20, 60]],
        strokeColor: "#fab005",
        strokeWidth: 4,
        roughness: 1.5,
        angle: 0,
        opacity: 1,
        seed: 123457,
        versionNonce: 123457,
        isDeleted: false,
        width: 20,
        height: 60,
        fillStyle: "solid",
        strokeStyle: "solid",
        backgroundColor: "transparent"
      },
      {
        id: "test_text",
        type: "text",
        x: 250,
        y: 400,
        text: "ADHD BRAIN TEST",
        fontSize: 32,
        fontFamily: 1,
        strokeColor: "#1c7ed6",
        roughness: 1,
        angle: 0,
        opacity: 1,
        seed: 123458,
        versionNonce: 123458,
        isDeleted: false,
        width: 300,
        height: 40,
        fillStyle: "solid",
        strokeStyle: "solid",
        backgroundColor: "transparent",
        textAlign: "left",
        verticalAlign: "top"
      }
    ],
    appState: {
      viewBackgroundColor: '#f8f9fa',
    },
  };

  return (
    <AbsoluteFill style={{ backgroundColor: '#f8f9fa' }}>
      <ExcalidrawRenderer
        scene={scene}
        animated={true}
        animationType="progressive-draw"
        animationSpeed="fast"
        duration={90}  // 3 seconds
        width={800}
        height={600}
        useRoughStyle={true}
        roughStylePreset="handDrawn"
      />
    </AbsoluteFill>
  );
};