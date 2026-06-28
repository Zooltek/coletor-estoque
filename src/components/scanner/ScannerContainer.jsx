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
  isBipagemMode,
  scanQty,
  setScanQty,
  confirmCount,
  cancelCount
}) {
  const { pause, resume, stop } = useScanner();
  const { pipelineState, processScan, pausePipeline, resumePipeline } = useScannerPipeline(onScan);
  
  // Habilita/Desabilita sons do serviço com base na prop soundMuted
  useEffect(() => {
    FeedbackService.setSoundEnabled(!soundMuted);
  }, [soundMuted]);

  // Registra o hook de feedback visual e sonoro associado ao pipeline
  useFeedback(pipelineState);
  
  // Removed scanHistory
  useEffect(() => {
    if (isPaused) {
      pause();
      pausePipeline();
    } else {
      resume();
      resumePipeline();
    }
  }, [isPaused, pause, resume, pausePipeline, resumePipeline]);

  const handleClose = async () => {
    await stop();
    onClose();
  };

  const handleConfirmCount = () => {
    confirmCount();
  };

  return (
    <ScannerLayout
      onScan={processScan} // Passing pipeline processing function instead of raw App processBarcode
      onClose={handleClose}
      soundMuted={soundMuted}
      onToggleMute={onToggleMute}
      isBipagemMode={isBipagemMode}
      scanQty={scanQty}
      setScanQty={setScanQty}
      confirmCount={handleConfirmCount}
      cancelCount={cancelCount}
      pipelineState={pipelineState}
    />
  );
}
