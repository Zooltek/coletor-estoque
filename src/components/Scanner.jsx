import React, { useEffect, useRef, useState } from 'react';
import ScannerService from '../services/scanner/ScannerService';

export default function Scanner({ onScan, onClose, isPaused, soundMuted, onToggleMute }) {
  const [errorMsg, setErrorMsg] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [capabilities, setCapabilities] = useState(null);
  const [torchActive, setTorchActive] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const onScanRef = useRef(onScan);
  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  const isPausedRef = useRef(isPaused);
  useEffect(() => {
    isPausedRef.current = isPaused;
    if (isPaused) {
      ScannerService.pause().catch(err => console.warn("Erro ao pausar scanner:", err));
    } else {
      ScannerService.resume().catch(err => console.warn("Erro ao resumir scanner:", err));
    }
  }, [isPaused]);

  useEffect(() => {
    const startScanner = async () => {
      try {
        setCameraActive(true);
        await ScannerService.start("camera-reader-element", (decodedText) => {
          onScanRef.current(decodedText);
        });

        // Tenta buscar as capabilities da implementação do scanner
        if (typeof ScannerService.getCapabilities === 'function') {
          const trackCaps = ScannerService.getCapabilities();
          setCapabilities(trackCaps);
        }
      } catch (err) {
        console.error("Erro ao iniciar o serviço de scanner:", err);
        setErrorMsg('Não foi possível acessar a câmera do leitor. Certifique-se de dar permissões ou usar HTTPS.');
        setCameraActive(false);
      }
    };

    startScanner();

    return () => {
      ScannerService.stop().catch(err => console.error("Erro ao parar scanner no unmount", err));
    };
  }, []);

  const changeZoom = async (level) => {
    setZoomLevel(level);
    try {
      await ScannerService.setZoom(level);
    } catch (err) {
      console.error("Erro ao aplicar zoom no serviço:", err);
    }
  };

  const toggleTorch = async () => {
    const nextTorch = !torchActive;
    setTorchActive(nextTorch);
    try {
      await ScannerService.toggleTorch(nextTorch);
    } catch (err) {
      console.error("Erro ao alternar lanterna no serviço:", err);
    }
  };

  const handleClose = async () => {
    try {
      await ScannerService.stop();
    } catch (err) {
      console.error("Erro ao parar scanner:", err);
    }
    onClose();
  };

  return (
    <div className="camera-scanner-container">
      <div className="scanner-header">
        <span>📸 Câmera Ativa (Leitor de Código)</span>
        <button className="btn-close-scanner" onClick={handleClose}>Fechar</button>
      </div>

      <div className="scanner-frame">
        <div id="camera-reader-element"></div>
        {cameraActive && !isPaused && <div className="scanner-laser-line"></div>}
        {isPaused && (
          <div className="scanner-paused-overlay">
            <span>Aguardando Confirmação...</span>
          </div>
        )}
      </div>

      {cameraActive && (
        <div className="scanner-controls-row">
          <button 
            type="button" 
            className={`btn-scanner-icon ${soundMuted ? 'muted' : ''}`}
            onClick={onToggleMute}
            title={soundMuted ? "Ativar som de bip" : "Mutar som de bip"}
          >
            {soundMuted ? '🔇' : '🔊'}
          </button>

          <div className="zoom-selector-group">
            <button 
              type="button" 
              className={`btn-zoom-option ${zoomLevel === 1 ? 'active' : ''}`}
              onClick={() => changeZoom(1)}
            >
              1
            </button>
            <button 
              type="button" 
              className={`btn-zoom-option ${zoomLevel === 2 ? 'active' : ''}`}
              onClick={() => changeZoom(2)}
              disabled={capabilities && !capabilities.zoom}
            >
              2x
            </button>
            <button 
              type="button" 
              className={`btn-zoom-option ${zoomLevel === 3 ? 'active' : ''}`}
              onClick={() => changeZoom(3)}
              disabled={capabilities && !capabilities.zoom}
            >
              3
            </button>
          </div>

          <button 
            type="button" 
            className={`btn-scanner-icon torch ${torchActive ? 'active' : ''}`}
            onClick={toggleTorch}
            disabled={capabilities && !capabilities.torch}
            title="Ligar/Desligar Lanterna"
          >
            🔦
          </button>
        </div>
      )}

      {errorMsg ? (
        <div className="scanner-error">
          <p>{errorMsg}</p>
          <button className="btn-retry" onClick={() => window.location.reload()}>Recarregar App</button>
        </div>
      ) : (
        <p className="scanner-hint">
          {isPaused 
            ? "Confirme a quantidade abaixo para continuar escanando" 
            : "Mantenha o código de barras no retângulo para ler"
          }
        </p>
      )}
    </div>
  );
}
