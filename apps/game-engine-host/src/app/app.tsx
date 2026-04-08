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
    <BlackBox
      config={G4_CONFIG}
      onScore={handleScore}
      onGameComplete={handleGameComplete}
    />
  );
}
