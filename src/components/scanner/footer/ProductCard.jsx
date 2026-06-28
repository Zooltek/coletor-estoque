import React from 'react';

const ProductCard = React.memo(({ product, error }) => {
  if (error) {
    return (
      <div className="hud-section">
        <span className="hud-label">Produto</span>
        <span className="hud-product-title hud-product-error">
          {typeof error === 'string' ? error : 'Produto não localizado'}
        </span>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="hud-section">
      <span className="hud-label">Produto</span>
      <span className="hud-product-title">{product.description}</span>
      {product.brand && (
        <span className="hud-product-desc">{product.brand} - {product.category}</span>
      )}
    </div>
  );
});

export default ProductCard;
