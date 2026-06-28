import React from 'react';

const HistoryStatusChip = React.memo(({ status }) => {
  const getStatusLabel = () => {
    switch (status) {
      case 'SUCCESS': return 'OK';
      case 'ERROR': return 'ERRO';
      case 'DUPLICATE': return 'REPETIDO';
      case 'MANUAL': return 'MANUAL';
      case 'IGNORED': return 'IGNORADO';
      default: return status;
    }
  };

  return (
    <span className={`hc-status-chip hc-status-${status.toLowerCase()}`}>
      {getStatusLabel()}
    </span>
  );
});

export default HistoryStatusChip;
