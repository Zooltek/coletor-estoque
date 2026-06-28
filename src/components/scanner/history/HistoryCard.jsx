import React from 'react';
import HistoryStatusChip from './HistoryStatusChip';
import HistoryTimestamp from './HistoryTimestamp';
import HistoryQuantity from './HistoryQuantity';

const HistoryCard = React.memo(({ record }) => {
  return (
    <div className="history-card">
      <div className="hc-main-info">
        <span className="hc-title">
          {record.status === 'SUCCESS' ? '✔ ' : ''}{record.description || 'Produto Desconhecido'}
        </span>
        <span className="hc-barcode">{record.barcode}</span>
      </div>
      <div className="hc-meta">
        <HistoryStatusChip status={record.status} />
        <div className="hc-qty-time">
          <HistoryQuantity quantity={record.quantity} />
          <span>•</span>
          <HistoryTimestamp timestamp={record.timestamp} />
        </div>
      </div>
    </div>
  );
});

export default HistoryCard;
