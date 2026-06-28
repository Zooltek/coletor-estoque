import { Html5Qrcode } from 'html5-qrcode';
import IScanner from './IScanner';

export default class Html5ScannerService extends IScanner {
  constructor() {
    super();
    this.html5Qrcode = null;
    this.isScanning = false;
  }

  async initialize() {
    // No-op for HTML5 before start
  }


  async start(elementId, onScan) {
    if (this.isScanning) {
      return;
    }

    this.html5Qrcode = new Html5Qrcode(elementId);
    this.isScanning = true;

    await this.html5Qrcode.start(
      { facingMode: "environment" },
      {
        fps: 15,
        qrbox: { width: 260, height: 130 }
      },
      (decodedText) => {
        onScan(decodedText);
      },
      (errorMessage) => {
        // Ignora erros normais de varredura
      }
    );
  }

  async stop() {
    if (this.html5Qrcode && this.html5Qrcode.isScanning) {
      await this.html5Qrcode.stop();
      this.html5Qrcode.clear();
    }
    this.isScanning = false;
    this.html5Qrcode = null;
  }

  async pause() {
    // Software pause is now handled by ScannerPipeline
  }

  async resume() {
    // Software resume is now handled by ScannerPipeline
  }

  async toggleTorch(on) {
    if (this.html5Qrcode && this.html5Qrcode.isScanning) {
      await this.html5Qrcode.applyVideoConstraints({
        advanced: [{ torch: on }]
      });
    }
  }

  async setZoom(level) {
    if (this.html5Qrcode && this.html5Qrcode.isScanning) {
      await this.html5Qrcode.applyVideoConstraints({
        advanced: [{ zoom: level }]
      });
    }
  }

  async destroy() {
    await this.stop();
  }

  async isTorchAvailable() {
    const caps = this.getCapabilities();
    return !!caps?.torch;
  }

  async isZoomAvailable() {
    const caps = this.getCapabilities();
    return !!caps?.zoom;
  }

  getCapabilities() {
    if (this.html5Qrcode && this.html5Qrcode.isScanning) {
      try {
        if (typeof this.html5Qrcode.getRunningTrackCapabilities === 'function') {
          return this.html5Qrcode.getRunningTrackCapabilities();
        }
      } catch (e) {
        console.warn("Recursos de câmera não suportados:", e);
      }
    }
    return null;
  }
}
