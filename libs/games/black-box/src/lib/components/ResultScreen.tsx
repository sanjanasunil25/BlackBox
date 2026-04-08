import React from 'react';
import type { BlackboxRound } from '@game-engine/types';

interface ResultScreenProps {
  round: BlackboxRound;
  roundNumber: number;
  totalRounds: number;
  onNextRound: () => void;
  onExit: () => void;
}

export function ResultScreen({
  round,
  roundNumber,
  totalRounds,
  onNextRound,
  onExit,
}: ResultScreenProps) {
  const isCorrect = round.isCorrect;
  const isLastRound = roundNumber >= totalRounds;

  return (
    <div style={{
      background: '#07070f',
      minHeight: '100vh',
      fontFamily: 'Inter, system-ui, sans-serif',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        @keyframes bbResultIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        .bb-result-circle { animation: bbResultIn 0.4s ease; }
        .bb-btn-hover:hover { opacity: 0.9; transform: translateY(-1px); }
      `}</style>

      <div style={{ maxWidth: '560px', width: '100%', textAlign: 'center', padding: '48px 0' }}>

        {/* Result circle */}
        <div
          className="bb-result-circle"
          style={{
            width: '80px', height: '80px',
            background: isCorrect ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)',
            border: `2px solid ${isCorrect ? '#10b981' : '#f43f5e'}`,
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '36px',
            margin: '0 auto 24px',
            boxShadow: isCorrect
              ? '0 0 40px rgba(16,185,129,0.3)'
              : '0 0 40px rgba(244,63,94,0.3)',
          }}
        >
          {isCorrect ? '✅' : '❌'}
        </div>

        {/* Heading */}
        <h2 style={{
          fontSize: '2.5rem', fontWeight: 900,
          color: isCorrect ? '#10b981' : '#f43f5e',
          margin: '0 0 8px',
        }}>
          {isCorrect ? 'Correct!' : 'Not this time!'}
        </h2>

        <p style={{ color: '#94a3b8', fontSize: '15px', margin: '0 0 8px' }}>
          The answer was:
        </p>
        <p style={{ fontSize: '2rem', fontWeight: 800, color: 'white', margin: '0 0 32px' }}>
          {round.concept}
        </p>

        {/* Stat Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          marginBottom: '32px',
        }}>
          {[
            { label: 'CLUES USED', value: round.cluesRevealed },
            { label: 'HINT USED', value: round.hintUsed ? 'Yes' : 'No' },
            {
              label: 'SCORE EARNED',
              value: round.scoreEarned.toLocaleString(),
              green: isCorrect,
            },
          ].map(({ label, value, green }) => (
            <div key={label} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '16px',
              padding: '20px',
            }}>
              <div style={{
                fontSize: '1.8rem', fontWeight: 800,
                color: green ? '#10b981' : 'white',
              }}>
                {value}
              </div>
              <div style={{
                fontSize: '11px', color: '#4b5563',
                textTransform: 'uppercase', letterSpacing: '0.08em',
                marginTop: '4px',
              }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Clue review on forfeit */}
        {!isCorrect && (
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '24px',
            textAlign: 'left',
          }}>
            <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 600, margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              All Clues
            </p>
            {round.clues.map((clue, i) => (
              <div key={i} style={{
                display: 'flex', gap: '12px',
                marginBottom: '12px', fontSize: '14px',
                color: '#94a3b8', alignItems: 'flex-start',
              }}>
                <span style={{
                  background: 'rgba(99,102,241,0.2)',
                  borderRadius: '999px',
                  padding: '2px 10px',
                  color: '#818cf8',
                  fontSize: '12px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}>
                  {i + 1}
                </span>
                <span>{clue}</span>
              </div>
            ))}
          </div>
        )}

        {/* Next Round / Final */}
        <button
          id="next-round-btn"
          className="bb-btn-hover"
          onClick={onNextRound}
          style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)',
            color: 'white', border: 'none',
            borderRadius: '14px', padding: '18px',
            fontSize: '17px', fontWeight: 700,
            width: '100%', cursor: 'pointer',
            boxShadow: '0 4px 24px rgba(99,102,241,0.4)',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          {isLastRound ? 'See Final Results →' : 'Next Round →'}
        </button>

        <button
          id="exit-result-btn"
          className="bb-btn-hover"
          onClick={onExit}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.06)',
            color: '#4b5563', borderRadius: '14px',
            padding: '14px', width: '100%',
            cursor: 'pointer', marginTop: '10px',
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '15px',
          }}
        >
          Exit
        </button>
      </div>
    </div>
  );
}
