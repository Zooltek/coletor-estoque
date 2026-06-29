import React, { useState, useEffect } from 'react';
import { ScannerState } from '../../../core/scanner/state';

const ScannerStatusIndicator = React.memo(({ subscribePipeline, pipelineRef }) => {
  const [pipelineState, setPipelineState] = useState(() => 
    pipelineRef?.current ? pipelineRef.current.state : ScannerState.INITIALIZING
  );

  useEffect(() => {
    if (subscribePipeline) {
      return subscribePipeline((newState) => {
        setPipelineState(newState);
      });
    }
  }, [subscribePipeline]);

  let statusClass = 'status-ready'; // fallback/ready
  
  switch (pipelineState) {
    case ScannerState.DETECTING:
    case ScannerState.PROCESSING:
    case ScannerState.COOLDOWN:
      statusClass = 'status-processing';
      break;
    case ScannerState.ERROR:
      statusClass = 'status-error';
      break;
    case ScannerState.PAUSED:
      statusClass = 'status-paused';
      break;
    case ScannerState.READY:
    case ScannerState.SUCCESS:
    default:
      statusClass = 'status-ready';
      break;
  }

  return (
    <div className={`toolbar-status-dot ${statusClass}`} title={`Status: ${pipelineState}`}></div>
  );
});

export default ScannerStatusIndicator;
