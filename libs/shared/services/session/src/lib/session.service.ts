import type { BlackboxGameData } from '@game-engine/types';

const KEY_PREFIX = 'game_engine_black_box_';

export function saveGame(gameData: BlackboxGameData): void {
  try {
    sessionStorage.setItem(
      KEY_PREFIX + gameData.gameId,
      JSON.stringify(gameData)
    );
  } catch (e) {
    console.warn('Session storage save failed:', e);
  }
}

export function loadGame(gameId: string): BlackboxGameData | null {
  try {
    const raw = sessionStorage.getItem(KEY_PREFIX + gameId);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearGame(gameId: string): void {
  try {
    sessionStorage.removeItem(KEY_PREFIX + gameId);
  } catch {
    // ignore
  }
}
