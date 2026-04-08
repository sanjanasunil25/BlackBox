import React from 'react';
import type { GameConfig, ScoreEvent, BlackboxRound } from '@game-engine/types';
import { LoadingScreen } from '@game-engine/ui';
import { useBlackBoxGame } from './useBlackBoxGame';
import { StartScreen } from './components/StartScreen';
import { GameScreen } from './components/GameScreen';
import { ResultScreen } from './components/ResultScreen';
import { FinalSummary } from './components/FinalSummary';

export interface BlackBoxProps {
  config: GameConfig;
  onScore?: (event: ScoreEvent) => void;
  onGameComplete?: (result: { totalScore: number; rounds: BlackboxRound[] }) => void;
}

export function BlackBox({ config, onScore, onGameComplete }: BlackBoxProps) {
  const {
    state,
    startGeneration,
    revealNextClue,
    submitGuess,
    forfeit,
    nextRound,
    useHint,
    reset,
    currentRoundNumber,
    totalRounds,
    progressPercent,
  } = useBlackBoxGame(config, onScore, onGameComplete);

  const { phase, currentRound, currentClueIndex, potentialScore, hintAvailable, gameData, errorMessage } = state;

  // Loading
  if (phase === 'loading') {
    return <LoadingScreen />;
  }

  // Start
  if (phase === 'start' || phase === 'error') {
    return (
      <StartScreen
        onStart={startGeneration}
        isLoading={false}
        errorMessage={errorMessage}
      />
    );
  }

  // Active round
  if (phase === 'round_active' && currentRound) {
    return (
      <GameScreen
        round={currentRound}
        currentClueIndex={currentClueIndex}
        potentialScore={potentialScore}
        hintAvailable={hintAvailable}
        roundNumber={currentRoundNumber}
        totalRounds={totalRounds}
        progressPercent={progressPercent}
        onSubmit={submitGuess}
        onNextClue={revealNextClue}
        onHint={useHint}
        onForfeit={forfeit}
        onExit={reset}
      />
    );
  }

  // Round result
  if (phase === 'round_result' && currentRound) {
    return (
      <ResultScreen
        round={currentRound}
        roundNumber={currentRoundNumber}
        totalRounds={totalRounds}
        onNextRound={nextRound}
        onExit={reset}
      />
    );
  }

  // Game complete
  if (phase === 'game_complete' && gameData) {
    return (
      <FinalSummary
        totalScore={gameData.totalScore}
        rounds={gameData.rounds}
        onPlayAgain={reset}
      />
    );
  }

  // Fallback
  return <StartScreen onStart={startGeneration} isLoading={false} errorMessage={null} />;
}
