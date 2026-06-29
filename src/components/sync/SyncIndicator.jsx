import React from 'react';
import { useSyncStatus } from '../../hooks/useSyncStatus';

export function SyncIndicator() {
  const { status, queueSize } = useSyncStatus();

  let color = '#4CAF50'; // online
  if (status === 'syncing') color = '#2196F3';
  if (status === 'offline') color = '#FFC107';
  if (status === 'error') color = '#F44336';

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 8px',
      borderRadius: '20px',
      background: 'rgba(255,255,255,0.1)',
      fontSize: '11px',
      fontWeight: 'bold'
    }} title={`Sync: ${status} | Fila: ${queueSize}`}>
      <span style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: color,
        boxShadow: `0 0 5px ${color}`
      }}/>
      {queueSize > 0 ? `${queueSize}` : ''}
    </div>
  );
}
