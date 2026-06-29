import React from 'react';
import { useDiagnostics } from '../../hooks/useDiagnostics';
import { SessionPanel } from './SessionPanel';
import { CameraPanel } from './CameraPanel';
import { PipelinePanel } from './PipelinePanel';
import { MemoryPanel } from './MemoryPanel';
import { PerformancePanel } from './PerformancePanel';
import { EventConsole } from './EventConsole';
import { MetricTimeline } from './MetricTimeline';
import { MetricBadge } from './MetricBadge';

export default function DiagnosticsPage() {
  const { snapshot, timeline, exportJSON, exportTXT, reset } = useDiagnostics();

  if (!snapshot) return <div>Carregando...</div>;

  return (
    <div className="diagnostics-page animate-fade" style={{ padding: '16px', paddingBottom: '80px', height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Centro de Diagnóstico</h2>
        <MetricBadge label="Coleta Ativa" active={true} />
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={exportJSON} className="btn-add-sector" style={{ flex: 1, padding: '8px', fontSize: '12px' }}>💾 Exp JSON</button>
        <button onClick={exportTXT} className="btn-add-sector" style={{ flex: 1, padding: '8px', fontSize: '12px', background: 'rgba(255,255,255,0.1)' }}>📄 Exp TXT</button>
        <button onClick={reset} className="btn-danger" style={{ flex: 1, padding: '8px', fontSize: '12px' }}>♻️ Limpar</button>
      </div>

      <SessionPanel metrics={snapshot} />
      <CameraPanel metrics={snapshot} />
      <PipelinePanel metrics={snapshot} />
      <PerformancePanel metrics={snapshot} />
      <MemoryPanel metrics={snapshot} />
      
      <MetricTimeline timeline={timeline} />
      <EventConsole timeline={timeline} />
    </div>
  );
}
