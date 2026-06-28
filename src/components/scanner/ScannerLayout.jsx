import React from 'react';
import ScannerHeader from './ScannerHeader';
import ScannerCameraArea from './ScannerCameraArea';
import ScannerFooter from './ScannerFooter';
import ScannerInfoCard from './ScannerInfoCard';
import ScannerStatusChip from './ScannerStatusChip';
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
  pipelineState
}) {
  return (
    <div className="scanner-professional-layout">
      <ScannerHeader 
        title={currentInventory?.name || 'Inventário'} 
        onClose={onClose}
        soundMuted={soundMuted}
        onToggleMute={onToggleMute}
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

      <ScannerFooter 
        scannedProduct={scannedProduct}
        scanQty={scanQty}
        setScanQty={setScanQty}
        history={history}
        onConfirm={confirmCount}
        isBipagemMode={isBipagemMode}
      />
    </div>
  );
}
