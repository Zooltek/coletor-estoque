import React from 'react';
import { useSyncStatus } from '../../hooks/useSyncStatus';

export function SyncStatus() {
  const status = useSyncStatus();

  return (
    <div className="card-custom glassmorphism" style={{ padding: '16px', marginBottom: '16px' }}>
      <h3 style={{ marginTop: 0, color: 'var(--color-primary)' }}>Status de Sincronização</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>ESTADO ATUAL</div>
          <div style={{ fontWeight: 'bold', textTransform: 'uppercase', color: status.status === 'error' ? '#ff4c4c' : 'white' }}>
            {status.status}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>PROVEDOR</div>
          <div style={{ fontWeight: 'bold' }}>{status.provider}</div>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>ITENS NA FILA</div>
          <div style={{ fontWeight: 'bold' }}>{status.queueSize} pendentes</div>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>ERROS</div>
          <div style={{ fontWeight: 'bold', color: status.errors > 0 ? '#ff4c4c' : 'white' }}>{status.errors}</div>
        </div>
      </div>
    </div>
  );
}
