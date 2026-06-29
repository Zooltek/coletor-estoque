import React from 'react';
import { MetricCard } from './MetricCard';
import { MetricGrid } from './MetricGrid';
import { MetricValue } from './MetricValue';

export function PipelinePanel({ metrics }) {
  const m = metrics.pipeline;
  return (
    <MetricCard title="Scanner Pipeline">
      <MetricGrid columns={2}>
        <MetricValue label="Aceitos" value={m.accepted} highlight />
        <MetricValue label="Rejeitados" value={m.rejected} />
        <MetricValue label="Duplicados" value={m.duplicates} />
        <MetricValue label="Tempo Médio" value={m.avgProcessingTime.toFixed(1)} unit="ms" />
      </MetricGrid>
      <div style={{ marginTop: '8px', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
        Último Evento: {m.lastEvent || 'Nenhum'}
      </div>
    </MetricCard>
  );
}
