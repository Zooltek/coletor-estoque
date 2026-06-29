import { useState, useEffect } from 'react';
import { SyncManager } from '../core/sync';

export function useSyncStatus() {
  const [snapshot, setSnapshot] = useState(SyncManager.getSnapshot());

  useEffect(() => {
    const unsubscribe = SyncManager.subscribe((snap) => {
      setSnapshot(snap);
    });
    return unsubscribe;
  }, []);

  return snapshot;
}
