import React, { useState, useEffect } from 'react';
import ScannerLayout from './ScannerLayout';
import { useScanner } from '../../hooks/useScanner';
import { useScannerPipeline } from '../../hooks/useScannerPipeline';
import { useFeedback } from '../../hooks/useFeedback';
import FeedbackService from '../../services/feedback/FeedbackService';

export default function ScannerContainer({
  onScan, // Now acts as validator
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
  const { pipelineState, processScan, pausePipeline, resumePipeline } = useScannerPipeline(onScan);
  
  // Habilita/Desabilita sons do serviço com base na prop soundMuted
  useEffect(() => {
    FeedbackService.setSoundEnabled(!soundMuted);
  }, [soundMuted]);

  // Registra o hook de feedback visual e sonoro associado ao pipeline
  useFeedback(pipelineState);
  
  const [scanHistory, setScanHistory] = useState([]);

  useEffect(() => {
    if (isPaused) {
      pause();
      pausePipeline();
    } else {
      resume();
      resumePipeline();
    }
  }, [isPaused, pause, resume, pausePipeline, resumePipeline]);

  // Track history for bipagem mode
  useEffect(() => {
    if (scannedProduct && isBipagemMode) {
      setScanHistory(prev => [scannedProduct, ...prev].slice(0, 3));
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
      onScan={processScan} // Passing pipeline processing function instead of raw App processBarcode
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
      pipelineState={pipelineState}
    />
  );
}
