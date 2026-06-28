import React, { useCallback } from 'react';

const QuantityControl = React.memo(({ quantity = 1, onChange, disabled }) => {
  const handleDecrement = useCallback(() => {
    if (!disabled && quantity > 1) {
      onChange(quantity - 1);
    }
  }, [quantity, onChange, disabled]);

  const handleIncrement = useCallback(() => {
    if (!disabled) {
      onChange(quantity + 1);
    }
  }, [quantity, onChange, disabled]);

  return (
    <div className="hud-section">
      <div className="hud-row">
        <span className="hud-label">Quantidade</span>
        <div className="hud-qty-control">
          <div 
            className="hud-qty-btn" 
            onClick={handleDecrement}
            disabled={disabled || quantity <= 1}
          >
            -
          </div>
          <span className="hud-qty-value">{quantity}</span>
          <div 
            className="hud-qty-btn" 
            onClick={handleIncrement}
            disabled={disabled}
          >
            +
          </div>
        </div>
      </div>
    </div>
  );
});

export default QuantityControl;
