import React, { createContext, useState, useCallback, useEffect, useRef } from 'react';
import ScannerFactory from '../services/scanner/ScannerFactory';
import { ScannerState } from '../core/scanner/types';
import { ScannerEvents } from '../core/scanner/events';
import { useStableCallback } from '../hooks/performance/useStableCallback';

export const ScannerStateContext = createContext();

export function ScannerStateProvider({ children }) {
  const [state, setState] = useState(ScannerState.IDLE);
  const [error, setError] = useState(null);

  // Subscribers for events
  const listeners = useRef(new Set());

  const emit = useStableCallback((event, data) => {
    listeners.current.forEach(listener => listener(event, data));
  });

  const subscribe = useStableCallback((callback) => {
    listeners.current.add(callback);
    return () => listeners.current.delete(callback);
  });

  const getScanner = async () => {
      return await ScannerFactory.getScanner();
  };

  const initialize = useStableCallback(async () => {
    setState(ScannerState.INITIALIZING);
    try {
      const scanner = await getScanner();
      await scanner.initialize();
      setState(ScannerState.READY);
      emit(ScannerEvents.READY);
    } catch (err) {
      setError(err);
      setState(ScannerState.ERROR);
      emit(ScannerEvents.ERROR, err);
    }
  });

  const start = useStableCallback(async (elementId, onScanCallback) => {
    try {
      const scanner = await getScanner();
      await scanner.start(elementId, (code) => {
        const result = { code, timestamp: Date.now() };
        emit(ScannerEvents.DETECTED, result);
        if (onScanCallback) onScanCallback(code);
      });
      
      setState(ScannerState.SCANNING);
      emit(ScannerEvents.STARTED);
    } catch (err) {
      setError(err);
      setState(ScannerState.ERROR);
      emit(ScannerEvents.ERROR, err);
      throw err;
    }
  });

  const stop = useStableCallback(async () => {
    try {
      const scanner = await getScanner();
      await scanner.stop();
      setState(ScannerState.IDLE);
      emit(ScannerEvents.STOPPED);
    } catch (err) {
      console.error('Error stopping scanner:', err);
    }
  });

  const pause = useStableCallback(async () => {
    try {
      const scanner = await getScanner();
      await scanner.pause();
      setState(ScannerState.PAUSED);
    } catch (err) {
      console.error('Error pausing scanner:', err);
    }
  });

  const resume = useStableCallback(async () => {
    try {
      const scanner = await getScanner();
      await scanner.resume();
      setState(ScannerState.SCANNING);
    } catch (err) {
      console.error('Error resuming scanner:', err);
    }
  });

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  const value = {
    state,
    error,
    initialize,
    start,
    stop,
    pause,
    resume,
    subscribe
  };

  return (
    <ScannerStateContext.Provider value={value}>
      {children}
    </ScannerStateContext.Provider>
  );
}
