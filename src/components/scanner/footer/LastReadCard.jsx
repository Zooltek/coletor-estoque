import React from 'react';

const LastReadCard = React.memo(({ barcode }) => {
  return (
    <div className="hud-section">
      <span className="hud-label">Último Código</span>
      {barcode ? (
        <span className="hud-barcode">{barcode}</span>
      ) : (
        <span className="hud-barcode empty">Aguardando leitura...</span>
      )}
    </div>
  );
});

export default LastReadCard;
