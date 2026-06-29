import React from 'react';
import { MetricCard } from './MetricCard';
import { MetricGrid } from './MetricGrid';
import { MetricValue } from './MetricValue';

export function PerformancePanel({ metrics }) {
  const m = metrics.performance;
  return (
    <MetricCard title="Performance (Latência)">
      <MetricGrid columns={3}>
        <MetricValue label="Render" value={m.renderTime.toFixed(1)} unit="ms" />
        <MetricValue label="Pipeline" value={m.pipelineTime.toFixed(1)} unit="ms" />
        <MetricValue label="ML Kit" value={m.mlKitTime.toFixed(1)} unit="ms" />
        <MetricValue label="Feedback" value={m.feedbackTime.toFixed(1)} unit="ms" />
        <MetricValue label="Scanner" value={m.scannerTime.toFixed(1)} unit="ms" />
        <MetricValue label="Camera" value={m.cameraTime.toFixed(1)} unit="ms" />
      </MetricGrid>
    </MetricCard>
  );
}
