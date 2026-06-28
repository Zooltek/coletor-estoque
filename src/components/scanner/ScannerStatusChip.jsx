import React from 'react';
import { ScannerState } from '../../core/scanner/types';
import { useScanner } from '../../hooks/useScanner';

export default function ScannerStatusChip() {
  const { state } = useScanner();

  const getStatusDisplay = () => {
    switch (state) {
      case ScannerState.READY:
        return { text: 'Pronto', icon: '🟢', className: 'status-ready' };
      case ScannerState.SCANNING:
        return { text: 'Lendo...', icon: '🔵', className: 'status-scanning' };
      case ScannerState.INITIALIZING:
        return { text: 'Iniciando', icon: '🟡', className: 'status-init' };
      case ScannerState.PAUSED:
        return { text: 'Pausado', icon: '⏸️', className: 'status-paused' };
      case ScannerState.ERROR:
        return { text: 'Erro', icon: '🔴', className: 'status-error' };
      default:
        return { text: 'Aguardando', icon: '⚪', className: 'status-idle' };
    }
  };

  const status = getStatusDisplay();

  return (
    <div className={`scanner-status-chip ${status.className}`}>
      <span className="ssc-icon">{status.icon}</span>
      <span className="ssc-text">{status.text}</span>
    </div>
  );
}
