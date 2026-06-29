import React from 'react';
import { exportToTXT, exportToCSV } from '../utils/exporter';
import { SyncStatus } from './sync/SyncStatus';
import { SyncQueuePanel } from './sync/SyncQueuePanel';
import { SyncProgress } from './sync/SyncProgress';
import { useSync } from '../hooks/useSync';

export default function KardexDashboard({ inventory, counts, catalog, mergedCounts, onClearLocalCounts, onOpenReport }) {
  const { enqueueJob } = useSync();
  
  // Contagens unificadas (coletas locais ou mesclagem de arquivos)
  const activeCounts = mergedCounts || counts.filter(c => c.idInventario === inventory.id);

  const handleSyncBatchAPI = async () => {
    if (activeCounts.length === 0) {
      alert('Nenhuma contagem disponível para sincronizar.');
      return;
    }

    // Consolidar leituras normais por código de barras
    const consolidated = {};
    activeCounts.forEach(c => {
      if (c.mode !== 'recontagem') {
        consolidated[c.barcode] = (consolidated[c.barcode] || 0) + c.quantity;
      }
    });

    const payload = {
      idInventario: inventory.id,
      nomeInventario: inventory.name,
      loja: inventory.store,
      categoriaFiltro: inventory.categoryFilter || "Todas",
      marcaFiltro: inventory.brandFilter || "Todas",
      dataCriacao: inventory.createdAt,
      dataInicio: inventory.startedAt,
      itens: Object.keys(consolidated).map(code => ({
        codigoBarras: code,
        quantidadeContada: consolidated[code]
      }))
    };

    // Adiciona na fila da Sync Engine
    enqueueJob('ENVIO_LOTE_INVENTARIO', payload, 10); // Prioridade 10
    
    alert('Contagem de lote adicionada à fila de Sincronização da Engine!');
  };

  // Contadores rápidos para o resumo de exportação
  const totalCounted = activeCounts.filter(c => c.mode !== 'recontagem').reduce((acc, c) => acc + c.quantity, 0);
  const totalDistinctSKUs = new Set(activeCounts.filter(c => c.mode !== 'recontagem').map(c => c.barcode)).size;
  const sectorsCounted = new Set(activeCounts.map(c => c.sector)).size;

  return (
    <div className="kardex-dashboard-wrapper animate-fade">
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ color: 'var(--color-primary)', marginTop: 0 }}>Sync Engine Dashboard</h2>
        <p style={{ color: 'var(--text-muted)' }}>Gerenciamento avançado de sincronização offline-first.</p>
      </div>

      <SyncStatus />
      <SyncProgress />
      
      {/* 3. PAINEL DE EXPORTAÇÃO E ENVIO DE DADOS (REPLACING KARDEX) */}
      <div className="card-custom glassmorphism" style={{ marginTop: '20px' }}>
        <div className="card-header-custom">
          <h4>📤 Ações de Exportação e Sincronização</h4>
          <p className="card-subtitle">Sincronize ou exporte as contagens acumuladas para o banco de dados do seu ERP.</p>
        </div>

        <div className="summary-cards" style={{ margin: '15px 0' }}>
          <div className="card" style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.02)', borderLeft: '4px solid var(--color-primary)', borderRadius: '6px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Físico Contado</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{totalCounted} un</div>
          </div>
          <div className="card" style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.02)', borderLeft: '4px solid var(--color-secondary)', borderRadius: '6px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>SKUs Únicos</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{totalDistinctSKUs} itens</div>
          </div>
          <div className="card" style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.02)', borderLeft: '4px solid var(--color-success)', borderRadius: '6px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Setores</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{sectorsCounted} setores</div>
          </div>
        </div>

        <div className="integration-actions-row" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
          <button 
            className="btn-action-kardex btn-primary" 
            onClick={handleSyncBatchAPI} 
            disabled={activeCounts.length === 0}
            style={{ width: '100%', padding: '12px', fontWeight: 'bold' }}
          >
            🔄 Enviar Lote de Contagem via Sync Engine
          </button>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            <button 
              className="btn-action-kardex btn-secondary" 
              onClick={onOpenReport} 
              disabled={activeCounts.length === 0}
              style={{ padding: '10px 4px', fontSize: '12px' }}
            >
              🖨️ Relatório PDF
            </button>
            <button 
              className="btn-action-kardex btn-secondary" 
              onClick={() => exportToTXT(activeCounts, `inventario_${inventory.id}_consolidado.txt`)} 
              disabled={activeCounts.length === 0}
              style={{ padding: '10px 4px', fontSize: '12px' }}
            >
              💾 Exportar TXT
            </button>
            <button 
              className="btn-action-kardex btn-secondary" 
              onClick={() => exportToCSV(activeCounts, catalog, `inventario_${inventory.id}_tabela.csv`)} 
              disabled={activeCounts.length === 0}
              style={{ padding: '10px 4px', fontSize: '12px' }}
            >
              💾 Exportar CSV
            </button>
          </div>
        </div>

        {activeCounts.length > 0 && (
          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
            <button 
              onClick={onClearLocalCounts}
              style={{ 
                background: 'rgba(239, 68, 68, 0.1)', 
                color: 'var(--color-danger)', 
                border: '1px solid rgba(239, 68, 68, 0.2)', 
                padding: '8px 16px', 
                borderRadius: '8px', 
                fontSize: '11px',
                fontWeight: '500',
                cursor: 'pointer' 
              }}
            >
              🗑️ Limpar Contagens Locais Deste Inventário
            </button>
          </div>
        )}
      </div>

      {/* 4. FILA DE SINCRONIZAÇÃO */}
      <SyncQueuePanel />
    </div>
  );
}
