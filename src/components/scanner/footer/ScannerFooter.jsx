import React from 'react';
import LastReadCard from './LastReadCard';
import ProductCard from './ProductCard';
import QuantityControl from './QuantityControl';
import InventorySummary from './InventorySummary';
import HistoryPanel from './HistoryPanel';
import FooterDivider from './FooterDivider';
import './footer.css';

const ScannerFooter = React.memo(({
  scannedProduct,
  scanQty,
  setScanQty,
  history = [],
  totalItemsCounted,
  errorMessage,
  isBipagemMode,
  onConfirm
}) => {
  return (
    <div className="scanner-hud-footer">
      <LastReadCard barcode={scannedProduct?.barcode} />
      <FooterDivider />
      
      <ProductCard product={scannedProduct} error={errorMessage} />
      <FooterDivider />
      
      {!isBipagemMode && scannedProduct && !errorMessage && (
        <>
          <QuantityControl quantity={scanQty} onChange={setScanQty} />
          <div className="hud-section" style={{ marginTop: '8px' }}>
            <button className="spf-btn-confirm" onClick={onConfirm} style={{width: '100%', padding: '12px', fontSize: '16px', fontWeight: 'bold', borderRadius: '8px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer'}}>
              Confirmar
            </button>
          </div>
          <FooterDivider />
        </>
      )}
      
      <InventorySummary totalItems={totalItemsCounted} />
      
      {history.length > 0 && (
        <>
          <FooterDivider />
          <HistoryPanel history={history} />
        </>
      )}
    </div>
  );
});

export default ScannerFooter;
