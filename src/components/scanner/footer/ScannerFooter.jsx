import React from 'react';
import LastReadCard from './LastReadCard';
import ProductCard from './ProductCard';
import QuantityControl from './QuantityControl';
import InventorySummary from './InventorySummary';
import { HistoryPanel } from '../history';
import FooterDivider from './FooterDivider';
import { useScannerSession } from '../../../hooks/useScannerSession';
import './footer.css';

const ScannerFooter = React.memo(({ 
  isBipagemMode, 
  scanQty, 
  setScanQty, 
  onConfirm 
}) => {
  const session = useScannerSession();
  const scannedProduct = session?.state?.lastProduct;
  const errorMessage = session?.state?.lastError;
  const totalItemsCounted = session?.metrics?.acceptedReads || 0;

  return (
    <div className="scanner-hud-footer">
      <LastReadCard barcode={session?.state?.lastBarcode} />
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
      
      <FooterDivider />
      <HistoryPanel />
    </div>
  );
});

export default ScannerFooter;
