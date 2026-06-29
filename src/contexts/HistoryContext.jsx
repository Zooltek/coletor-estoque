import React, { createContext, useState } from 'react';
import { useStableCallback } from '../hooks/performance/useStableCallback';

export const HistoryContext = createContext();

export function HistoryProvider({ children }) {
  const [history, setHistory] = useState([]);

  const addHistoryItem = useStableCallback((item) => {
    // Insere no topo sem reconstruir deep (apenas prev + concat)
    setHistory(prev => [item, ...prev]);
  });
  
  const clearHistory = useStableCallback(() => {
    setHistory([]);
  });

  const value = {
    history,
    addHistoryItem,
    clearHistory
  };

  return (
    <HistoryContext.Provider value={value}>
      {children}
    </HistoryContext.Provider>
  );
}
