import { ISyncProvider } from './ISyncProvider';
import { defaultApiClient } from './ApiClient';

export class HttpSyncProvider extends ISyncProvider {
  constructor() {
    super('HTTP_API');
    this.apiClient = defaultApiClient;
  }

  async send(payload) {
    try {
      // Como estamos no mock, o endpoint pode ser '/sync' falso
      const response = await this.apiClient.post('/api/v1/sync', payload);
      return response.data;
    } catch (error) {
      // Repassa o erro para a SyncEngine lidar (Retry Policy)
      throw error;
    }
  }
}
