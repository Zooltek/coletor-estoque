import React, { useState, useEffect } from 'react';
import ScannerLayout from './ScannerLayout';
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
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackProduct, setFeedbackProduct] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);

  useEffect(() => {
    if (isPaused) {
      pause();
    } else {
      resume();
    }
  }, [isPaused, pause, resume]);

  // Track history for bipagem mode
  useEffect(() => {
    if (scannedProduct && isBipagemMode) {
      setShowFeedback(true);
      setFeedbackProduct(scannedProduct);
      setScanHistory(prev => [scannedProduct, ...prev].slice(0, 3));
      
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

  const handleConfirmCount = () => {
    if (scannedProduct && !isBipagemMode) {
      setScanHistory(prev => [scannedProduct, ...prev].slice(0, 3));
    }
    confirmCount();
  };

  return (
    <ScannerLayout
      onScan={onScan}
      onClose={handleClose}
      soundMuted={soundMuted}
      onToggleMute={onToggleMute}
      currentInventory={currentInventory}
      scannedProduct={scannedProduct}
      totalItemsCounted={totalItemsCounted}
      isBipagemMode={isBipagemMode}
      scanQty={scanQty}
      setScanQty={setScanQty}
      confirmCount={handleConfirmCount}
      cancelCount={cancelCount}
      history={scanHistory}
      showFeedback={showFeedback}
    />
  );
}
