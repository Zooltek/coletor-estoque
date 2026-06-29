import React from 'react';
import { MetricCard } from './MetricCard';
import { MetricGrid } from './MetricGrid';
import { MetricValue } from './MetricValue';

export function SessionPanel({ metrics }) {
  const m = metrics.session;
  return (
    <MetricCard title="Sessão & Estado do Scanner">
      <div style={{ marginBottom: '12px' }}>
        <MetricValue label="Estado da Máquina" value={metrics.scanner.state} highlight />
      </div>
      <MetricGrid columns={2}>
        <MetricValue label="Total de Leituras" value={m.readsTotal} />
        <MetricValue label="Leituras/Min" value={m.readsPerMinute.toFixed(1)} />
        <MetricValue label="Tempo Médio Leitura" value={m.avgTime.toFixed(1)} unit="ms" />
        <MetricValue label="Maior Intervalo" value={m.longestInterval} unit="ms" />
      </MetricGrid>
    </MetricCard>
  );
}
