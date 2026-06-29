export const SyncSnapshot = {
  status: 'offline', // online, syncing, offline, error
  provider: 'none',
  queueSize: 0,
  lastSync: null,
  nextRetry: null,
  errors: 0,
  progress: {
    current: 0,
    total: 0
  }
};
