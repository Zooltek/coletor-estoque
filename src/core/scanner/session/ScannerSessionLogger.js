export default class ScannerSessionLogger {
  static log(message, snapshot = null) {
    const timestamp = new Date().toISOString();
    console.log(`[SessionManager] [${timestamp}] -> ${message}`);
  }
}
