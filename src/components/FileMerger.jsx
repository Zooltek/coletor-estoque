import React, { useState } from 'react';
import { exportToTXT, exportToCSV } from '../utils/exporter';

export default function FileMerger({ onMergeLoad, catalog }) {
  const [mergedFiles, setMergedFiles] = useState([]);
  const [mergedData, setMergedData] = useState([]);
  const [summary, setSummary] = useState(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const loadedFiles = [];
    const allCounts = [];
    let processedCount = 0;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        const lines = text.split(/\r?\n/);
        
        lines.forEach((line, index) => {
          if (!line.trim()) return;
          const parts = line.split(';');
          if (parts.length >= 2) {
            const barcode = parts[0].trim();
            const quantity = parseFloat(parts[1].trim()) || 0;
            const sector = parts[2] ? parts[2].trim() : 'Centralizado';
            const operator = parts[3] ? parts[3].trim() : file.name.replace('.txt', '').replace('.csv', '');
            const timestamp = parts[4] ? parts[4].trim() : new Date().toISOString();
            
            // Ignora cabeçalhos se existirem
            if (barcode.toLowerCase() === 'código de barras' || barcode.toLowerCase() === 'codigo') return;

            allCounts.push({
              barcode,
              quantity,
              sector,
              operator,
              timestamp
            });
          }
        });

        processedCount++;
        loadedFiles.push({ name: file.name, size: file.size, lines: lines.length });

        // Quando carregar todos os arquivos
        if (processedCount === files.length) {
          processMergedData(allCounts, loadedFiles);
        }
      };
      reader.readAsText(file);
    });
  };

  const processMergedData = (allCounts, filesList) => {
    // Agrupa por código de barras para o resumo geral
    const consolidated = {};
    const operators = new Set();
    const sectors = new Set();
    let totalItems = 0;

    allCounts.forEach(c => {
      consolidated[c.barcode] = (consolidated[c.barcode] || 0) + c.quantity;
      operators.add(c.operator);
      sectors.add(c.sector);
      totalItems += c.quantity;
    });

    setMergedFiles(filesList);
    setMergedData(allCounts);
    setSummary({
      totalFiles: filesList.length,
      totalRecords: allCounts.length,
      totalQty: totalItems,
      uniqueSKUs: Object.keys(consolidated).length,
      operators: Array.from(operators),
      sectors: Array.from(sectors)
    });
  };

  const handleApplyToApp = () => {
    if (mergedData.length > 0 && onMergeLoad) {
      onMergeLoad(mergedData);
      alert('Dados mesclados carregados com sucesso no painel de integração! Vá até a seção Kardex para conciliar.');
    }
  };

  const handleExportTXT = () => {
    if (mergedData.length > 0) {
      exportToTXT(mergedData, `contagem_mesclada_${Date.now()}.txt`);
    }
  };

  const handleExportCSV = () => {
    if (mergedData.length > 0) {
      exportToCSV(mergedData, catalog, `contagem_mesclada_${Date.now()}.csv`);
    }
  };

  return (
    <div className="card-custom glassmorphism animate-fade">
      <div className="card-header-custom">
        <h4>📂 Mesclador de Arquivos Multi-Dispositivo</h4>
        <p className="card-subtitle">Importe arquivos TXT/CSV coletados de outros celulares para consolidar em um único lote.</p>
      </div>

      <div className="file-input-wrapper">
        <label className="file-upload-btn">
          <span>📁 Selecionar Arquivos para Mesclar</span>
          <input
            type="file"
            multiple
            accept=".txt,.csv"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </label>
        <span className="file-hint">Segure Ctrl para selecionar múltiplos arquivos</span>
      </div>

      {mergedFiles.length > 0 && (
        <div className="merged-files-list">
          <h5>Arquivos Carregados:</h5>
          <ul>
            {mergedFiles.map((f, i) => (
              <li key={i}>
                📄 <strong>{f.name}</strong> <small>({(f.size / 1024).toFixed(1)} KB, {f.lines} linhas)</small>
              </li>
            ))}
          </ul>
        </div>
      )}

      {summary && (
        <div className="merger-summary-box animate-slide">
          <h5>📊 Resumo da Mesclagem</h5>
          <div className="summary-grid-merger">
            <div className="sum-item">
              <span className="sum-lbl">Dispositivos</span>
              <span className="sum-val">{summary.totalFiles}</span>
            </div>
            <div className="sum-item">
              <span className="sum-lbl">Total Peças</span>
              <span className="sum-val">{summary.totalQty}</span>
            </div>
            <div className="sum-item">
              <span className="sum-lbl">Produtos Únicos (SKUs)</span>
              <span className="sum-val">{summary.uniqueSKUs}</span>
            </div>
            <div className="sum-item">
              <span className="sum-lbl">Operadores</span>
              <span className="sum-val">{summary.operators.length}</span>
            </div>
          </div>

          <div className="operator-tags">
            <strong>Operadores detectados:</strong>
            <div className="tags-container">
              {summary.operators.map((op, i) => (
                <span key={i} className="tag-operator">{op}</span>
              ))}
            </div>
          </div>

          <div className="operator-tags">
            <strong>Setores detectados:</strong>
            <div className="tags-container">
              {summary.sectors.map((sec, i) => (
                <span key={i} className="tag-sector">{sec}</span>
              ))}
            </div>
          </div>

          <div className="merger-actions">
            <button className="btn-merger-action btn-apply" onClick={handleApplyToApp}>
              🚀 Carregar no Painel de Integração
            </button>
            <button className="btn-merger-action btn-sec" onClick={handleExportTXT}>
              ⬇️ Exportar TXT Consolidado
            </button>
            <button className="btn-merger-action btn-sec" onClick={handleExportCSV}>
              ⬇️ Exportar CSV/Excel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
