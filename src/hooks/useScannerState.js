import { useState, useEffect } from 'react';
import { ScannerEvent } from '../core/scanner/state';

export function useScannerState(pipelineRef) {
  const [currentState, setCurrentState] = useState('INITIALIZING');
  const [lastEvent, setLastEvent] = useState(null);

  useEffect(() => {
    if (!pipelineRef || !pipelineRef.current) return;
    
    // Check if the pipeline exposes its FSM directly
    const fsm = pipelineRef.current.fsm;
    if (!fsm) return;

    setCurrentState(fsm.getState());

    const unsubscribe = fsm.subscribe((event, state, payload) => {
      setLastEvent({ event, payload, timestamp: Date.now() });
      if (event === ScannerEvent.STATE_CHANGED) {
        setCurrentState(state);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [pipelineRef]);

  return {
    currentState,
    lastEvent
  };
}
