import React, { useState, useEffect } from 'react';
import ScannerView from './ScannerView';
import ScannerToolbar from './ScannerToolbar';
import ScannerOverlay from './ScannerOverlay';
import ScannerBottomPanel from './ScannerBottomPanel';
import ScannerStatus from './ScannerStatus';
import { useScanner } from '../../hooks/useScanner';

export default function ScannerContainer({
  onScan,
  onClose,
  isPaused,
  soundMuted,
  onToggleMute,
  currentInventory,
  scannedProduct,
  totalItemsCounted,
  isBipagemMode,
  scanQty,
  adjustQty,
  setScanQty,
  confirmCount,
  cancelCount,
  setPalletOpen
}) {
  const { pause, resume, stop } = useScanner();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackProduct, setFeedbackProduct] = useState(null);

  useEffect(() => {
    if (isPaused) {
      pause();
    } else {
      resume();
    }
  }, [isPaused, pause, resume]);

  useEffect(() => {
    if (scannedProduct && isBipagemMode) {
      setShowFeedback(true);
      setFeedbackProduct(scannedProduct);
      const timer = setTimeout(() => {
        setShowFeedback(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [scannedProduct, isBipagemMode]);

  const handleClose = async () => {
    await stop();
    onClose();
  };

  return (
    <div className={`camera-scanner-container professional-hud ${isFullscreen ? 'fullscreen-scanner' : ''}`}>
      <div className="scanner-hud-header">
        <div className="hud-header-left">
          <small>Inventário</small>
          <h5>{currentInventory ? currentInventory.name : "Nenhum"}</h5>
        </div>
        <div className="hud-header-right">
          <small>Itens Contados</small>
          <span className="hud-counter-val">{totalItemsCounted}</span>
        </div>
        <button className="btn-close-scanner-hud" onClick={handleClose}>&times;</button>
      </div>

      <div className="scanner-frame">
        <ScannerView onScan={onScan} />
        <ScannerOverlay showFeedback={showFeedback} />
      </div>

      <ScannerToolbar 
        soundMuted={soundMuted}
        onToggleMute={onToggleMute}
        isFullscreen={isFullscreen}
        onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
      />

      <ScannerBottomPanel 
        isBipagemMode={isBipagemMode}
        showFeedback={showFeedback}
        feedbackProduct={feedbackProduct}
        scannedProduct={scannedProduct}
        scanQty={scanQty}
        adjustQty={adjustQty}
        setScanQty={setScanQty}
        setPalletOpen={setPalletOpen}
        confirmCount={confirmCount}
        cancelCount={cancelCount}
      />

      <ScannerStatus />
    </div>
  );
}
