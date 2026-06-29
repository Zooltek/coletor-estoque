import React, { memo, useState, useEffect } from 'react';
import { ScannerToolbar } from './toolbar';
import ScannerCameraArea from './ScannerCameraArea';
import { ScannerFooter } from './footer';
import ScannerInfoCard from './ScannerInfoCard';
import ScannerStatusChip from './ScannerStatusChip';
import { ScanFeedback } from './feedback';
import { useScannerSession } from '../../hooks/useScannerSession';
import { useRenderTracker } from '../../hooks/performance/useRenderTracker';
import './scanner-professional.css';
import { shallowCompare } from '../../utils/performance/MemoComparator';

function ScannerLayout({
  onScan,
  onClose,
  soundMuted,
  onToggleMute,
  currentInventory,
  isBipagemMode,
  scanQty,
  setScanQty,
  confirmCount,
  cancelCount,
  pipelineRef,
  subscribePipeline
}) {
  useRenderTracker('ScannerLayout');

  const session = useScannerSession();
  const scannedProduct = session?.state?.lastProduct;
  const errorMessage = session?.state?.lastError;
  const totalItemsCounted = session?.metrics?.acceptedReads || 0;

  // Estado local apenas para repassar props pro feedback e status?
  // O ideal seria ScannerToolbar, ScannerCameraArea, etc. consumirem direto via subscribe.
  // Vamos passar as refs e o subscribe para eles
  return (
    <div className="scanner-professional-layout">
      <ScannerToolbar 
        title={currentInventory?.name || 'Inventário'} 
        onClose={onClose}
        pipelineRef={pipelineRef}
        subscribePipeline={subscribePipeline}
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
            <ScannerStatusChip subscribePipeline={subscribePipeline} pipelineRef={pipelineRef} />
          </div>
        </div>
      </div>

      <ScannerCameraArea 
        onScan={onScan} 
        subscribePipeline={subscribePipeline} 
        pipelineRef={pipelineRef} 
      />

      <ScanFeedback 
        subscribePipeline={subscribePipeline} 
        pipelineRef={pipelineRef} 
        scannedProduct={scannedProduct} 
        errorMessage={errorMessage}
      />

      <ScannerFooter 
        scanQty={scanQty}
        setScanQty={setScanQty}
        onConfirm={confirmCount}
        isBipagemMode={isBipagemMode}
      />
    </div>
  );
}

// Custom comparator to avoid re-rendering on simple callbacks/refs changes
export default memo(ScannerLayout, (prev, next) => {
  return (
    prev.currentInventory === next.currentInventory &&
    prev.isBipagemMode === next.isBipagemMode &&
    prev.scanQty === next.scanQty &&
    prev.soundMuted === next.soundMuted
  );
});
