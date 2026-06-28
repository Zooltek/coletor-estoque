import React from 'react';

export default function ScannerBottomPanel({
  isBipagemMode,
  showFeedback,
  feedbackProduct,
  scannedProduct,
  scanQty,
  adjustQty,
  setScanQty,
  setPalletOpen,
  confirmCount,
  cancelCount
}) {
  return (
    <div className="scanner-hud-bottom">
      {isBipagemMode ? (
        showFeedback && feedbackProduct ? (
          <div className="hud-feedback-card animate-slide confirmed">
            <span className="feedback-check">✔ Produto Confirmado</span>
            <h4>{feedbackProduct.description}</h4>
            <div className="feedback-meta">EAN: {feedbackProduct.barcode} • Qtd: +1</div>
          </div>
        ) : (
          <div className="hud-feedback-card searching">
            <span className="loading-dots">Aproxime o código de barras</span>
            <p>Último item: {scannedProduct ? scannedProduct.description : 'Nenhum'}</p>
          </div>
        )
      ) : (
        scannedProduct ? (
          <div className="hud-manual-card animate-slide">
            <div className="hud-prod-header">
              <h4>{scannedProduct.description}</h4>
              <small>EAN: {scannedProduct.barcode}</small>
            </div>

            <div className="hud-qty-row">
              <div className="qty-input-box" style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                <button type="button" className="btn-qty-adj" onClick={() => adjustQty(-1)}>-</button>
                <input
                  type="number"
                  min="1"
                  value={scanQty}
                  onChange={(e) => setScanQty(Math.max(1, parseFloat(e.target.value) || 1))}
                  className="input-qty"
                  style={{ flex: 1 }}
                />
                <button type="button" className="btn-qty-adj" onClick={() => adjustQty(1)}>+</button>
              </div>
              
              <button 
                type="button" 
                className="btn-pallet-trigger" 
                title="Calculadora de Pallets" 
                onClick={() => setPalletOpen(true)}
                style={{ height: '42px', width: '42px', borderRadius: '10px' }}
              >
                📦
              </button>
            </div>

            <div className="multipliers-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', marginTop: '6px' }}>
              <button type="button" className="btn-mult" onClick={() => setScanQty(prev => prev + 5)}>+5</button>
              <button type="button" className="btn-mult" onClick={() => setScanQty(prev => prev + 10)}>+10</button>
              <button type="button" className="btn-mult" onClick={() => setScanQty(prev => prev + 50)}>+50</button>
              <button type="button" className="btn-mult" onClick={() => setScanQty(prev => prev + 100)}>+100</button>
            </div>

            <div className="hud-actions-row">
              <button type="button" onClick={confirmCount} className="btn-confirm-hud">
                💾 Gravar Contagem
              </button>
              <button type="button" onClick={cancelCount} className="btn-cancel-hud">
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="hud-feedback-card searching">
            <span className="loading-dots">Aproxime o código de barras (Ajuste Manual)</span>
          </div>
        )
      )}
    </div>
  );
}
