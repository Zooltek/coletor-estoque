import React, { useState, useEffect } from 'react';
import { getSyncMode, setSyncMode, getApiEndpoint, setApiEndpoint } from '../utils/storage';
import { exportToTXT, exportToCSV } from '../utils/exporter';

export default function KardexDashboard({ inventory, counts, catalog, mergedCounts, onClearLocalCounts, onOpenReport }) {
  const [syncMode, setLocalSyncMode] = useState(getSyncMode());
  const [apiEndpoint, setLocalApiEndpoint] = useState(getApiEndpoint());
  const [apiLogs, setApiLogs] = useState([]);
  
  // Contagens unificadas (coletas locais ou mesclagem de arquivos)
  const activeCounts = mergedCounts || counts.filter(c => c.idInventario === inventory.id);

  useEffect(() => {
    // Escuta logs enviados pelo App principal caso ocorram leituras em tempo real
    const interval = setInterval(() => {
      const logs = window.sc_api_logs || [];
      if (logs.length !== apiLogs.length) {
        setApiLogs([...logs]);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [apiLogs]);

  const handleModeChange = (mode) => {
    setSyncMode(mode);
    setLocalSyncMode(mode);
    addLog(`Configuração`, `Alterado modo de sincronização para: ${mode === 'online' ? 'Tempo Real' : 'Lote'}`);
  };

  const handleSaveEndpoint = () => {
    setApiEndpoint(apiEndpoint);
    addLog(`Configuração`, `Endpoint da API atualizado para: ${apiEndpoint}`);
    alert('Endpoint salvo com sucesso!');
  };

  const addLog = (type, message, payload = null) => {
    const logItem = {
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
      payload: payload ? JSON.stringify(payload, null, 2) : null
    };
    const newLogs = [logItem, ...(window.sc_api_logs || [])];
    window.sc_api_logs = newLogs;
    setApiLogs(newLogs);
  };

  // Testar Conexão com o ERP
  const handleTestConnection = async () => {
    addLog('API TEST', `Testando conexão HTTP POST com o endpoint: ${apiEndpoint}...`);
    try {
      const startTimeMs = Date.now();
      // Envia uma requisição HTTP real. Nota: Pode dar erro de CORS em servidores locais de teste,
      // mas é o comportamento esperado para provar que a chamada foi feita.
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true, timestamp: new Date().toISOString(), app: "Amura Collector" })
      });
      
      const duration = Date.now() - startTimeMs;
      if (response.ok || response.status === 201 || response.status === 200) {
        addLog('API RESPONSE', `Conexão bem-sucedida! Status: ${response.status} OK (Duração: ${duration}ms)`);
        alert('Teste de conexão bem-sucedido! O ERP está online e respondendo.');
      } else {
        addLog('API RESPONSE', `Erro na resposta do ERP. Status: ${response.status} ${response.statusText} (Duração: ${duration}ms)`);
        alert(`O servidor respondeu, mas retornou um status de erro: ${response.status}.`);
      }
    } catch (err) {
      addLog('API ERROR', `Falha de rede ao tentar se conectar. Detalhes: ${err.message}`);
      alert(`Falha de conexão física/rede: ${err.message}\n\n(Consulte o monitor de logs abaixo para ver o erro técnico de rede ou restrição de CORS).`);
    }
  };

  // Enviar contagem em lote para o ERP via API (simplificado para contagem cega/normal)
  const handleSyncBatchAPI = async () => {
    if (activeCounts.length === 0) {
      alert('Nenhuma contagem disponível para sincronizar.');
      return;
    }

    addLog('API POST', `Consolidando e enviando lote do inventário #${inventory.id} para o ERP no endpoint: ${apiEndpoint}...`);
    
    // Consolidar leituras normais por código de barras (desconsidera recontagem/conferência)
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
      dataInicio: inventory.startedAt, // Data/Hora de início do inventário (corte para o Kardex do ERP)
      itens: Object.keys(consolidated).map(code => ({
        codigoBarras: code,
        quantidadeContada: consolidated[code]
      }))
    };

    try {
      const startTimeMs = Date.now();
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const duration = Date.now() - startTimeMs;
      if (response.ok || response.status === 200 || response.status === 201) {
        addLog('API RESPONSE', `Sincronização concluída com sucesso! Status: ${response.status} OK (Duração: ${duration}ms)`, payload);
        alert('Contagem de lote enviada e integrada com sucesso no ERP!');
      } else {
        addLog('API RESPONSE', `Erro no processamento do lote pelo ERP. Status: ${response.status} (Duração: ${duration}ms)`, payload);
        alert(`O ERP recebeu o lote, mas retornou erro de processamento: Status ${response.status}`);
      }
    } catch (err) {
      addLog('API ERROR', `Falha de conexão ao enviar lote. Detalhes: ${err.message}`, payload);
      alert(`Erro ao enviar lote: ${err.message}\n\n(A contagem continua salva de forma segura no aparelho. O payload JSON consolidado foi gerado e registrado no monitor de logs abaixo).`);
    }
  };

  // Contadores rápidos para o resumo de exportação
  const totalCounted = activeCounts.filter(c => c.mode !== 'recontagem').reduce((acc, c) => acc + c.quantity, 0);
  const totalDistinctSKUs = new Set(activeCounts.filter(c => c.mode !== 'recontagem').map(c => c.barcode)).size;
  const sectorsCounted = new Set(activeCounts.map(c => c.sector)).size;

  return (
    <div className="kardex-dashboard-wrapper">
      {/* 1. SELETOR DE MODO E CONFIGURAÇÃO DA API */}
      <div className="card-custom glassmorphism animate-fade">
        <div className="card-header-custom">
          <h4>🔌 Integração de Comunicação com ERP</h4>
          <p className="card-subtitle">Configure como o Amura Collector transmite as contagens coletadas ao sistema central.</p>
        </div>

        <div className="integration-mode-selector">
          <label className={`mode-card ${syncMode === 'online' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="sync_mode"
              value="online"
              checked={syncMode === 'online'}
              onChange={() => handleModeChange('online')}
            />
            <span className="mode-title">⚡ Tempo Real (Online)</span>
            <span className="mode-desc">Cada leitura de código de barras envia uma requisição imediata de contagem à API do ERP.</span>
          </label>

          <label className={`mode-card ${syncMode === 'lote' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="sync_mode"
              value="lote"
              checked={syncMode === 'lote'}
              onChange={() => handleModeChange('lote')}
            />
            <span className="mode-title">📦 Lote / Arquivo (Offline-First)</span>
            <span className="mode-desc">Salva offline no aparelho. Ao final, mescle ou envie o lote completo via API / Arquivo TXT.</span>
          </label>
        </div>

        <div className="form-group-endpoint">
          <label>Endpoint API de Contagem do ERP</label>
          <div className="endpoint-input-container">
            <input
              type="text"
              value={apiEndpoint}
              onChange={(e) => setLocalApiEndpoint(e.target.value)}
              className="input-endpoint"
              placeholder="https://erp.sistema.com/api/contagem"
              style={{ width: '100%', marginBottom: '10px' }}
            />
            <div className="endpoint-buttons-row" style={{ display: 'flex', gap: '8px', width: '100%' }}>
              <button className="btn-save-endpoint" style={{ background: '#7a0c7b', flex: 1 }} onClick={handleTestConnection}>Testar Conexão</button>
              <button className="btn-save-endpoint" style={{ flex: 1 }} onClick={handleSaveEndpoint}>Salvar</button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MONITOR DE COMUNICAÇÃO (LOGS HTTP) - MOVIDO PARA CIMA */}
      <div className="card-custom glassmorphism animate-fade" style={{ marginTop: '20px' }}>
        <div className="card-header-custom">
          <h4>📜 Monitor de Comunicação API (Log do ERP)</h4>
          <p className="card-subtitle">Exibe o tráfego HTTP de requisições enviadas ao ERP configurado.</p>
        </div>

        <div className="api-log-viewer" style={{ maxHeight: '200px' }}>
          {apiLogs.length === 0 ? (
            <div className="log-empty">Nenhuma chamada HTTP registrada no monitor.</div>
          ) : (
            apiLogs.map((log, index) => (
              <div key={index} className="log-item-api">
                <div className="log-meta">
                  <span className="log-time">[{log.timestamp}]</span>
                  <span className={`log-badge badge-${log.type.toLowerCase().replace(' ', '-')}`}>{log.type}</span>
                  <span className="log-msg">{log.message}</span>
                </div>
                {log.payload && (
                  <pre className="log-payload"><code>{log.payload}</code></pre>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 3. PAINEL DE EXPORTAÇÃO E ENVIO DE DADOS (REPLACING KARDEX) */}
      <div className="card-custom glassmorphism animate-fade" style={{ marginTop: '20px' }}>
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
            📤 Enviar Lote de Contagem via API
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
    </div>
  );
}
