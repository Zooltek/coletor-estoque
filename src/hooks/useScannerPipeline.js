import { useEffect, useRef, useCallback } from 'react';
import ScannerPipeline from '../core/scanner/ScannerPipeline';
import { ScannerState } from '../core/scanner/state';
import { useStableCallback } from './performance/useStableCallback';

export function useScannerPipeline(onValidateScan) {
  const pipelineRef = useRef(null);
  
  // Guardamos callbacks para os componentes escutarem os eventos se precisarem (ex: Overlay)
  const listeners = useRef(new Set());

  const subscribe = useStableCallback((callback) => {
    listeners.current.add(callback);
    // Dispara estado atual imediatamente ao assinar
    if (pipelineRef.current) {
      callback(pipelineRef.current.state, null);
    }
    return () => listeners.current.delete(callback);
  });

  const validateRef = useRef(onValidateScan);
  useEffect(() => {
    validateRef.current = onValidateScan;
  }, [onValidateScan]);

  useEffect(() => {
    const pipeline = new ScannerPipeline((newState, payload) => {
      // Repassa eventos para quem assinou (ex: componentes locais)
      listeners.current.forEach(listener => listener(newState, payload));
    });
    
    pipelineRef.current = pipeline;
    
    // Simulate initial READY state after mount
    setTimeout(() => {
      if (pipeline.state === ScannerState.INITIALIZING) {
        pipeline.transition(ScannerState.READY, null, 'Component mounted');
      }
    }, 500);

    return () => {
      pipeline.destroy();
    };
  }, []);

  const processScan = useStableCallback(async (code) => {
    if (pipelineRef.current) {
      await pipelineRef.current.processRead(code, validateRef.current);
    }
  });

  const pausePipeline = useStableCallback(() => {
    if (pipelineRef.current) {
      pipelineRef.current.pause();
    }
  });

  const resumePipeline = useStableCallback(() => {
    if (pipelineRef.current) {
      pipelineRef.current.resume();
    }
  });

  // Retornamos pipelineRef para acessar get state() sem forçar renders,
  // e subscribe para componentes menores ouvirem mudanças
  return {
    pipelineRef,
    subscribe,
    processScan,
    pausePipeline,
    resumePipeline
  };
}
