import { useState, useEffect, useRef, useCallback } from 'react';
import ScannerPipeline from '../core/scanner/ScannerPipeline';

export function useScannerPipeline(onValidateScan) {
  const [pipelineState, setPipelineState] = useState('INITIALIZING');
  const pipelineRef = useRef(null);

  // Keep a fresh reference to the validation callback
  const validateRef = useRef(onValidateScan);
  useEffect(() => {
    validateRef.current = onValidateScan;
  }, [onValidateScan]);

  useEffect(() => {
    const pipeline = new ScannerPipeline((newState) => {
      setPipelineState(newState);
    });
    
    pipelineRef.current = pipeline;
    
    // Simulate initial READY state after mount
    setTimeout(() => {
      pipeline.setState('READY');
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
