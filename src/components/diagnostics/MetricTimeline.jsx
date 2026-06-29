import React from 'react';

export function MetricTimeline({ timeline }) {
  // Uma timeline mais visual que foca apenas em estados (READY -> PROCESSING)
  const stateEvents = timeline.filter(t => t.type === 'state_machine' || t.type === 'scanner_event').slice(0, 5);
  
  return (
    <div className="card-custom glassmorphism" style={{ padding: '12px', marginTop: '16px' }}>
      <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'rgba(255,255,255,0.7)', marginBottom: '12px' }}>
        TIMELINE DE MÁQUINA DE ESTADOS
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {stateEvents.map((e, idx) => (
          <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-primary)' }} />
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{new Date(e.timestamp).toLocaleTimeString()}</span>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'white' }}>{e.message}</span>
          </div>
        ))}
        {stateEvents.length === 0 && <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>Sem transições recentes...</div>}
      </div>
    </div>
  );
}
