import React from 'react';

export default function ScannerCounter({ value, onChange }) {
  const handleDecrement = () => {
    if (value > 1) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    onChange(value + 1);
  };

  const handleChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val > 0) {
      onChange(val);
    }
  };

  return (
    <div className="scanner-counter">
      <span className="sc-label">Quantidade</span>
      <div className="sc-controls">
        <button type="button" className="sc-btn" onClick={handleDecrement}>-</button>
        <input 
          type="number" 
          className="sc-input" 
          value={value} 
          onChange={handleChange}
          min="1"
        />
        <button type="button" className="sc-btn" onClick={handleIncrement}>+</button>
      </div>
    </div>
  );
}
