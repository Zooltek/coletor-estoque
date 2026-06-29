import React from 'react';
import { MetricCard } from './MetricCard';
import { MetricGrid } from './MetricGrid';
import { MetricValue } from './MetricValue';

export function CameraPanel({ metrics }) {
  const m = metrics.camera;
  return (
    <MetricCard title="Camera Internals">
      <MetricGrid columns={2}>
        <MetricValue label="FPS" value={m.fps} unit="fps" highlight={m.fps > 20} />
        <MetricValue label="Zoom Atual" value={m.zoom.toFixed(2)} unit="x" />
        <MetricValue label="Frames Lidos" value={m.framesReceived} />
        <MetricValue label="Descartados" value={m.framesDropped} />
        <MetricValue label="Foco Ativo" value={m.focusActive ? 'SIM' : 'NÃO'} />
        <MetricValue label="Lanterna" value={m.torchActive ? 'ON' : 'OFF'} />
      </MetricGrid>
    </MetricCard>
  );
}
