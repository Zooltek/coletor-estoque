import React from 'react';

const ScannerStatusIndicator = React.memo(({ pipelineState }) => {
  let statusClass = 'status-ready'; // fallback/ready
  
  switch (pipelineState) {
    case 'PROCESSING':
    case 'COOLDOWN':
      statusClass = 'status-processing';
      break;
    case 'ERROR':
    case 'REJECTED':
      statusClass = 'status-error';
      break;
    case 'PAUSED':
      statusClass = 'status-paused';
      break;
    case 'READY':
    case 'SUCCESS':
    case 'ACCEPTED':
    default:
      statusClass = 'status-ready';
      break;
  }

  return (
    <div className={`toolbar-status-dot ${statusClass}`} title={`Status: ${pipelineState}`}></div>
  );
});

export default ScannerStatusIndicator;
