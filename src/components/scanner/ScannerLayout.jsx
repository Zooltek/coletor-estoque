import React from 'react';
import { ScannerToolbar } from './toolbar';
import ScannerCameraArea from './ScannerCameraArea';
import { ScannerFooter } from './footer';
import ScannerInfoCard from './ScannerInfoCard';
import ScannerStatusChip from './ScannerStatusChip';
import { ScanFeedback } from './feedback';
import './scanner-professional.css';

export default function ScannerLayout({
  onScan,
  onClose,
  soundMuted,
  onToggleMute,
  currentInventory,
  scannedProduct,
  totalItemsCounted,
  isBipagemMode,
  scanQty,
  setScanQty,
  confirmCount,
  cancelCount,
  history = [],
  showFeedback,
  pipelineState,
  errorMessage
}) {
  return (
    <div className="scanner-professional-layout">
      <ScannerToolbar 
        title={currentInventory?.name || 'Inventário'} 
        onClose={onClose}
        pipelineState={pipelineState}
      />
      
      <div className="spl-top-info">
        <ScannerInfoCard 
          title="Itens" 
          value={totalItemsCounted} 
          className="sic-items"
        />
        <div className="scanner-info-card sic-status">
          <span className="sic-title">Status</span>
          <div className="sic-content">
            <ScannerStatusChip />
          </div>
        </div>
      </div>

      <ScannerCameraArea onScan={onScan} pipelineState={pipelineState} />

      <ScanFeedback 
        pipelineState={pipelineState} 
        scannedProduct={scannedProduct} 
        errorMessage={errorMessage}
      />

      <ScannerFooter 
        scannedProduct={scannedProduct}
        scanQty={scanQty}
        setScanQty={setScanQty}
        onConfirm={confirmCount}
        isBipagemMode={isBipagemMode}
        totalItemsCounted={totalItemsCounted}
        errorMessage={errorMessage}
      />
    </div>
  );
}
