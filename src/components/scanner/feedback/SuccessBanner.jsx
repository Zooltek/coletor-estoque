import React from 'react';

const SuccessBanner = React.memo(({ product, quantity = 1 }) => {
  return (
    <div className="feedback-banner feedback-banner-success">
      <h3>✔ Produto encontrado</h3>
      {product ? (
        <>
          <p>{product.description}</p>
          <p style={{ fontSize: '12px' }}>{product.barcode}</p>
          <div className="feedback-banner-qty">Qtd: {quantity}</div>
        </>
      ) : (
        <p>Leitura confirmada</p>
      )}
    </div>
  );
});

export default SuccessBanner;
