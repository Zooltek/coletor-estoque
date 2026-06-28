import React from 'react';
import ScannerCounter from './ScannerCounter';

export default function ScannerFooter({
  scannedProduct,
  scanQty,
  setScanQty,
  history = [],
  onConfirm,
  isBipagemMode
}) {
  return (
    <div className="scanner-professional-footer">
      <div className="spf-current">
        <span className="spf-label">Último código</span>
        <span className="spf-barcode">{scannedProduct ? scannedProduct.barcode : '---'}</span>
        
        <span className="spf-label">Produto</span>
        <span className="spf-desc">{scannedProduct ? scannedProduct.description : 'Aguardando leitura...'}</span>
        
        {!isBipagemMode && scannedProduct && (
          <div className="spf-qty-section">
            <ScannerCounter value={scanQty} onChange={setScanQty} />
            <button type="button" className="spf-btn-confirm" onClick={onConfirm}>
              Confirmar
            </button>
          </div>
        )}
      </div>

      <div className="spf-history">
        <span className="spf-history-title">Últimas Leituras</span>
        <div className="spf-history-list">
          {history.slice(0, 3).map((item, index) => (
            <div key={index} className="spf-history-item">
              <span className="spf-check">✔</span>
              <div className="spf-hist-details">
                <span className="spf-hist-code">{item.barcode}</span>
                <span className="spf-hist-desc">{item.description}</span>
              </div>
            </div>
          ))}
          {history.length === 0 && (
            <span className="spf-history-empty">Nenhuma leitura ainda</span>
          )}
        </div>
      </div>
    </div>
  );
}
