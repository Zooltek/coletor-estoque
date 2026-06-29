import React from 'react';

export function EventConsole({ timeline }) {
  return (
    <div className="card-custom glassmorphism" style={{ padding: '12px', marginTop: '16px', display: 'flex', flexDirection: 'column', height: '250px' }}>
      <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>
        EVENT CONSOLE
      </div>
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        background: 'rgba(0,0,0,0.5)', 
        padding: '10px', 
        borderRadius: '6px',
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#a3be8c'
      }}>
        {timeline.map(e => (
          <div key={e.id} style={{ marginBottom: '4px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '2px' }}>
            <span style={{ color: '#ebcb8b' }}>[{new Date(e.timestamp).toLocaleTimeString()}]</span> 
            <span style={{ color: '#88c0d0', margin: '0 6px' }}>[{e.type.toUpperCase()}]</span> 
            <span style={{ color: '#eceff4' }}>{e.message}</span>
          </div>
        ))}
        {timeline.length === 0 && <div style={{ color: 'rgba(255,255,255,0.3)' }}>Aguardando eventos...</div>}
      </div>
    </div>
  );
}
