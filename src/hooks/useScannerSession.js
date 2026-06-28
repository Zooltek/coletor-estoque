import { useState, useEffect } from 'react';
import { ScannerSessionManager, ScannerSessionEvent } from '../core/scanner/session';

export function useScannerSession() {
  const [snapshot, setSnapshot] = useState(ScannerSessionManager.getSnapshot());

  useEffect(() => {
    const unsubscribe = ScannerSessionManager.subscribe((event, newSnapshot) => {
      // Opcional: filtrar apenas quando evento for relevante
      if (
        event === ScannerSessionEvent.SESSION_UPDATED || 
        event === ScannerSessionEvent.SESSION_STARTED || 
        event === ScannerSessionEvent.SESSION_FINISHED ||
        event === ScannerSessionEvent.SESSION_RESET
      ) {
        setSnapshot(newSnapshot);
      }
    });

    return () => unsubscribe();
  }, []);

  return snapshot;
}
