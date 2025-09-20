import React from 'react';
import { AbsoluteFill } from 'remotion';

export const SimpleExcalidraw: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        fontSize: 48,
        fontWeight: 'bold',
        color: '#1e1e1e',
        textAlign: 'center'
      }}>
        <p>Excalidraw Test</p>
        <svg width="200" height="100" style={{ border: '2px solid #000' }}>
          <circle cx="100" cy="50" r="40" fill="#ff6b6b" stroke="#000" strokeWidth="3"/>
          <text x="100" y="55" textAnchor="middle" fontSize="16" fill="#000">TEST</text>
        </svg>
      </div>
    </AbsoluteFill>
  );
};