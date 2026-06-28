import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function Scanner({ onScan, onClose }) {
  const [errorMsg, setErrorMsg] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const qrRef = useRef(null);
  const scannerRef = useRef(null);
  const lastScannedRef = useRef({ code: '', time: 0 });

  useEffect(() => {
    // Inicializa o leitor
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
            qrbox: { width: 250, height: 120 } // Retângulo mais achatado, ideal para código de barras de produtos
          },
          (decodedText) => {
            const now = Date.now();
            // Ignora leituras repetidas do mesmo código num intervalo de 2 segundos
            if (lastScannedRef.current.code === decodedText && (now - lastScannedRef.current.time) < 2000) {
              return;
            }
            lastScannedRef.current = { code: decodedText, time: now };
            onScan(decodedText);
          },
          (errorMessage) => {
            // Ignora erros normais de varredura sem código
          }
        );
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
        }).catch(err => console.error("Erro ao parar scanner", err));
      }
    };
  }, [onScan]);

  return (
    <div className="camera-scanner-container">
      <div className="scanner-header">
        <span>📸 Câmera Ativa (Código de Barras/QR)</span>
        <button className="btn-close-scanner" onClick={onClose}>Fechar</button>
      </div>

      <div className="scanner-frame">
        <div id="camera-reader-element" ref={qrRef}></div>
        {cameraActive && <div className="scanner-laser-line"></div>}
      </div>

      {errorMsg ? (
        <div className="scanner-error">
          <p>{errorMsg}</p>
          <button className="btn-retry" onClick={() => window.location.reload()}>Recarregar App</button>
        </div>
      ) : (
        <p className="scanner-hint">Aponte a câmera para o código de barras do produto</p>
      )}
    </div>
  );
}
