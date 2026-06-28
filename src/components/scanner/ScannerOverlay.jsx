import React from 'react';
import { useScanner } from '../../hooks/useScanner';
import { ScannerState } from '../../core/scanner/types';

export default function ScannerOverlay({ showFeedback }) {
  const { state } = useScanner();
  const isPaused = state === ScannerState.PAUSED;

  return (
    <>
      <div className={`scanner-target-reticle ${showFeedback ? 'confirmed-green' : isPaused ? 'paused-yellow' : 'searching-blue'}`}>
        <div className="corner top-left"></div>
        <div className="corner top-right"></div>
        <div className="corner bottom-left"></div>
        <div className="corner bottom-right"></div>
        
        <div className="reticle-status-text">
          {showFeedback ? "🟢 Confirmado!" : isPaused ? "🟡 Aguardando..." : "🟡 Procurando..."}
        </div>
      </div>

      {isPaused && (
        <div className="scanner-paused-overlay">
          <span>Aguardando Confirmação...</span>
        </div>
      )}
    </>
  );
}
