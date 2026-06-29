import { ISyncProvider } from './ISyncProvider';

export class FileSyncProvider extends ISyncProvider {
  constructor() {
    super('FILE_SYSTEM');
  }

  async send(payload) {
    // Apenas simula sucesso (o download é acionado pela UI manualmente)
    return Promise.resolve({ success: true, method: 'file' });
  }
}
