import React from 'react';
import { MetricCard } from './MetricCard';
import { MetricGrid } from './MetricGrid';
import { MetricValue } from './MetricValue';

export function MemoryPanel({ metrics }) {
  const m = metrics.memory;
  return (
    <MetricCard title="Device & Memory">
      <MetricGrid columns={2}>
        <MetricValue label="Heap Usado" value={m.heapUsed} />
        <MetricValue label="Heap Total" value={m.heapTotal} />
        <MetricValue label="Bateria" value={m.batteryLevel} unit="%" highlight={m.batteryLevel < 15} />
        <MetricValue label="Termal" value={m.thermalState} highlight={m.thermalState !== 'NORMAL'} />
      </MetricGrid>
    </MetricCard>
  );
}
