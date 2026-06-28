import React from 'react';

const InventorySummary = React.memo(({ totalItems }) => {
  return (
    <div className="hud-section">
      <div className="hud-row">
        <span className="hud-label">Itens Coletados</span>
        <span className="hud-summary-value">{totalItems}</span>
      </div>
    </div>
  );
});

export default InventorySummary;
