import React from 'react';
import { useScanner } from '../../hooks/useScanner';

export default function ScannerToolbar({ 
  soundMuted, 
  onToggleMute, 
  isFullscreen, 
  onToggleFullscreen 
}) {
  const { zoomLevel, setZoom, torchActive, toggleTorch, capabilities } = useScanner();

  return (
    <div className="scanner-controls-row">
      <button 
        type="button" 
        className={`btn-scanner-icon ${soundMuted ? 'muted' : ''}`}
        onClick={onToggleMute}
        title={soundMuted ? "Ativar som de bip" : "Mutar som de bip"}
      >
        {soundMuted ? '🔇' : '🔊'}
      </button>

      <div className="zoom-selector-group">
        <button 
          type="button" 
          className={`btn-zoom-option ${zoomLevel === 1 ? 'active' : ''}`}
          onClick={() => setZoom(1)}
        >
          1x
        </button>
        <button 
          type="button" 
          className={`btn-zoom-option ${zoomLevel === 2 ? 'active' : ''}`}
          onClick={() => setZoom(2)}
          disabled={capabilities && !capabilities.zoom}
        >
          2x
        </button>
        <button 
          type="button" 
          className={`btn-zoom-option ${zoomLevel === 3 ? 'active' : ''}`}
          onClick={() => setZoom(3)}
          disabled={capabilities && !capabilities.zoom}
        >
          3x
        </button>
      </div>

      <button 
        type="button" 
        className={`btn-scanner-icon torch ${torchActive ? 'active' : ''}`}
        onClick={() => toggleTorch(!torchActive)}
        title="Ligar/Desligar Lanterna"
      >
        🔦
      </button>

      <button 
        type="button" 
        className={`btn-scanner-icon fullscreen ${isFullscreen ? 'active' : ''}`}
        onClick={onToggleFullscreen}
        title={isFullscreen ? "Sair da Tela Cheia" : "Ocupar Tela Cheia"}
      >
        {isFullscreen ? '🔍' : '📐'}
      </button>
    </div>
  );
}
