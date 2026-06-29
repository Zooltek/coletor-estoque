import IScanner from './IScanner';
import { BarcodeScannerPlugin } from './definitions';
import ScannerCapabilities from './ScannerCapabilities';

export default class NativeScannerAdapter extends IScanner {
  constructor() {
    super();
    this.isScanning = false;
    this.listener = null;
  }

  async initialize() {
    // No-op for native
  }

  async start(elementId, onScan) {
    if (this.isScanning) return;

    try {
      document.body.classList.add('barcode-scanner-active');

      this.listener = await BarcodeScannerPlugin.addListener('barcodeDetected', (result) => {
        // O plugin agora envia o BarcodeResult completo com rawValue, format, boundingBox, etc.
        // O ScannerPipeline cuida do debounce.
        if (result && result.rawValue) {
          // Mantendo a compatibilidade do onScan enviando o valor final pro pipeline
          onScan(result.rawValue);
        }
      });

      await BarcodeScannerPlugin.start();
      this.isScanning = true;
    } catch (err) {
      console.error("Erro ao iniciar NativeScannerAdapter:", err);
      document.body.classList.remove('barcode-scanner-active');
      throw err;
    }
  }

  async stop() {
    if (!this.isScanning) return;

    try {
      if (this.listener) {
        await this.listener.remove();
        this.listener = null;
      }
      await BarcodeScannerPlugin.stop();
    } catch (err) {
      console.error("Erro ao parar NativeScannerAdapter:", err);
    } finally {
      document.body.classList.remove('barcode-scanner-active');
      this.isScanning = false;
    }
  }

  async pause() {
    try {
      await BarcodeScannerPlugin.pause();
    } catch (err) {
      console.error("Erro ao pausar NativeScannerAdapter:", err);
    }
  }

  async resume() {
    try {
      await BarcodeScannerPlugin.resume();
    } catch (err) {
      console.error("Erro ao retomar NativeScannerAdapter:", err);
    }
  }

  async toggleTorch(on) {
    try {
      await BarcodeScannerPlugin.toggleTorch({ on });
    } catch (err) {
      console.error("Erro ao alternar lanterna nativa:", err);
    }
  }

  async setZoom(level) {
    try {
      await BarcodeScannerPlugin.setZoom({ level });
    } catch (err) {
      console.error("Erro ao definir zoom nativo:", err);
    }
  }

  async destroy() {
    await this.stop();
  }

  getCapabilities() {
    return new ScannerCapabilities({
      supportsNative: true,
      supportsTorch: true,
      supportsZoom: true,
      supportsContinuousFocus: true, // CameraX faz isso
      supportsAutoExposure: true,
      supportsMultipleBarcodes: false, // Por enquanto não (RFC prevê no futuro)
      supportsFormats: ['EAN_13', 'EAN_8', 'CODE_128', 'QR_CODE', 'CODE_39', 'DATA_MATRIX']
    });
  }
}
