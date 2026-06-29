import React, { useEffect, useRef } from 'react';
import { useScanner } from '../../hooks/useScanner';

const ScannerView = React.memo(({ onScan }) => {
  const { start } = useScanner();
  const startedRef = useRef(false);

  useEffect(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      start("camera-reader-element", onScan).catch(err => {
        console.error("Erro ao iniciar o serviço de scanner:", err);
      });
    }
  }, [start, onScan]);

  // A renderização é única. O DOM interno (video) é gerido pela lib fora do ciclo React.
  return (
    <div id="camera-reader-element"></div>
  );
});

export default ScannerView;
