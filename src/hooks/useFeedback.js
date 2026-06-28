import { useEffect, useRef } from 'react';
import FeedbackService from '../services/feedback/FeedbackService';
import { ScannerState, ScannerEvent } from '../core/scanner/state';

export function useFeedback(pipelineState) {
  // Use a ref to keep track of previous state to detect edges
  const prevStateRef = useRef(pipelineState);

  useEffect(() => {
    const prevState = prevStateRef.current;
    
    // Only trigger if state actually changed to avoid double sounds on re-renders
    if (pipelineState !== prevState) {
      if (pipelineState === ScannerState.SUCCESS) {
        FeedbackService.triggerSuccess();
      } else if (pipelineState === ScannerState.ERROR) {
        FeedbackService.triggerError();
      } else if (pipelineState === ScannerEvent.DUPLICATED) {
        FeedbackService.triggerDuplicate();
      }
    }
    
    prevStateRef.current = pipelineState;
  }, [pipelineState]);

  return {}; // No values to return, purely side-effect based
}
