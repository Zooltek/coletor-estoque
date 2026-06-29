import React from 'react';
import { useSyncStatus } from '../../hooks/useSyncStatus';

export function SyncProgress() {
  const { status, nextRetry } = useSyncStatus();

  if (status !== 'offline' || !nextRetry) return null;

  // Calculando tempo restante seria legal, mas só exibe estático
  return (
    <div style={{ 
      padding: '8px', 
      background: 'rgba(255, 193, 7, 0.1)', 
      border: '1px solid #FFC107',
      borderRadius: '4px',
      fontSize: '11px',
      color: '#FFC107',
      marginBottom: '16px'
    }}>
      ⚠️ Conexão perdida ou falha. Próxima tentativa em: {new Date(nextRetry).toLocaleTimeString()}
    </div>
  );
}
