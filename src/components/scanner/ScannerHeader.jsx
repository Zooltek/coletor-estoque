import React from 'react';
import { useScanner } from '../../hooks/useScanner';

export default function ScannerHeader({ title, onClose, soundMuted, onToggleMute }) {
  const { torchActive, toggleTorch, capabilities } = useScanner();

  return (
    <div className="scanner-professional-header">
      <div className="sph-left">
        <span className="sph-title">← {title || 'Inventário'}</span>
      </div>
      <div className="sph-right">
        {capabilities?.torch && (
          <button 
            type="button" 
            className={`sph-btn ${torchActive ? 'active' : ''}`}
            onClick={() => toggleTorch(!torchActive)}
            title="Lanterna"
          >
            🔦
          </button>
        )}
        <button 
          type="button" 
          className={`sph-btn ${soundMuted ? 'muted' : ''}`}
          onClick={onToggleMute}
          title="Som"
        >
          {soundMuted ? '🔇' : '🔊'}
        </button>
        <button type="button" className="sph-btn sph-close" onClick={onClose} title="Fechar">
          ✕
        </button>
      </div>
    </div>
  );
}
