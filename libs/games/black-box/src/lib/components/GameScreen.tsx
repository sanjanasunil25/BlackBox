import React, { useState, useRef, useEffect } from 'react';
import type { BlackboxRound } from '@game-engine/types';

const SCORE_LADDER: Record<number, number> = {
  1: 1000, 2: 800, 3: 600, 4: 400, 5: 200, 6: 50,
};

interface GameScreenProps {
  round: BlackboxRound;
  currentClueIndex: number;
  potentialScore: number;
  hintAvailable: boolean;
  roundNumber: number;
  totalRounds: number;
  progressPercent: number;
  onSubmit: (guess: string) => void;
  onNextClue: () => void;
  onHint: () => string | null;
  onForfeit: () => void;
  onExit: () => void;
}

export function GameScreen({
  round,
  currentClueIndex,
  potentialScore,
  hintAvailable,
  roundNumber,
  totalRounds,
  progressPercent,
  onSubmit,
  onNextClue,
  onHint,
  onForfeit,
  onExit,
}: GameScreenProps) {
  const [guess, setGuess] = useState('');
  const [hintText, setHintText] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [showExit, setShowExit] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    setGuess('');
    setHintText(null);
  }, [round.roundId]);

  const handleSubmit = () => {
    if (!guess.trim()) return;
    onSubmit(guess.trim());
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const handleHint = () => {
    const hint = onHint();
    if (hint) setHintText(hint);
  };

  const nextScore = SCORE_LADDER[currentClueIndex + 1] ?? 0;
  const scoreDrop = potentialScore - nextScore;

  return (
    <div style={{
      background: '#07070f',
      minHeight: '100vh',
      fontFamily: 'Inter, system-ui, sans-serif',
      color: 'white',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        @keyframes clueSlide {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
        .bb-clue-card { animation: clueSlide 0.35s ease; }
        .bb-btn-hover:hover { opacity: 0.85; transform: translateY(-1px); }
      `}</style>

      {/* Top Bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 24px', maxWidth: '760px', margin: '0 auto',
      }}>
        <button
          id="exit-btn"
          className="bb-btn-hover"
          onClick={() => setShowExit(true)}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#94a3b8', borderRadius: '10px',
            padding: '8px 16px', fontSize: '13px', cursor: 'pointer',
          }}
        >← Exit</button>

        <span style={{ fontWeight: 900, fontSize: '16px', letterSpacing: '0.15em' }}>
          🔍 BLACK BOX
        </span>

        <span style={{
          background: 'rgba(99,102,241,0.15)',
          border: '1px solid rgba(99,102,241,0.3)',
          borderRadius: '999px', padding: '6px 16px',
          color: '#a5b4fc', fontSize: '13px', fontWeight: 600,
        }}>
          Round {roundNumber} of {totalRounds}
        </span>
      </div>

      {/* Progress Bar */}
      <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', width: '100%', marginBottom: '32px' }}>
        <div style={{
          height: '100%',
          background: 'linear-gradient(90deg, #6366f1, #a855f7)',
          transition: 'width 0.5s ease',
          width: `${progressPercent}%`,
        }} />
      </div>

      {/* Content */}
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 24px 40px' }}>

        {/* Score + Clue Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <div style={{
              fontSize: '2.5rem', fontWeight: 900,
              background: 'linear-gradient(135deg, #ffffff, #a5b4fc)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              lineHeight: 1,
            }}>
              {potentialScore.toLocaleString()}
            </div>
            <div style={{ fontSize: '11px', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>
              POTENTIAL SCORE
            </div>
          </div>
          <div style={{
            background: 'rgba(99,102,241,0.12)',
            border: '1px solid rgba(99,102,241,0.25)',
            borderRadius: '999px', padding: '6px 16px',
            color: '#818cf8', fontSize: '13px',
          }}>
            Clue {currentClueIndex} of 6
          </div>
        </div>

        {/* Clue Card */}
        <div
          key={`${round.roundId}-${currentClueIndex}`}
          className="bb-clue-card"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(168,85,247,0.05))',
            border: '1px solid rgba(99,102,241,0.2)',
            borderLeft: '4px solid #6366f1',
            borderRadius: '20px', padding: '36px',
            fontSize: '1.15rem', lineHeight: 1.9,
            color: '#f1f5f9', marginBottom: '28px',
          }}
        >
          {round.clues[currentClueIndex - 1]}
        </div>

        {/* Hint text */}
        {hintText && (
          <div style={{
            background: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.25)',
            borderRadius: '12px', padding: '12px 16px',
            color: '#f59e0b', fontSize: '14px',
            marginBottom: '16px', fontWeight: 600,
          }}>
            💡 Hint: {hintText}
          </div>
        )}

        {/* Guess Input Row */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <input
            id="guess-input"
            ref={inputRef}
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Your guess..."
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: `2px solid ${shake ? 'rgba(244,63,94,0.5)' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: '14px', padding: '16px 20px',
              color: 'white', fontSize: '16px', flex: 1, outline: 'none',
              fontFamily: 'Inter, system-ui, sans-serif',
              animation: shake ? 'shake 0.4s ease' : 'none',
              transition: 'border-color 0.2s',
            }}
          />
          <button
            id="submit-btn"
            className="bb-btn-hover"
            onClick={handleSubmit}
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white', border: 'none',
              borderRadius: '14px', padding: '16px 28px',
              fontWeight: 700, fontSize: '16px', cursor: 'pointer',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >Submit</button>
        </div>

        {/* Action Row */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            id="next-clue-btn"
            className="bb-btn-hover"
            onClick={onNextClue}
            disabled={currentClueIndex >= 6}
            style={{
              background: 'rgba(99,102,241,0.1)',
              border: '2px solid rgba(99,102,241,0.3)',
              color: '#818cf8', borderRadius: '14px',
              padding: '14px', fontWeight: 600,
              fontSize: '15px', cursor: currentClueIndex >= 6 ? 'not-allowed' : 'pointer',
              flex: 1, fontFamily: 'Inter, system-ui, sans-serif',
              opacity: currentClueIndex >= 6 ? 0.4 : 1,
            }}
          >
            {currentClueIndex < 6
              ? `Next Clue (−${Math.max(0, scoreDrop)} pts)`
              : 'All clues shown'}
          </button>

          <button
            id="hint-btn"
            className="bb-btn-hover"
            onClick={handleHint}
            disabled={!hintAvailable}
            style={{
              background: 'rgba(245,158,11,0.08)',
              border: '2px solid rgba(245,158,11,0.3)',
              color: '#f59e0b', borderRadius: '14px',
              padding: '14px', fontWeight: 600,
              fontSize: '15px', cursor: hintAvailable ? 'pointer' : 'not-allowed',
              flex: 1, fontFamily: 'Inter, system-ui, sans-serif',
              opacity: hintAvailable ? 1 : 0.4,
            }}
          >
            {hintAvailable ? '💡 Hint (−100 pts)' : '💡 Hint used'}
          </button>
        </div>

        {/* Forfeit */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            id="forfeit-btn"
            onClick={onForfeit}
            style={{
              background: 'transparent', border: 'none',
              color: '#4b5563', fontSize: '13px',
              cursor: 'pointer', textDecoration: 'underline',
            }}
          >
            Give up this round
          </button>
        </div>
      </div>

      {/* Exit Modal */}
      {showExit && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: '#0f0f1f',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px', padding: '36px',
            maxWidth: '360px', width: '90%',
            textAlign: 'center',
          }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 12px' }}>
              Exit Black Box?
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '15px', margin: '0 0 28px' }}>
              Your current round progress will be lost.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowExit(false)}
                style={{
                  flex: 1, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: 'white', border: 'none', borderRadius: '12px',
                  padding: '14px', fontWeight: 700, cursor: 'pointer',
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}
              >Keep Playing</button>
              <button
                onClick={onExit}
                style={{
                  flex: 1, background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#94a3b8', borderRadius: '12px',
                  padding: '14px', cursor: 'pointer',
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}
              >Exit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
