import React from 'react';
import { BlackBox } from '@game-engine/black-box';
import type { ScoreEvent, BlackboxRound } from '@game-engine/types';

const apiKey = (import.meta as any).env.VITE_OPENROUTER_API_KEY || '';

const G4_CONFIG = {
  apiKey: apiKey.trim(),
  isDemo: !apiKey.trim(),
};

export function App() {
  const handleScore = (event: ScoreEvent) => {
    console.log('Round score:', event.roundScore, '| Total:', event.sessionTotal);
  };

  const handleGameComplete = (result: { totalScore: number; rounds: BlackboxRound[] }) => {
    console.log('Game complete! Total score:', result.totalScore);
  };

  return (
    <>
      {G4_CONFIG.isDemo && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 9999,
          background: 'rgba(245,158,11,0.15)',
          borderBottom: '1px solid rgba(245,158,11,0.4)',
          padding: '8px 16px',
          textAlign: 'center',
          color: '#f59e0b',
          fontSize: '13px',
          fontFamily: 'Inter, system-ui, sans-serif',
          fontWeight: 600,
        }}>
          ⚠️ Preview Mode — Add VITE_OPENROUTER_API_KEY to .env and restart to enable live AI
        </div>
      )}
      <BlackBox
        config={G4_CONFIG}
        onScore={handleScore}
        onGameComplete={handleGameComplete}
      />
    </>
  );
}
