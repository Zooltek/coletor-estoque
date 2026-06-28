import React from 'react';
import { ScannerState } from '../../../core/scanner/state';

const OverlayStatus = React.memo(({ state }) => {
  const getStatusText = () => {
    switch (state) {
      case ScannerState.INITIALIZING: return 'Inicializando câmera...';
      case ScannerState.READY: return 'Posicione o código dentro da área';
      case ScannerState.DETECTING: return 'Código detectado...';
      case ScannerState.PROCESSING: return 'Processando...';
      case ScannerState.SUCCESS: return 'Leitura confirmada';
      case ScannerState.ERROR: return 'Não foi possível ler';
      case ScannerState.PAUSED: return 'Leitor pausado';
      default: return '';
    }
  };

  return (
    <div className="so-status-area">
      <span className={`so-status-text state-${state.toLowerCase()}`}>
        {getStatusText()}
      </span>
      {state === 'READY' && (
        <span className="so-status-hint">Mantenha aproximadamente 10–20 cm</span>
      )}
    </div>
  );
});

export default OverlayStatus;
