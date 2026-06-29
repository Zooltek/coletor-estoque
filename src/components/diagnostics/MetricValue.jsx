import React from 'react';

export function MetricValue({ label, value, unit = '', highlight = false }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{label}</span>
      <span style={{ fontSize: '16px', fontWeight: 'bold', color: highlight ? 'var(--color-primary)' : 'white' }}>
        {value} <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 'normal' }}>{unit}</span>
      </span>
    </div>
  );
}
