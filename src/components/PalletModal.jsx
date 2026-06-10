import React, { useState, useEffect } from 'react';

export default function PalletModal({ product, onConfirm, onClose }) {
  const [layers, setLayers] = useState(0);
  const [boxesPerLayer, setBoxesPerLayer] = useState(0);
  const [unitsPerBox, setUnitsPerBox] = useState(0);
  const [looseUnits, setLooseUnits] = useState(0);
  const [palletType, setPalletType] = useState('fechado'); // 'fechado' | 'aberto'
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const calculated = (layers * boxesPerLayer * unitsPerBox) + (palletType === 'aberto' ? Number(looseUnits) : 0);
    setTotal(calculated);
  }, [layers, boxesPerLayer, unitsPerBox, looseUnits, palletType]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (total > 0) {
      onConfirm(total);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glassmorphism animated zoomIn">
        <div className="modal-header">
          <h3>📦 Calculadora de Pallet</h3>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-product-info">
          <strong>{product ? product.description : 'Código Barras'}</strong>
          <span className="product-code">Ref: {product ? product.barcode : ''}</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="tab-control">
            <button
              type="button"
              className={`tab-btn ${palletType === 'fechado' ? 'active' : ''}`}
              onClick={() => setPalletType('fechado')}
            >
              Pallet Fechado
            </button>
            <button
              type="button"
              className={`tab-btn ${palletType === 'aberto' ? 'active' : ''}`}
              onClick={() => setPalletType('aberto')}
            >
              Pallet Aberto (Com Avulsos)
            </button>
          </div>

          <div className="calc-grid">
            <div className="form-group">
              <label>Camadas (Altura)</label>
              <input
                type="number"
                min="0"
                value={layers}
                onChange={(e) => setLayers(Math.max(0, parseInt(e.target.value) || 0))}
                className="input-calc"
              />
            </div>

            <div className="form-group">
              <label>Caixas por Camada</label>
              <input
                type="number"
                min="0"
                value={boxesPerLayer}
                onChange={(e) => setBoxesPerLayer(Math.max(0, parseInt(e.target.value) || 0))}
                className="input-calc"
              />
            </div>

            <div className="form-group">
              <label>Unidades por Caixa</label>
              <input
                type="number"
                min="0"
                value={unitsPerBox}
                onChange={(e) => setUnitsPerBox(Math.max(0, parseInt(e.target.value) || 0))}
                className="input-calc"
              />
            </div>

            {palletType === 'aberto' && (
              <div className="form-group animate-slide">
                <label>Unidades Avulsas (Soltas)</label>
                <input
                  type="number"
                  min="0"
                  value={looseUnits}
                  onChange={(e) => setLooseUnits(Math.max(0, parseInt(e.target.value) || 0))}
                  className="input-calc highlight-border"
                />
              </div>
            )}
          </div>

          <div className="calc-result-box">
            <span className="result-label">Total Calculado:</span>
            <span className="result-value">{total} <small>unidades</small></span>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-submit" disabled={total <= 0}>Aplicar Quantidade</button>
          </div>
        </form>
      </div>
    </div>
  );
}
