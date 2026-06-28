import React from 'react';
import { useScanner } from '../../hooks/useScanner';
import { ScannerState } from '../../core/scanner/types';

export default function ScannerStatus() {
  const { error, state } = useScanner();

  if (state === ScannerState.ERROR || error) {
    return (
      <div className="scanner-error-hud">
        <p>{error?.message || 'Não foi possível acessar a câmera do leitor. Certifique-se de dar permissões ou usar HTTPS.'}</p>
        <button className="btn-retry-hud" onClick={() => window.location.reload()}>Recarregar App</button>
      </div>
    );
  }

  return null;
}
