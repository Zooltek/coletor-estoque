import { Capacitor } from '@capacitor/core';

export default class ScannerDetector {
  static async detectBestScanner() {
    // 1. Android Nativo via Capacitor (ML Kit)
    if (Capacitor.isNativePlatform()) {
      try {
        // Se quisermos poderíamos checar a permissão aqui, mas o Adapter lida com isso no start().
        return 'NATIVE';
      } catch (e) {
        console.warn('Erro ao verificar nativo, caindo para fallback.', e);
      }
    }

    // 2. Fallback para HTML5 (Navegadores/PWA)
    return 'HTML5';
  }
}
