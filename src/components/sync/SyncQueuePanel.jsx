import React from 'react';
import { useSyncQueue } from '../../hooks/useSyncQueue';
import { useSync } from '../../hooks/useSync';

export function SyncQueuePanel() {
  const jobs = useSyncQueue();
  const { forceSync, clearQueue } = useSync();

  return (
    <div className="card-custom glassmorphism" style={{ padding: '16px', marginTop: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h4 style={{ margin: 0 }}>Fila de Tarefas (Jobs)</h4>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={forceSync} style={{ padding: '4px 8px', fontSize: '11px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '4px' }}>Force Sync</button>
          <button onClick={clearQueue} style={{ padding: '4px 8px', fontSize: '11px', background: '#ff4c4c', color: 'white', border: 'none', borderRadius: '4px' }}>Clear</button>
        </div>
      </div>
      
      <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
        {jobs.length === 0 && <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Fila vazia. Tudo sincronizado!</div>}
        {jobs.map(job => (
          <div key={job.id} style={{ 
            padding: '8px', 
            background: 'rgba(0,0,0,0.2)', 
            marginBottom: '4px', 
            borderRadius: '4px',
            borderLeft: `3px solid ${job.status === 'failed' ? '#ff4c4c' : 'var(--color-primary)'}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong style={{ fontSize: '12px' }}>{job.type}</strong>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>{job.status.toUpperCase()}</span>
            </div>
            {job.lastError && (
              <div style={{ fontSize: '10px', color: '#ff4c4c', marginTop: '4px' }}>Erro: {job.lastError} (Tentativas: {job.attempts})</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
