export default class IScanner {
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

  async toggleTorch(on) {
    throw new Error("toggleTorch() not implemented");
  }

  async setZoom(level) {
    throw new Error("setZoom() not implemented");
  }
}
