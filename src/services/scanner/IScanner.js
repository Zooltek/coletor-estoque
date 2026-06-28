export default class IScanner {
  async initialize() {
    throw new Error("initialize() not implemented");
  }

  async start(elementId, onScan) {
    throw new Error("start() not implemented");
  }

  async stop() {
    throw new Error("stop() not implemented");
  }

  async pause() {
    throw new Error("pause() not implemented");
  }

  async resume() {
    throw new Error("resume() not implemented");
  }

  async destroy() {
    throw new Error("destroy() not implemented");
  }

  async setZoom(level) {
    throw new Error("setZoom() not implemented");
  }

  async toggleTorch(on) {
    throw new Error("toggleTorch() not implemented");
  }

  async isTorchAvailable() {
    throw new Error("isTorchAvailable() not implemented");
  }

  async isZoomAvailable() {
    throw new Error("isZoomAvailable() not implemented");
  }
}
