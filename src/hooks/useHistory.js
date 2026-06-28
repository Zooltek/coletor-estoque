import { useState, useEffect } from 'react';
import HistoryService from '../services/history/HistoryService';

export function useHistory() {
  const [history, setHistory] = useState(() => HistoryService.getRecords());

  useEffect(() => {
    const unsubscribe = HistoryService.subscribe((event, payload, records) => {
      setHistory([...records]);
    });
    return () => unsubscribe();
  }, []);

  return {
    history
  };
}
