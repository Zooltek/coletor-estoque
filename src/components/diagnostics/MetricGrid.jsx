import React from 'react';

export function MetricGrid({ columns = 2, children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: '12px' }}>
      {children}
    </div>
  );
}
