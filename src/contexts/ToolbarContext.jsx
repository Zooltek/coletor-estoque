import React, { createContext, useState, useEffect } from 'react';
import ScannerFactory from '../services/scanner/ScannerFactory';
import { useStableCallback } from '../hooks/performance/useStableCallback';

export const ToolbarContext = createContext();

export function ToolbarProvider({ children }) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [torchActive, setTorchActive] = useState(false);
  const [capabilities, setCapabilities] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const scanner = await ScannerFactory.getScanner();
        if (mounted) {
            setCapabilities(scanner.getCapabilities());
        }
      } catch (e) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);

  const setZoom = useStableCallback(async (level) => {
    try {
      const scanner = await ScannerFactory.getScanner();
      await scanner.setZoom(level);
      setZoomLevel(level);
    } catch (err) {
      console.error('Error setting zoom:', err);
    }
  });

  const toggleTorch = useStableCallback(async (active) => {
    try {
      const scanner = await ScannerFactory.getScanner();
      await scanner.toggleTorch(active);
      setTorchActive(active);
    } catch (err) {
      console.error('Error toggling torch:', err);
    }
  });

  const value = {
    zoomLevel,
    torchActive,
    capabilities,
    setZoom,
    toggleTorch
  };

  return (
    <ToolbarContext.Provider value={value}>
      {children}
    </ToolbarContext.Provider>
  );
}
