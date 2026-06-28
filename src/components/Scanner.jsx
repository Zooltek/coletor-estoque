import React, { useEffect, useRef, useState } from 'react';
import ScannerService from '../services/scanner/ScannerService';

export default function Scanner({ 
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
  const [errorMsg, setErrorMsg] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [capabilities, setCapabilities] = useState(null);
  const [torchActive, setTorchActive] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackProduct, setFeedbackProduct] = useState(null);
  const feedbackTimerRef = useRef(null);

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
    if (scannedProduct && isBipagemMode) {
      setShowFeedback(true);
      setFeedbackProduct(scannedProduct);
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }
      feedbackTimerRef.current = setTimeout(() => {
        setShowFeedback(false);
      }, 300);
    }
  }, [scannedProduct, isBipagemMode]);

  useEffect(() => {
    const startScanner = async () => {
      try {
        setCameraActive(true);
        await ScannerService.start("camera-reader-element", (decodedText) => {
          onScanRef.current(decodedText);
        });

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
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }
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
    <div className="camera-scanner-container professional-hud">
      {/* 1. CABEÇALHO HUD */}
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

      {/* 2. ÁREA DO PREVIEW DA CÂMERA */}
      <div className="scanner-frame">
        <div id="camera-reader-element"></div>
        {cameraActive && !isPaused && <div className="scanner-laser-line"></div>}
        
        {/* Retícula de enquadramento estilo leitor de barras profissional */}
        <div className={`scanner-target-reticle ${showFeedback ? 'confirmed-green' : isPaused ? 'paused-yellow' : 'searching-blue'}`}>
          <div className="corner top-left"></div>
          <div className="corner top-right"></div>
          <div className="corner bottom-left"></div>
          <div className="corner bottom-right"></div>
          
          <div className="reticle-status-text">
            {showFeedback ? "🟢 Confirmado!" : isPaused ? "🟡 Aguardando..." : "🟡 Procurando..."}
          </div>
        </div>

        {isPaused && (
          <div className="scanner-paused-overlay">
            <span>Aguardando Confirmação...</span>
          </div>
        )}
      </div>

      {/* 3. CONTROLES DA CÂMERA */}
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
              1x
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
              3x
            </button>
          </div>

          <button 
            type="button" 
            className={`btn-scanner-icon torch ${torchActive ? 'active' : ''}`}
            onClick={toggleTorch}
            title="Ligar/Desligar Lanterna"
          >
            🔦
          </button>
        </div>
      )}

      {/* 4. BASE HUD - DETALHES OU FEEDBACK */}
      <div className="scanner-hud-bottom">
        {isBipagemMode ? (
          showFeedback && feedbackProduct ? (
            <div className="hud-feedback-card animate-slide confirmed">
              <span className="feedback-check">✔ Produto Confirmado</span>
              <h4>{feedbackProduct.description}</h4>
              <div className="feedback-meta">EAN: {feedbackProduct.barcode} • Qtd: +1</div>
            </div>
          ) : (
            <div className="hud-feedback-card searching">
              <span className="loading-dots">Aproxime o código de barras</span>
              <p>Último item: {scannedProduct ? scannedProduct.description : 'Nenhum'}</p>
            </div>
          )
        ) : (
          scannedProduct ? (
            <div className="hud-manual-card animate-slide">
              <div className="hud-prod-header">
                <h4>{scannedProduct.description}</h4>
                <small>EAN: {scannedProduct.barcode}</small>
              </div>

              <div className="hud-qty-row">
                <div className="qty-input-box" style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                  <button type="button" className="btn-qty-adj" onClick={() => adjustQty(-1)}>-</button>
                  <input
                    type="number"
                    min="1"
                    value={scanQty}
                    onChange={(e) => setScanQty(Math.max(1, parseFloat(e.target.value) || 1))}
                    className="input-qty"
                    style={{ flex: 1 }}
                  />
                  <button type="button" className="btn-qty-adj" onClick={() => adjustQty(1)}>+</button>
                </div>
                
                <button 
                  type="button" 
                  className="btn-pallet-trigger" 
                  title="Calculadora de Pallets" 
                  onClick={() => setPalletOpen(true)}
                  style={{ height: '42px', width: '42px', borderRadius: '10px' }}
                >
                  📦
                </button>
              </div>

              <div className="multipliers-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', marginTop: '6px' }}>
                <button type="button" className="btn-mult" onClick={() => setScanQty(prev => prev + 5)}>+5</button>
                <button type="button" className="btn-mult" onClick={() => setScanQty(prev => prev + 10)}>+10</button>
                <button type="button" className="btn-mult" onClick={() => setScanQty(prev => prev + 50)}>+50</button>
                <button type="button" className="btn-mult" onClick={() => setScanQty(prev => prev + 100)}>+100</button>
              </div>

              <div className="hud-actions-row">
                <button type="button" onClick={confirmCount} className="btn-confirm-hud">
                  💾 Gravar Contagem
                </button>
                <button type="button" onClick={cancelCount} className="btn-cancel-hud">
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="hud-feedback-card searching">
              <span className="loading-dots">Aproxime o código de barras (Ajuste Manual)</span>
            </div>
          )
        )}
      </div>

      {errorMsg && (
        <div className="scanner-error-hud">
          <p>{errorMsg}</p>
          <button className="btn-retry-hud" onClick={() => window.location.reload()}>Recarregar App</button>
        </div>
      )}
    </div>
  );
}
