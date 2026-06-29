export default class ScannerCapabilities {
  constructor({
    supportsNative = false,
    supportsTorch = false,
    supportsZoom = false,
    supportsContinuousFocus = false,
    supportsAutoExposure = false,
    supportsMultipleBarcodes = false,
    supportsFormats = []
  } = {}) {
    this.supportsNative = supportsNative;
    this.supportsTorch = supportsTorch;
    this.supportsZoom = supportsZoom;
    this.supportsContinuousFocus = supportsContinuousFocus;
    this.supportsAutoExposure = supportsAutoExposure;
    this.supportsMultipleBarcodes = supportsMultipleBarcodes;
    this.supportsFormats = supportsFormats;
  }
}
