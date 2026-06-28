import React, { useEffect, useRef } from 'react';
import { useScanner } from '../../hooks/useScanner';
import { ScannerState } from '../../core/scanner/types';

export default function ScannerView({ onScan }) {
  const { start, state } = useScanner();
  const startedRef = useRef(false);

  useEffect(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      start("camera-reader-element", onScan).catch(err => {
        console.error("Erro ao iniciar o serviço de scanner:", err);
      });
    }
  }, [start, onScan]);

  const isScanning = state === ScannerState.SCANNING;

  return (
    <>
      <div id="camera-reader-element"></div>
      {isScanning && <div className="scanner-laser-line"></div>}
    </>
  );
}
