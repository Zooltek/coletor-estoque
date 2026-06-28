import { useContext, useEffect, useRef } from 'react';
import { ScannerContext } from '../contexts/ScannerContext';

export function useScanner(options = {}) {
  const context = useContext(ScannerContext);

  if (!context) {
    throw new Error('useScanner must be used within a ScannerProvider');
  }

  const { onEvent } = options;
  const onEventRef = useRef(onEvent);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    if (onEventRef.current) {
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
