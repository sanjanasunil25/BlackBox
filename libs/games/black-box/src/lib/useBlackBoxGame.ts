import { useReducer, useCallback } from 'react';
import type {
  GameConfig,
  BlackboxGameState,
  BlackboxGameData,
  BlackboxRound,
  ScoreEvent,
} from '@game-engine/types';
import { ClaudeService } from '@game-engine/claude';
import { saveGame } from '@game-engine/session';
import { calculateBlackboxScore, validateGuess, generateId } from '@game-engine/utils';
import {
  BLACK_BOX_SYSTEM_PROMPT,
  buildBlackboxPrompt,
  cleanAndParseResponse,
} from './logic/generation';

const SCORE_LADDER: Record<number, number> = {
  1: 1000,
  2: 800,
  3: 600,
  4: 400,
  5: 200,
  6: 50,
};

// ─── State ───────────────────────────────────────────────────────────────────

const INITIAL_STATE: BlackboxGameState = {
  gameData: null,
  phase: 'start',
  currentRound: null,
  currentClueIndex: 1,
  potentialScore: 1000,
  hintAvailable: true,
  errorMessage: null,
};

// ─── Actions ─────────────────────────────────────────────────────────────────

type Action =
  | { type: 'START_LOADING' }
  | { type: 'GENERATION_SUCCESS'; payload: BlackboxGameData }
  | { type: 'GENERATION_ERROR'; payload: string }
  | { type: 'REVEAL_CLUE' }
  | { type: 'SUBMIT_CORRECT'; payload: { score: number } }
  | { type: 'SUBMIT_FORFEIT' }
  | { type: 'NEXT_ROUND' }
  | { type: 'USE_HINT' }
  | { type: 'RESET' };

// ─── Reducer ─────────────────────────────────────────────────────────────────

