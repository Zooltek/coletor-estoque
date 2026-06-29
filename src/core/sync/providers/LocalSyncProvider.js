import { ISyncProvider } from './ISyncProvider';

export class LocalSyncProvider extends ISyncProvider {
  constructor() {
    super('LOCAL_STORAGE');
  }

  async send(payload) {
    // Guarda diretamente no local storage (como já era feito no App antes da refatoração)
    return Promise.resolve({ success: true });
  }
}
