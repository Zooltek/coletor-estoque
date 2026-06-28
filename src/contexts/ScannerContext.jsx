import React, { createContext, useState, useCallback, useEffect, useRef } from 'react';
import ScannerService from '../services/scanner/ScannerService';
import { ScannerState } from '../core/scanner/types';
import { ScannerEvents } from '../core/scanner/events';

export const ScannerContext = createContext();

export function ScannerProvider({ children }) {
  const [state, setState] = useState(ScannerState.IDLE);
  const [lastScan, setLastScan] = useState(null);
  const [error, setError] = useState(null);
  
  const [zoomLevel, setZoomLevel] = useState(1);
  const [torchActive, setTorchActive] = useState(false);
  const [capabilities, setCapabilities] = useState(null);

  // Subscribers for events if needed
  const listeners = useRef(new Set());

  const emit = useCallback((event, data) => {
    listeners.current.forEach(listener => listener(event, data));
  }, []);

  const subscribe = useCallback((callback) => {
    listeners.current.add(callback);
    return () => listeners.current.delete(callback);
  }, []);

  const initialize = useCallback(async () => {
    setState(ScannerState.INITIALIZING);
    try {
      await ScannerService.initialize();
      setState(ScannerState.READY);
      emit(ScannerEvents.READY);
    } catch (err) {
      setError(err);
      setState(ScannerState.ERROR);
      emit(ScannerEvents.ERROR, err);
    }
  }, [emit]);

  const start = useCallback(async (elementId, onScanCallback) => {
    try {
      await ScannerService.start(elementId, (code) => {
        const result = { code, timestamp: Date.now() };
        setLastScan(result);
        emit(ScannerEvents.DETECTED, result);
        if (onScanCallback) onScanCallback(code);
      });
      
      const caps = ScannerService.getCapabilities();
      setCapabilities(caps);
      
      setState(ScannerState.SCANNING);
      emit(ScannerEvents.STARTED);
    } catch (err) {
      setError(err);
      setState(ScannerState.ERROR);
      emit(ScannerEvents.ERROR, err);
      throw err;
    }
  }, [emit]);

  const stop = useCallback(async () => {
    try {
      await ScannerService.stop();
      setState(ScannerState.IDLE);
      setLastScan(null);
      setTorchActive(false);
      setZoomLevel(1);
      emit(ScannerEvents.STOPPED);
    } catch (err) {
      console.error('Error stopping scanner:', err);
    }
  }, [emit]);

  const pause = useCallback(async () => {
    try {
      await ScannerService.pause();
      setState(ScannerState.PAUSED);
    } catch (err) {
      console.error('Error pausing scanner:', err);
    }
  }, []);

  const resume = useCallback(async () => {
    try {
      await ScannerService.resume();
      setState(ScannerState.SCANNING);
    } catch (err) {
      console.error('Error resuming scanner:', err);
    }
  }, []);

  const setZoom = useCallback(async (level) => {
    try {
      await ScannerService.setZoom(level);
      setZoomLevel(level);
      emit(ScannerEvents.ZOOM_CHANGED, level);
    } catch (err) {
      console.error('Error setting zoom:', err);
    }
  }, [emit]);

  const toggleTorch = useCallback(async (active) => {
    try {
      await ScannerService.toggleTorch(active);
      setTorchActive(active);
      emit(ScannerEvents.TORCH_CHANGED, active);
    } catch (err) {
      console.error('Error toggling torch:', err);
    }
  }, [emit]);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  const value = {
    state,
    lastScan,
    error,
    zoomLevel,
    torchActive,
    capabilities,
    initialize,
    start,
    stop,
    pause,
    resume,
    setZoom,
    toggleTorch,
    subscribe
  };

  return (
    <ScannerContext.Provider value={value}>
      {children}
    </ScannerContext.Provider>
  );
}
