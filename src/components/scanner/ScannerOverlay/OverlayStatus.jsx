import React from 'react';

const OverlayStatus = React.memo(({ state }) => {
  const getStatusText = () => {
    switch (state) {
      case 'INITIALIZING': return 'Inicializando câmera...';
      case 'READY': return 'Posicione o código dentro da área';
      case 'SCANNING': return 'Código detectado...';
      case 'SUCCESS': return 'Leitura confirmada';
      case 'ERROR': return 'Não foi possível ler';
      case 'PAUSED': return 'Leitor pausado';
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
