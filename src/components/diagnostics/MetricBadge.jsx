import React from 'react';

export function MetricBadge({ label, active, color = '#4CAF50' }) {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 8px',
      borderRadius: '4px',
      background: active ? `${color}33` : 'rgba(255,255,255,0.1)',
      border: `1px solid ${active ? color : 'rgba(255,255,255,0.2)'}`,
      fontSize: '11px',
      color: active ? color : 'rgba(255,255,255,0.5)',
      fontWeight: 'bold'
    }}>
      <span style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: active ? color : 'rgba(255,255,255,0.5)',
        boxShadow: active ? `0 0 6px ${color}` : 'none'
      }}/>
      {label}
    </div>
  );
}
