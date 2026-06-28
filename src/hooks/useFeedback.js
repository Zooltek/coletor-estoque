import { useEffect, useRef } from 'react';
import FeedbackService from '../services/feedback/FeedbackService';
import { ScannerPipelineEvents } from '../core/scanner/ScannerPipeline';

export function useFeedback(pipelineState) {
  // Use a ref to keep track of previous state to detect edges
  const prevStateRef = useRef(pipelineState);

  useEffect(() => {
    const prevState = prevStateRef.current;
    
    // Only trigger if state actually changed to avoid double sounds on re-renders
    if (pipelineState !== prevState) {
      if (pipelineState === 'SUCCESS' || pipelineState === ScannerPipelineEvents.ACCEPTED) {
        FeedbackService.triggerSuccess();
      } else if (pipelineState === 'ERROR' || pipelineState === ScannerPipelineEvents.REJECTED) {
        FeedbackService.triggerError();
      } else if (pipelineState === ScannerPipelineEvents.DUPLICATED) {
        FeedbackService.triggerDuplicate();
      }
    }
    
    prevStateRef.current = pipelineState;
  }, [pipelineState]);

  return {}; // No values to return, purely side-effect based
}
