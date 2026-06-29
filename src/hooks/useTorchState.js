import { useState } from 'react';
import ScannerFactory from '../../services/scanner/ScannerFactory';

export function useTorchState() {
  const [isTorchOn, setIsTorchOn] = useState(false);

  const toggleTorch = async (desiredState) => {
    try {
      const scanner = await ScannerFactory.getScanner();
      await scanner.toggleTorch(desiredState);
      setIsTorchOn(desiredState);
    } catch (err) {
      console.error("Erro ao alterar estado da lanterna manual", err);
    }
  };

  return { isTorchOn, toggleTorch };
}
