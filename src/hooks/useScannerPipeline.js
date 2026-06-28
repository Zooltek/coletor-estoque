import { useState, useEffect, useRef, useCallback } from 'react';
import ScannerPipeline from '../core/scanner/ScannerPipeline';
import { ScannerState, ScannerEvent } from '../core/scanner/state';
import HistoryService from '../services/history/HistoryService';

export function useScannerPipeline(onValidateScan) {
  const [pipelineState, setPipelineState] = useState(ScannerState.INITIALIZING);
  const pipelineRef = useRef(null);

  // Keep a fresh reference to the validation callback
  const validateRef = useRef(onValidateScan);
  useEffect(() => {
    validateRef.current = onValidateScan;
  }, [onValidateScan]);

  useEffect(() => {
    const pipeline = new ScannerPipeline((newState, payload) => {
      setPipelineState(newState);
      
      // Notify History Service based on events
      if (newState === ScannerState.SUCCESS) {
        HistoryService.add(payload?.barcode || 'unknown', 'SUCCESS', null, '', 1);
      } else if (newState === ScannerState.ERROR) {
        HistoryService.add(payload?.barcode || 'error', 'ERROR', null, payload?.error?.message || 'Error', 1);
      } else if (newState === ScannerEvent.DUPLICATED) {
        HistoryService.add(payload || 'duplicated', 'DUPLICATE', null, 'Leitura Duplicada', 1);
      }
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

  const processScan = useCallback(async (code) => {
    if (pipelineRef.current) {
      await pipelineRef.current.processRead(code, validateRef.current);
    }
  }, []);

  const pausePipeline = useCallback(() => {
    if (pipelineRef.current) {
      pipelineRef.current.pause();
    }
  }, []);

  const resumePipeline = useCallback(() => {
    if (pipelineRef.current) {
      pipelineRef.current.resume();
    }
  }, []);

  return {
    pipelineState,
    processScan,
    pausePipeline,
    resumePipeline
  };
}
