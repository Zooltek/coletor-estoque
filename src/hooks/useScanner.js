import { useContext, useEffect, useRef } from 'react';
import { ScannerStateContext } from '../contexts/ScannerStateContext';

export function useScanner(options = {}) {
  const context = useContext(ScannerStateContext);

  if (!context) {
    throw new Error('useScanner must be used within a ScannerStateProvider');
  }

  const { onEvent } = options;
  const onEventRef = useRef(onEvent);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    if (onEventRef.current && context.subscribe) {
      const unsubscribe = context.subscribe((event, data) => {
        if (onEventRef.current) {
          onEventRef.current(event, data);
        }
      });
      return () => unsubscribe();
    }
  }, [context]);

  return context;
}
