import { useSyncStatus } from './useSyncStatus';

export function useSyncQueue() {
  const { jobs } = useSyncStatus();
  return jobs;
}
