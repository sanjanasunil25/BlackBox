import React, { useState, useEffect } from 'react';

const MESSAGES = [
  "Cracking the black box... 🔍",
  "Analyzing your content... 🧠",
  "Extracting key concepts... 📖",
  "Generating questions... ⚡",
  "Almost there... 🎯"
];

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message }: LoadingScreenProps) {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false); // Start fading out
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % MESSAGES.length);
        setFade(true); // Start fading in new text
      }, 500); // Wait for fade out to complete
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Use the internal cycling message or an override from the parent.
  // The cycling will continue for the internal message even if overridden.
  const currentMessage = message || MESSAGES[index];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: '#07070f',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      fontFamily: 'Inter, system-ui, sans-serif',
      color: 'white',
      padding: '24px',
      textAlign: 'center',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        
        @keyframes bbPulseRotate {
          0% { transform: scale(1) rotate(0deg); opacity: 0.8; }
          50% { transform: scale(1.2) rotate(180deg); opacity: 1; }
          100% { transform: scale(1) rotate(360deg); opacity: 0.8; }
        }

        .bb-icon {
          animation: bbPulseRotate 3s infinite ease-in-out;
          filter: drop-shadow(0 0 20px rgba(99, 102, 241, 0.6));
        }

        .bb-text-container {
          transition: opacity 0.5s ease-in-out;
          height: 1.5em; /* Fixed height to prevent layout shift */
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .bb-glow {
          position: absolute;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
          pointer-events: none;
        }
      `}</style>
      
      <div className="bb-glow" />
      
      <div style={{ 
        fontSize: '84px', 
        marginBottom: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }} className="bb-icon">
        🔍
      </div>
      
      <div className="bb-text-container" style={{ opacity: fade ? 1 : 0 }}>
        <h2 style={{
          background: 'linear-gradient(135deg, #ffffff, #a5b4fc)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: '1.5rem',
          fontWeight: 700,
          margin: 0,
          letterSpacing: '-0.01em'
        }}>
          {currentMessage}
        </h2>
      </div>
      
      <div style={{ 
        marginTop: '64px',
        display: 'flex',
        gap: '8px',
      }}>
        {[0, 1, 2].map(i => (
          <div 
            key={i} 
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#6366f1',
              opacity: index % 3 === i ? 1 : 0.2,
              transition: 'opacity 0.3s'
            }}
          />
        ))}
      </div>
    </div>
  );
}
