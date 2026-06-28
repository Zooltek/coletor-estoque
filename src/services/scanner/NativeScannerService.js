import IScanner from './IScanner';
import { BarcodeScannerPlugin } from './definitions';

export default class NativeScannerService extends IScanner {
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
      // Torna a interface web transparente para expor a visualização nativa por trás
      document.body.classList.add('barcode-scanner-active');

      // Adiciona o listener para detecções
      this.listener = await BarcodeScannerPlugin.addListener('barcodeDetected', (result) => {
        if (result && result.barcode) {
          onScan(result.barcode);
        }
      });

      // Inicia a visualização nativa
      await BarcodeScannerPlugin.start();
      this.isScanning = true;
    } catch (err) {
      console.error("Erro ao iniciar NativeScannerPlugin:", err);
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
      console.error("Erro ao parar NativeScannerPlugin:", err);
    } finally {
      document.body.classList.remove('barcode-scanner-active');
      this.isScanning = false;
    }
  }

  async pause() {
    try {
      await BarcodeScannerPlugin.pause();
    } catch (err) {
      console.error("Erro ao pausar NativeScannerPlugin:", err);
    }
  }

  async resume() {
    try {
      await BarcodeScannerPlugin.resume();
    } catch (err) {
      console.error("Erro ao retomar NativeScannerPlugin:", err);
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

  async isTorchAvailable() {
    const caps = this.getCapabilities();
    return !!caps?.torch;
  }

  async isZoomAvailable() {
    const caps = this.getCapabilities();
    return !!caps?.zoom;
  }

  getCapabilities() {
    return {
      zoom: true,
      torch: true
    };
  }
}
