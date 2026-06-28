import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function Scanner({ onScan, onClose, isPaused, soundMuted, onToggleMute }) {
  const [errorMsg, setErrorMsg] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [capabilities, setCapabilities] = useState(null);
  const [torchActive, setTorchActive] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const qrRef = useRef(null);
  const scannerRef = useRef(null);
  const lastScannedRef = useRef({ code: '', time: 0 });

  // Guardamos o callback do scan em uma ref para evitar que re-execuções do useEffect
  // reiniciem o scanner toda vez que as dependências do componente pai mudarem.
  const onScanRef = useRef(onScan);
  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  const isPausedRef = useRef(isPaused);
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    const html5Qrcode = new Html5Qrcode("camera-reader-element");
    scannerRef.current = html5Qrcode;

    const startCamera = async () => {
      try {
        setCameraActive(true);
        // Tenta usar a câmera traseira ("environment")
        await html5Qrcode.start(
          { facingMode: "environment" },
          {
            fps: 15,
            qrbox: { width: 260, height: 130 } // Retângulo ideal para código de barras de produtos
          },
          (decodedText) => {
            // Se estiver pausado (mostrando formulário de quantidade), ignora as leituras
            if (isPausedRef.current) return;

            const now = Date.now();
            // Ignora leituras repetidas do mesmo código num intervalo de 2.5 segundos
            if (lastScannedRef.current.code === decodedText && (now - lastScannedRef.current.time) < 2500) {
              return;
            }
            lastScannedRef.current = { code: decodedText, time: now };
            onScanRef.current(decodedText);
          },
          (errorMessage) => {
            // Ignora erros normais de varredura sem código
          }
        );

        // Busca capabilities da câmera ativa (como zoom e torch)
        try {
          if (typeof html5Qrcode.getRunningTrackCapabilities === 'function') {
            const trackCaps = html5Qrcode.getRunningTrackCapabilities();
            setCapabilities(trackCaps);
          }
        } catch (e) {
          console.warn("Recursos de câmera (Capabilities) não suportados neste navegador/dispositivo:", e);
        }
      } catch (err) {
        console.error("Erro ao iniciar a câmera:", err);
        setErrorMsg('Não foi possível acessar a câmera traseira. Certifique-se de dar permissões ou usar HTTPS.');
        setCameraActive(false);
      }
    };

    startCamera();

    // Cleanup ao desmontar
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().then(() => {
          scannerRef.current.clear();
        }).catch(err => console.error("Erro ao parar scanner no unmount", err));
      }
    };
  }, []); // Sem dependências para nunca reiniciar o scanner no ciclo de render comum

  const changeZoom = async (level) => {
    setZoomLevel(level);
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.applyVideoConstraints({
          advanced: [{ zoom: level }]
        });
      } catch (err) {
        console.error("Erro ao aplicar zoom:", err);
      }
    }
  };

  const toggleTorch = async () => {
    const nextTorch = !torchActive;
    setTorchActive(nextTorch);
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.applyVideoConstraints({
          advanced: [{ torch: nextTorch }]
        });
      } catch (err) {
        console.error("Erro ao alternar lanterna:", err);
      }
    }
  };

  return (
    <div className="camera-scanner-container">
      <div className="scanner-header">
        <span>📸 Câmera Ativa (Leitor de Código)</span>
        <button className="btn-close-scanner" onClick={onClose}>Fechar</button>
      </div>

      <div className="scanner-frame">
        <div id="camera-reader-element" ref={qrRef}></div>
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
