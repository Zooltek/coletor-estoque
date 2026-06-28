import React from 'react';
import HistoryItem from './HistoryItem';

const HistoryPanel = React.memo(({ history = [] }) => {
  if (!history || history.length === 0) return null;

  // Mostra apenas as últimas 5 leituras
  const displayHistory = history.slice(0, 5);

  return (
    <div className="hud-section">
      <span className="hud-label">Últimas Leituras</span>
      <div className="hud-history-list">
        {displayHistory.map((item, index) => (
          <HistoryItem key={`${item.barcode}-${index}`} item={item} />
        ))}
      </div>
    </div>
  );
});

export default HistoryPanel;
