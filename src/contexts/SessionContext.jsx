import React, { createContext, useState, useEffect } from 'react';
import { ScannerSessionManager, ScannerSessionEvent } from '../core/scanner/session';
import { useStableCallback } from '../hooks/performance/useStableCallback';

export const SessionContext = createContext();

export function SessionProvider({ children }) {
  const [snapshot, setSnapshot] = useState(ScannerSessionManager.getSnapshot());

  useEffect(() => {
    const unsubscribe = ScannerSessionManager.subscribe((event, newSnapshot) => {
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

  const resetSession = useStableCallback(() => {
    ScannerSessionManager.reset();
  });

  const value = {
    snapshot,
    resetSession
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}
