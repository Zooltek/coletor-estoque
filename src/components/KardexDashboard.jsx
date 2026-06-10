import React, { useState, useEffect } from 'react';
import { getKardex, addKardexMove, getSyncMode, setSyncMode, getApiEndpoint, setApiEndpoint } from '../utils/storage';
import { exportToTXT, exportToCSV, printPDFReport } from '../utils/exporter';

export default function KardexDashboard({ inventory, counts, catalog, mergedCounts, onClearLocalCounts }) {
  const [syncMode, setLocalSyncMode] = useState(getSyncMode());
  const [apiEndpoint, setLocalApiEndpoint] = useState(getApiEndpoint());
  const [kardexList, setKardexList] = useState(getKardex());
  
  // Para simular novas transações de Kardex
  const [newBarcode, setNewBarcode] = useState('');
  const [newType, setNewType] = useState('venda');
  const [newQty, setNewQty] = useState(1);
  const [newTimeOffset, setNewTimeOffset] = useState(5); // Minutos após início

  // Logs de chamadas de API simuladas
  const [apiLogs, setApiLogs] = useState([]);
  
  // Contagens unificadas (coletas locais ou mesclagem de arquivos)
  const activeCounts = mergedCounts || counts.filter(c => c.idInventario === inventory.id);

  // Calcula início da contagem
  const startTime = inventory.startedAt ? new Date(inventory.startedAt) : new Date();

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

  // Simular transação no Kardex
  const handleAddKardexTransaction = (e) => {
    e.preventDefault();
    if (!newBarcode || newQty <= 0) return;

    // Calcula timestamp com base no tempo de início + offset de minutos
    const transTime = new Date(startTime.getTime() + newTimeOffset * 60 * 1000);
    
    const move = {
      barcode: newBarcode,
      type: newType,
      quantity: Number(newQty),
      timestamp: transTime.toISOString()
    };

    addKardexMove(move);
    setKardexList(getKardex());
    setNewBarcode('');
    alert(`Lançamento Kardex adicionado: ${newType === 'venda' ? 'Venda' : 'Entrada'} de ${newQty}x do produto ${newBarcode}`);
  };

  // Processa conciliação do Kardex
  const getKardexAdjustments = () => {
    const adjustments = [];
    
    catalog.forEach(p => {
      const pCounts = activeCounts.filter(c => c.barcode === p.barcode && c.mode !== 'recontagem');
      const qtyFisica = pCounts.reduce((acc, c) => acc + c.quantity, 0);

      // Filtra movimentações do Kardex ocorridas APÓS a hora de início
      const pKardex = kardexList.filter(k => k.barcode === p.barcode && new Date(k.timestamp) > startTime);
      
      const sales = pKardex.filter(k => k.type === 'venda').reduce((acc, k) => acc + k.quantity, 0);
      const entries = pKardex.filter(k => k.type === 'entrada').reduce((acc, k) => acc + k.quantity, 0);

      if (qtyFisica > 0 || sales > 0 || entries > 0 || p.stock > 0) {
        adjustments.push({
          barcode: p.barcode,
          description: p.description,
          brand: p.brand,
          category: p.category,
          stock: p.stock,
          counted: qtyFisica,
          sales,
          entries,
          // Final Conciliado = Contado - Vendas + Entradas
          finalQty: qtyFisica - sales + entries,
          divergence: (qtyFisica - sales + entries) - p.stock
        });
      }
    });

    return adjustments;
  };

  const adjustments = getKardexAdjustments();

  // Enviar contagem em lote para o ERP via API
  const handleSyncBatchAPI = () => {
    if (activeCounts.length === 0) {
      alert('Nenhuma contagem disponível para sincronizar.');
      return;
    }

    addLog('API POST', `Enviando lote de contagem de inventário #${inventory.id} para ERP...`);
    
    // Simula a carga do JSON consolidada
    const payload = adjustments.map(a => ({
      codigoBarras: a.barcode,
      quantidadeContada: a.counted,
      quantidadeFinalAjustada: a.finalQty,
      kardexVendasDescontadas: a.sales,
      kardexEntradasSomadas: a.entries
    }));

    setTimeout(() => {
      addLog('API RESPONSE', 'Sincronização em Lote concluída com sucesso! Status: 200 OK', payload);
      alert('Sincronização de lote concluída! Dados integrados no ERP.');
    }, 1500);
  };

  return (
    <div className="kardex-dashboard-wrapper">
      {/* 1. SELETOR DE MODO DE INTEGRACAO */}
      <div className="card-custom glassmorphism animate-fade">
        <div className="card-header-custom">
          <h4>🔌 Integração com ERP</h4>
          <p className="card-subtitle">Configure como o Amura Collector transmite as coletas para a contagem do ERP.</p>
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
            <span className="mode-desc">Salva offline no aparelho. Ao final, mescle ou envie o lote conciliado via API / Arquivo TXT.</span>
          </label>
        </div>

        <div className="form-group-endpoint">
          <label>Endpoint API de Contagem do ERP</label>
          <div className="endpoint-input-row">
            <input
              type="text"
              value={apiEndpoint}
              onChange={(e) => setLocalApiEndpoint(e.target.value)}
              className="input-endpoint"
              placeholder="https://erp.sistema.com/api/contagem"
            />
            <button className="btn-save-endpoint" onClick={handleSaveEndpoint}>Salvar</button>
          </div>
        </div>
      </div>

      {/* 2. CONCILIAÇÃO KARDEX E DIVERGÊNCIAS */}
      <div className="card-custom glassmorphism animate-fade" style={{ marginTop: '20px' }}>
        <div className="card-header-custom">
          <h4>📊 Painel de Conciliação Kardex & Divergências</h4>
          <p className="card-subtitle">
            Conciliação automática. Data/Hora de início do Inventário: <strong>{startTime.toLocaleString('pt-BR')}</strong>.
            Movimentações do Kardex após este horário serão processadas na integração final.
          </p>
        </div>

        {/* Lançador de Vendas/Entradas de Teste no Kardex */}
        <form onSubmit={handleAddKardexTransaction} className="kardex-sim-form">
          <h5>🛠️ Simular Movimentação no Kardex do ERP (Venda/Entrada durante contagem)</h5>
          <div className="sim-inputs-row">
            <select value={newBarcode} onChange={(e) => setNewBarcode(e.target.value)} className="input-sim select-prod" required>
              <option value="">-- Escolha um Produto --</option>
              {catalog.map(p => (
                <option key={p.barcode} value={p.barcode}>{p.description} ({p.barcode})</option>
              ))}
            </select>

            <select value={newType} onChange={(e) => setNewType(e.target.value)} className="input-sim width-auto">
              <option value="venda">Venda (Saída)</option>
              <option value="entrada">Compra (Entrada)</option>
            </select>

            <input
              type="number"
              min="1"
              value={newQty}
              onChange={(e) => setNewQty(Math.max(1, Number(e.target.value)))}
              className="input-sim width-small"
              placeholder="Qtd"
              required
            />

            <input
              type="number"
              value={newTimeOffset}
              onChange={(e) => setNewTimeOffset(Number(e.target.value))}
              className="input-sim width-medium"
              placeholder="Minutos pós-início"
              title="Tempo em minutos após o início do inventário em que a venda/entrada ocorreu"
            />

            <button type="submit" className="btn-add-sim">Lançar no Kardex</button>
          </div>
        </form>

        {/* Tabela de Divergências */}
        <div className="table-responsive-kardex">
          <table className="kardex-table">
            <thead>
              <tr>
                <th>Produto</th>
                <th className="txt-center">Estoque ERP</th>
                <th className="txt-center">Contagem Física</th>
                <th className="txt-center">Vendas Kardex (pós)</th>
                <th className="txt-center">Entradas Kardex (pós)</th>
                <th className="txt-center">Final Conciliado</th>
                <th className="txt-center">Divergência</th>
              </tr>
            </thead>
            <tbody>
              {adjustments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="txt-center padding-20">Nenhuma contagem realizada para comparar.</td>
                </tr>
              ) : (
                adjustments.map((a, i) => {
                  const isDivergent = a.divergence !== 0;
                  const divClass = a.divergence < 0 ? 'div-neg' : 'div-pos';
                  return (
                    <tr key={i}>
                      <td>
                        <strong>{a.description}</strong>
                        <div className="small-code">EAN: {a.barcode} • {a.brand} / {a.category}</div>
                      </td>
                      <td className="txt-center">{a.stock}</td>
                      <td className="txt-center highlight-cell">{a.counted}</td>
                      <td className="txt-center color-red">{a.sales > 0 ? `-${a.sales}` : '-'}</td>
                      <td className="txt-center color-green">{a.entries > 0 ? `+${a.entries}` : '-'}</td>
                      <td className="txt-center final-cell"><strong>{a.finalQty}</strong></td>
                      <td className={`txt-center ${isDivergent ? divClass : 'div-ok'}`}>
                        <strong>{isDivergent ? (a.divergence > 0 ? `+${a.divergence}` : a.divergence) : 'OK'}</strong>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Botões de Ação Final */}
        <div className="integration-actions-row">
          <button className="btn-action-kardex btn-primary" onClick={handleSyncBatchAPI} disabled={activeCounts.length === 0}>
            📤 Sincronizar Lote no ERP
          </button>
          <button className="btn-action-kardex btn-secondary" onClick={() => printPDFReport(inventory, activeCounts, catalog, adjustments)} disabled={activeCounts.length === 0}>
            🖨️ Imprimir PDF (Relatório)
          </button>
          <button className="btn-action-kardex btn-secondary" onClick={() => exportToTXT(activeCounts, `inventario_${inventory.id}_consolidado.txt`)} disabled={activeCounts.length === 0}>
            💾 Exportar TXT (ERP)
          </button>
          <button className="btn-action-kardex btn-secondary" onClick={() => exportToCSV(activeCounts, catalog, `inventario_${inventory.id}_tabela.csv`)} disabled={activeCounts.length === 0}>
            💾 Exportar Excel/CSV
          </button>
        </div>
      </div>

      {/* 3. SIMULADOR LOGS HTTP (API) */}
      <div className="card-custom glassmorphism animate-fade" style={{ marginTop: '20px' }}>
        <div className="card-header-custom">
          <h4>📜 Monitor de Comunicação API (Log do ERP)</h4>
          <p className="card-subtitle">Exibe o tráfego HTTP de requisições enviadas ao ERP do operador.</p>
        </div>

        <div className="api-log-viewer">
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
    </div>
  );
}
