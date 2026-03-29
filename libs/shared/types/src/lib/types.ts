export interface GameConfig {
  apiKey: string;
  isDemo: boolean;
}

export type GameStatus =
  | 'idle'
  | 'generating'
  | 'ready'
  | 'playing'
  | 'complete'
  | 'error';

export type GamePhase =
  | 'start'
  | 'loading'
  | 'round_active'
  | 'round_result'
  | 'game_complete'
  | 'error';

export interface BlackboxRound {
  roundId: string;
  roundNumber: number;
  concept: string;
  clues: string[];
  cluesRevealed: number;
  hintUsed: boolean;
  scoreEarned: number;
  isCorrect: boolean;
}

export interface BlackboxGameData {
  gameId: string;
  rounds: BlackboxRound[];
  status: GameStatus;
  totalScore: number;
  currentRoundIndex: number;
  startedAt?: Date;
  completedAt?: Date;
}

export interface BlackboxGameState {
  gameData: BlackboxGameData | null;
  phase: GamePhase;
  currentRound: BlackboxRound | null;
  currentClueIndex: number;
  potentialScore: number;
  hintAvailable: boolean;
  errorMessage: string | null;
}

export interface ScoreEvent {
  gameId: string;
  roundId: string;
  roundScore: number;
  sessionTotal: number;
  cluesUsed: number;
  hintUsed: boolean;
  isCorrect: boolean;
}

export interface SessionResult {
  gameId: string;
  gameType: 'black-box';
  totalScore: number;
  roundsPlayed: number;
  rounds: BlackboxRound[];
  completedAt: Date;
}

export interface BlackboxApiResponse {
  rounds: Array<{
    concept: string;
    clues: string[];
  }>;
}
