import { useState, useEffect } from 'react';
import { DiagnosticsManager } from '../core/diagnostics';

export function useDiagnostics() {
  const [snapshot, setSnapshot] = useState(DiagnosticsManager.getSnapshot());
  const [timeline, setTimeline] = useState(DiagnosticsManager.getTimeline());

  useEffect(() => {
    // Ao montar o painel, inscreve-se
    const unsubscribe = DiagnosticsManager.subscribe((payload) => {
      setSnapshot(payload.snapshot);
      setTimeline([...payload.timeline]);
    });

    // Inicia o envio de eventos ativamente quando a UI de diagnóstico está aberta
    DiagnosticsManager.start();

    return () => {
      // Ao desmontar, para
      DiagnosticsManager.stop();
      unsubscribe();
    };
  }, []);

  return { 
    snapshot, 
    timeline,
    exportJSON: () => DiagnosticsManager.exportJSON(),
    exportTXT: () => DiagnosticsManager.exportTXT(),
    reset: () => DiagnosticsManager.reset()
  };
}
