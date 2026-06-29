import { SyncManager } from '../core/sync';

export function useSync() {
  const enqueueJob = (type, payload, priority = 1) => {
    SyncManager.enqueue(type, payload, priority);
  };

  const forceSync = () => {
    SyncManager.processQueue();
  };

  const clearQueue = () => {
    SyncManager.clearQueue();
  };

  return { enqueueJob, forceSync, clearQueue };
}
