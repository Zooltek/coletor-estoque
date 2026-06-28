import React from 'react';

const HistoryQuantity = React.memo(({ quantity }) => {
  return (
    <span className="hc-qty">
      Qtd: {quantity}
    </span>
  );
});

export default HistoryQuantity;