function gameReducer(
  state: BlackboxGameState,
  action: Action
): BlackboxGameState {
  switch (action.type) {
    case 'START_LOADING':
      return { ...INITIAL_STATE, phase: 'loading' };

    case 'GENERATION_SUCCESS': {
      const gameData = action.payload;
      const currentRound = gameData.rounds[0];
      return {
        ...state,
        phase: 'round_active',
        gameData,
        currentRound,
        currentClueIndex: 1,
        potentialScore: 1000,
        hintAvailable: true,
        errorMessage: null,
      };
    }

    case 'GENERATION_ERROR':
      return { ...state, phase: 'error', errorMessage: action.payload };

    case 'REVEAL_CLUE': {
      const newClueIndex = Math.min(state.currentClueIndex + 1, 6);
      const hintPenalty = state.currentRound?.hintUsed ? 100 : 0;
      const newPotentialScore = Math.max(
        0,
        (SCORE_LADDER[newClueIndex] ?? 50) - hintPenalty
      );
      return {
        ...state,
        currentClueIndex: newClueIndex,
        potentialScore: newPotentialScore,
      };
    }

    case 'USE_HINT': {
      if (!state.hintAvailable || !state.currentRound) return state;
      const hintPenalty = 100;
      const newScore = Math.max(0, state.potentialScore - hintPenalty);
      const updatedRound: BlackboxRound = {
        ...state.currentRound,
        hintUsed: true,
      };
      return {
        ...state,
        hintAvailable: false,
        potentialScore: newScore,
        currentRound: updatedRound,
      };
    }

    case 'SUBMIT_CORRECT': {
      if (!state.gameData || !state.currentRound) return state;
      const idx = state.gameData.currentRoundIndex;
      const updatedRound: BlackboxRound = {
        ...state.currentRound,
        cluesRevealed: state.currentClueIndex,
        scoreEarned: action.payload.score,
        isCorrect: true,
      };
      const updatedRounds = [...state.gameData.rounds];
      updatedRounds[idx] = updatedRound;
      const newTotal =
        state.gameData.totalScore + action.payload.score;
      const updatedGameData: BlackboxGameData = {
        ...state.gameData,
        rounds: updatedRounds,
        totalScore: newTotal,
      };
      return {
        ...state,
        phase: 'round_result',
        gameData: updatedGameData,
        currentRound: updatedRound,
      };
    }

    case 'SUBMIT_FORFEIT': {
      if (!state.gameData || !state.currentRound) return state;
      const idx = state.gameData.currentRoundIndex;
      const updatedRound: BlackboxRound = {
        ...state.currentRound,
        cluesRevealed: state.currentClueIndex,
        scoreEarned: 0,
        isCorrect: false,
      };
      const updatedRounds = [...state.gameData.rounds];
      updatedRounds[idx] = updatedRound;
      const updatedGameData: BlackboxGameData = {
        ...state.gameData,
        rounds: updatedRounds,
      };
      return {
        ...state,
        phase: 'round_result',
        gameData: updatedGameData,
        currentRound: updatedRound,
      };
    }

    case 'NEXT_ROUND': {
      if (!state.gameData) return state;
      const currentIdx = state.gameData.currentRoundIndex;
      // After the 5th round (index 4) → game complete
      if (currentIdx >= 4) {
        const completedGameData: BlackboxGameData = {
          ...state.gameData,
          status: 'complete',
          completedAt: new Date(),
        };
        return {
          ...state,
          phase: 'game_complete',
          gameData: completedGameData,
        };
      }
      // Move to next round
      const nextIdx = currentIdx + 1;
      const nextRound = state.gameData.rounds[nextIdx];
      const updatedGameData: BlackboxGameData = {
        ...state.gameData,
        currentRoundIndex: nextIdx,
      };
      return {
        ...state,
        phase: 'round_active',
        gameData: updatedGameData,
        currentRound: nextRound,
        currentClueIndex: 1,
        potentialScore: 1000,
        hintAvailable: true,
      };
    }

    case 'RESET':
      return { ...INITIAL_STATE };

    default:
      return state;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseBlackBoxGameReturn {
  state: BlackboxGameState;
  startGeneration: (resourceText: string) => Promise<void>;
  revealNextClue: () => void;
  submitGuess: (guess: string) => void;
  forfeit: () => void;
  nextRound: () => void;
  useHint: () => string | null;
  reset: () => void;
  currentRoundNumber: number;
  totalRounds: number;
  progressPercent: number;
}

export function useBlackBoxGame(
  config: GameConfig,
  onScore?: (event: ScoreEvent) => void,
  onGameComplete?: (result: { totalScore: number; rounds: BlackboxRound[] }) => void
): UseBlackBoxGameReturn {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);
  const claudeService = new ClaudeService(config);

  const startGeneration = useCallback(
    async (resourceText: string) => {
      dispatch({ type: 'START_LOADING' });
      try {
        const prompt = buildBlackboxPrompt(resourceText);
        const rawText = await claudeService.generate(
          prompt,
          BLACK_BOX_SYSTEM_PROMPT
        );
        const parsed = cleanAndParseResponse(rawText);

        // Build BlackboxGameData from parsed response
        const gameId = generateId();
        const rounds: BlackboxRound[] = parsed.rounds
          .slice(0, 5)
          .map((r, i) => ({
            roundId: generateId(),
            roundNumber: i + 1,
            concept: r.concept,
            clues: r.clues,
            cluesRevealed: 0,
            hintUsed: false,
            scoreEarned: 0,
            isCorrect: false,
          }));

        const gameData: BlackboxGameData = {
          gameId,
          rounds,
          status: 'playing',
          totalScore: 0,
          currentRoundIndex: 0,
          startedAt: new Date(),
        };

        saveGame(gameData);
        dispatch({ type: 'GENERATION_SUCCESS', payload: gameData });
      } catch (err: any) {
        console.error('Generation failed:', err);
        dispatch({
          type: 'GENERATION_ERROR',
          payload: err?.message ?? 'Generation failed. Please try again.',
        });
      }
    },
    [config]
  );

  const revealNextClue = useCallback(() => {
    if (state.currentClueIndex >= 6) return;
    dispatch({ type: 'REVEAL_CLUE' });
  }, [state.currentClueIndex]);

  const submitGuess = useCallback(
    (guess: string) => {
      if (!state.currentRound || !state.gameData) return;
      const correct = validateGuess(guess, state.currentRound.concept);
      if (correct) {
        const score = calculateBlackboxScore(
          state.currentClueIndex,
          state.currentRound.hintUsed
        );
        dispatch({ type: 'SUBMIT_CORRECT', payload: { score } });
        onScore?.({
          gameId: state.gameData.gameId,
          roundId: state.currentRound.roundId,
          roundScore: score,
          sessionTotal: state.gameData.totalScore + score,
          cluesUsed: state.currentClueIndex,
          hintUsed: state.currentRound.hintUsed,
          isCorrect: true,
        });
      } else if (state.currentClueIndex >= 6) {
        // Wrong on last clue → forfeit
        dispatch({ type: 'SUBMIT_FORFEIT' });
        onScore?.({
          gameId: state.gameData.gameId,
          roundId: state.currentRound.roundId,
          roundScore: 0,
          sessionTotal: state.gameData.totalScore,
          cluesUsed: 6,
          hintUsed: state.currentRound.hintUsed,
          isCorrect: false,
        });
      }
      // Wrong but not last clue — do nothing, let user keep guessing
    },
    [state, onScore]
  );

  const forfeit = useCallback(() => {
    if (!state.currentRound || !state.gameData) return;
    dispatch({ type: 'SUBMIT_FORFEIT' });
    onScore?.({
      gameId: state.gameData.gameId,
      roundId: state.currentRound.roundId,
      roundScore: 0,
      sessionTotal: state.gameData.totalScore,
      cluesUsed: state.currentClueIndex,
      hintUsed: state.currentRound.hintUsed,
      isCorrect: false,
    });
  }, [state, onScore]);

  const nextRound = useCallback(() => {
    if (!state.gameData) return;
    const isLastRound = state.gameData.currentRoundIndex >= 4;
    if (isLastRound) {
      onGameComplete?.({
        totalScore: state.gameData.totalScore,
        rounds: state.gameData.rounds,
      });
    }
    dispatch({ type: 'NEXT_ROUND' });
  }, [state.gameData, onGameComplete]);

  const useHint = useCallback((): string | null => {
    if (!state.hintAvailable || !state.currentRound) return null;
    const concept = state.currentRound.concept;
    const words = concept.split(' ');
    const hint = words.map((w) => `${w[0].toUpperCase()}${'_'.repeat(w.length - 1)}`).join(' ');
    dispatch({ type: 'USE_HINT' });
    return hint;
  }, [state.hintAvailable, state.currentRound]);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const currentRoundNumber =
    (state.gameData?.currentRoundIndex ?? 0) + 1;
  const totalRounds = 5;
  const progressPercent =
    ((state.gameData?.currentRoundIndex ?? 0) / totalRounds) * 100;

  return {
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
  };
}
