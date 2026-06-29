import React from 'react';

export function MetricCard({ title, children }) {
  return (
    <div className="metric-card card-custom glassmorphism" style={{ padding: '12px', marginBottom: '12px' }}>
      <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'rgba(255,255,255,0.7)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
        {title}
      </div>
      <div className="metric-card-content">
        {children}
      </div>
    </div>
  );
}
