import React from 'react';
import type { BlackboxRound } from '@game-engine/types';

interface FinalSummaryProps {
  totalScore: number;
  rounds: BlackboxRound[];
  onPlayAgain: () => void;
}

export function FinalSummary({ totalScore, rounds, onPlayAgain }: FinalSummaryProps) {
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
        @keyframes bbTrophyIn {
          from { opacity: 0; transform: scale(0.7) rotate(-10deg); }
          to { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        .bb-trophy { animation: bbTrophyIn 0.5s ease; }
        .bb-btn-hover:hover { opacity: 0.9; transform: translateY(-1px); }
      `}</style>

      <div style={{ maxWidth: '600px', width: '100%', padding: '48px 0' }}>

        {/* Trophy */}
        <div
          className="bb-trophy"
          style={{
            width: '80px', height: '80px',
            background: 'rgba(99,102,241,0.15)',
            border: '2px solid #6366f1',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '36px',
            margin: '0 auto 24px',
            boxShadow: '0 0 40px rgba(99,102,241,0.3)',
          }}
        >🎯</div>

        {/* Title */}
        <h1 style={{
          background: 'linear-gradient(135deg, #ffffff, #a5b4fc)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: '2.5rem', fontWeight: 900,
          textAlign: 'center', margin: '0 0 16px',
        }}>
          Challenge Complete!
        </h1>

        {/* Total Score */}
        <div style={{
          background: 'linear-gradient(135deg, #ffffff, #a5b4fc)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: '4rem', fontWeight: 900,
          textAlign: 'center', lineHeight: 1,
        }}>
          {totalScore.toLocaleString()}
        </div>
        <div style={{
          color: '#4b5563', fontSize: '12px',
          textTransform: 'uppercase', letterSpacing: '0.1em',
          textAlign: 'center', marginBottom: '40px', marginTop: '4px',
        }}>
          TOTAL SCORE
        </div>

        {/* Round Breakdown Table */}
        <div style={{
          background: '#0f0f1f',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Round', 'Concept', 'Clues', 'Score'].map((h) => (
                  <th key={h} style={{
                    color: '#4b5563', fontSize: '11px',
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                    padding: '0 0 12px',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    textAlign: 'left', fontWeight: 600,
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rounds.map((round, i) => (
                <tr key={round.roundId}>
                  <td style={{
                    padding: '14px 0',
                    borderBottom: i < rounds.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    color: '#94a3b8', fontSize: '14px',
                  }}>
                    {i + 1}
                  </td>
                  <td style={{
                    padding: '14px 8px',
                    borderBottom: i < rounds.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    color: 'white', fontSize: '15px', fontWeight: 500,
                  }}>
                    {round.concept}
                  </td>
                  <td style={{
                    padding: '14px 8px',
                    borderBottom: i < rounds.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    color: '#94a3b8', fontSize: '14px',
                  }}>
                    {round.cluesRevealed}
                  </td>
                  <td style={{
                    padding: '14px 0',
                    borderBottom: i < rounds.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    fontSize: '15px', fontWeight: 700,
                    color: round.scoreEarned > 0 ? '#10b981' : '#f43f5e',
                  }}>
                    {round.scoreEarned > 0 ? `+${round.scoreEarned.toLocaleString()}` : '0'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Play Again */}
        <button
          id="play-again-btn"
          className="bb-btn-hover"
          onClick={onPlayAgain}
          style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)',
            color: 'white', border: 'none',
            borderRadius: '14px', padding: '18px',
            fontSize: '17px', fontWeight: 700,
            width: '100%', cursor: 'pointer',
            marginTop: '32px',
            boxShadow: '0 4px 24px rgba(99,102,241,0.4)',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          Play Again 🔄
        </button>
      </div>
    </div>
  );
}
