import React, { useRef, useState, useCallback } from 'react';
import { extractTextFromPDF } from '@game-engine/resource';

interface StartScreenProps {
  onStart: (text: string) => void;
  isLoading?: boolean;
  errorMessage?: string | null;
}

export function StartScreen({ onStart, isLoading, errorMessage }: StartScreenProps) {
  const [text, setText] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [pdfStatus, setPdfStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.includes('pdf')) {
      setPdfStatus('Please upload a PDF file.');
      return;
    }
    setPdfStatus('Extracting text from PDF...');
    try {
      const extracted = await extractTextFromPDF(file);
      setText(extracted);
      setPdfStatus(`✓ Extracted ${extracted.length.toLocaleString()} characters`);
    } catch {
      setPdfStatus('Failed to extract PDF. Please paste text instead.');
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleGenerate = () => {
    if (!text.trim()) return;
    onStart(text.trim());
  };

  return (
    <div style={{
      background: '#07070f',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, system-ui, sans-serif',
      padding: '20px',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        .bb-gen-btn:hover { opacity: 0.9; transform: translateY(-1px); }
        .bb-dropzone:hover { border-color: rgba(99,102,241,0.7) !important; }
        .bb-textarea:focus { border-color: rgba(99,102,241,0.5) !important; }
      `}</style>

      <div style={{ maxWidth: '560px', width: '100%' }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '100px', height: '100px',
            background: 'rgba(99,102,241,0.2)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 0 60px rgba(99,102,241,0.4)',
            fontSize: '48px',
          }}>🔍</div>
          <h1 style={{
            background: 'linear-gradient(135deg, #ffffff, #a5b4fc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '3rem',
            fontWeight: 900,
            textAlign: 'center',
            letterSpacing: '-0.02em',
            margin: '0 0 8px',
          }}>BLACK BOX</h1>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem', textAlign: 'center', margin: 0 }}>
            Upload a resource. Crack the concept.
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#0f0f1f',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '20px',
          padding: '36px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
        }}>
          {/* Drop Zone */}
          <div
            className="bb-dropzone"
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            style={{
              border: `2px dashed ${dragOver ? 'rgba(99,102,241,0.8)' : 'rgba(99,102,241,0.4)'}`,
              borderRadius: '14px',
              padding: '32px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'border-color 0.2s',
              background: dragOver ? 'rgba(99,102,241,0.05)' : 'transparent',
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📄</div>
            <p style={{ color: 'white', fontWeight: 600, fontSize: '15px', margin: '0 0 4px' }}>
              Drop PDF here or click to browse
            </p>
            <p style={{ color: '#6366f1', fontSize: '13px', margin: 0 }}>
              Supported: PDF files
            </p>
            {pdfStatus && (
              <p style={{
                color: pdfStatus.startsWith('✓') ? '#10b981' : '#f59e0b',
                fontSize: '13px',
                marginTop: '10px',
                marginBottom: 0,
              }}>
                {pdfStatus}
              </p>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            style={{ display: 'none' }}
            onChange={handleFileInput}
          />

          {/* OR Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
            <span style={{ color: '#4b5563', fontSize: '13px' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
          </div>

          {/* Textarea */}
          <textarea
            className="bb-textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your resource text here..."
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '14px',
              padding: '16px',
              color: 'white',
              fontSize: '15px',
              resize: 'vertical',
              minHeight: '120px',
              width: '100%',
              outline: 'none',
              fontFamily: 'Inter, system-ui, sans-serif',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s',
            }}
          />

          {/* Error */}
          {errorMessage && (
            <div style={{
              background: 'rgba(244,63,94,0.1)',
              border: '1px solid rgba(244,63,94,0.3)',
              borderRadius: '10px',
              padding: '12px 16px',
              color: '#f43f5e',
              fontSize: '14px',
              marginTop: '16px',
            }}>
              ⚠️ {errorMessage}
            </div>
          )}

          {/* Generate Button */}
          <button
            id="generate-btn"
            className="bb-gen-btn"
            onClick={handleGenerate}
            disabled={!text.trim() || isLoading}
            style={{
              background: text.trim() && !isLoading
                ? 'linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)'
                : 'rgba(255,255,255,0.06)',
              color: 'white',
              border: 'none',
              borderRadius: '14px',
              padding: '16px',
              fontSize: '17px',
              fontWeight: 700,
              width: '100%',
              cursor: text.trim() && !isLoading ? 'pointer' : 'not-allowed',
              marginTop: '24px',
              boxShadow: text.trim() && !isLoading ? '0 4px 24px rgba(99,102,241,0.4)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            {isLoading ? 'Generating...' : 'Generate My Challenge →'}
          </button>
        </div>
      </div>
    </div>
  );
}
