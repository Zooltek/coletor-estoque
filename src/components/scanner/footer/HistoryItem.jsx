import React from 'react';

const HistoryItem = React.memo(({ item }) => {
  return (
    <div className="hud-history-item">
      <span className="hud-history-icon">✔</span>
      <div className="hud-history-details">
        <span className="hud-history-code">{item.barcode}</span>
        <span className="hud-history-desc">{item.description}</span>
      </div>
    </div>
  );
});

export default HistoryItem;
