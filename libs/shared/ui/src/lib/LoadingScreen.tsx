import React from 'react';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Crafting Your Challenge...' }: LoadingScreenProps) {
  return (
    <div style={{
      background: '#07070f',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <style>{`
        @keyframes bbPulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
      <div style={{
        background: '#0f0f1f',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '20px',
        padding: '48px 36px',
        textAlign: 'center',
        maxWidth: '400px',
        width: '100%',
        boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
      }}>
        <div style={{ fontSize: '64px', marginBottom: '24px' }}>🧠</div>
        <h2 style={{
          background: 'linear-gradient(135deg, #ffffff, #a5b4fc)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: '1.8rem',
          fontWeight: 800,
          margin: '0 0 12px',
        }}>
          {message}
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '15px', margin: '0 0 32px' }}>
          Analysing your document and generating clues...
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#6366f1',
                animation: `bbPulse 1.4s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
