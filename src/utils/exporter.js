// exporter.js - Utilitários de exportação de contagem (TXT, CSV e Relatório de Impressão)

// Download genérico de arquivos no navegador
const downloadFile = (content, filename, contentType) => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// 1. Exportar em TXT Consolidador (Layout do ERP: codigo;quantidade)
export const exportToTXT = (counts, filename = 'contagem_consolidada.txt') => {
  // Consolidar
  const consolidated = {};
  counts.forEach(c => {
    // Apenas agrega se não for recontagem (recontagem é conferência e não agrega no inventário principal)
    if (c.mode !== 'recontagem') {
      consolidated[c.barcode] = (consolidated[c.barcode] || 0) + c.quantity;
    }
  });

  let content = '';
  Object.keys(consolidated).forEach(code => {
    content += `${code};${consolidated[code]}\r\n`;
  });

  downloadFile(content, filename, 'text/plain;charset=utf-8');
};

// 2. Exportar em CSV/Excel (Totalizado por código de barras)
export const exportToCSV = (counts, catalog, filename = 'contagem_inventario.csv') => {
  const consolidated = {};
  counts.forEach(c => {
    if (c.mode !== 'recontagem') {
      consolidated[c.barcode] = (consolidated[c.barcode] || 0) + c.quantity;
    }
  });

  // Cabeçalho CSV
  let content = '\ufeff'; // BOM para Excel abrir acentuação corretamente em PT-BR
  content += 'Código de Barras;Descrição;Marca;Categoria;Quantidade Coletada\n';

  Object.keys(consolidated).forEach(code => {
    const prod = catalog.find(p => p.barcode === code);
    const desc = prod ? prod.description : `Produto Avulso (EAN: ${code})`;
    const brand = prod ? prod.brand : 'Avulsa';
    const cat = prod ? prod.category : 'Geral';
    content += `${code};${desc};${brand};${cat};${consolidated[code]}\n`;
  });

  downloadFile(content, filename, 'text/csv;charset=utf-8');
};

// 3. Exportar PDF (Gera uma visualização de impressão rica em outra janela)
export const printPDFReport = (inventory, counts, catalog) => {
  const printWindow = window.open('', '_blank');
  
  // Consolidar contagens normais
  const consolidatedCounts = {};
  counts.filter(c => c.mode !== 'recontagem').forEach(c => {
    consolidatedCounts[c.barcode] = (consolidatedCounts[c.barcode] || 0) + c.quantity;
  });

  // Consolidar recontagens (conferências)
  const recountCounts = {};
  counts.filter(c => c.mode === 'recontagem').forEach(c => {
    recountCounts[c.barcode] = (recountCounts[c.barcode] || 0) + c.quantity;
  });

  // Mapeia setores
  const sectorSummary = {};
  counts.forEach(c => {
    const sec = c.sector || 'Sem Setor';
    if (!sectorSummary[sec]) {
      sectorSummary[sec] = { totalItems: 0, distinctItems: new Set() };
    }
    sectorSummary[sec].totalItems += c.quantity;
    sectorSummary[sec].distinctItems.add(c.barcode);
  });

  let totalFisico = 0;
  const itemsRows = catalog.map(p => {
    const qtyColetada = consolidatedCounts[p.barcode] || 0;
    const qtyRecount = recountCounts[p.barcode] || 0;

    if (qtyColetada > 0) totalFisico += qtyColetada;

    return {
      ...p,
      qtyColetada,
      qtyRecount
    };
  }).filter(row => row.qtyColetada > 0 || row.qtyRecount > 0);

  const startFormatted = inventory.startedAt ? new Date(inventory.startedAt).toLocaleString('pt-BR') : 'Não Iniciado';
  const createdFormatted = new Date(inventory.createdAt).toLocaleString('pt-BR');

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Relatório de Contagem - ${inventory.name}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #333;
          margin: 30px;
          font-size: 13px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          border-bottom: 2px solid #f26522;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        .header h1 {
          margin: 0;
          color: #f26522;
          font-size: 24px;
        }
        .meta-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin-bottom: 20px;
          background-color: #f8f9fa;
          padding: 15px;
          border-radius: 6px;
          border: 1px solid #dee2e6;
        }
        .meta-item strong {
          color: #495057;
        }
        .summary-cards {
          display: flex;
          gap: 15px;
          margin-bottom: 25px;
        }
        .card {
          flex: 1;
          padding: 15px;
          background: #eef2f7;
          border-left: 5px solid #f26522;
          border-radius: 4px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .card.setores {
          border-left-color: #7a0c7b;
          background: #f9f5fa;
        }
        .card-val {
          font-size: 20px;
          font-weight: bold;
          color: #1a1a1a;
          margin-top: 5px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        th, td {
          border: 1px solid #dee2e6;
          padding: 8px 10px;
          text-align: left;
        }
        th {
          background-color: #7a0c7b;
          color: white;
          font-weight: 600;
        }
        tr:nth-child(even) {
          background-color: #f8f9fa;
        }
        .txt-right {
          text-align: right;
        }
        .badge {
          display: inline-block;
          padding: 3px 6px;
          font-size: 11px;
          font-weight: bold;
          border-radius: 3px;
        }
        .badge-success { background: #198754; color: white; }
        .badge-warning { background: #ffc107; color: #333; }
        
        .footer {
          margin-top: 50px;
          font-size: 11px;
          color: #6c757d;
          text-align: center;
          border-top: 1px solid #dee2e6;
          padding-top: 10px;
        }
        @media print {
          body { margin: 15px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 20px; text-align: right;">
        <button onclick="window.print()" style="padding: 10px 20px; font-weight: bold; background: #f26522; color: white; border: none; border-radius: 4px; cursor: pointer;">Imprimir Relatório (Salvar PDF)</button>
      </div>

      <div class="header">
        <div>
          <h1>Amura Collector</h1>
          <p style="margin: 3px 0 0 0; color: #6c757d;">Relatório Executivo de Contagem de Estoque</p>
        </div>
        <div style="text-align: right;">
          <strong>Data de Emissão:</strong> ${new Date().toLocaleDateString('pt-BR')}<br>
          <strong>Hora:</strong> ${new Date().toLocaleTimeString('pt-BR')}
        </div>
      </div>

      <div class="meta-grid">
        <div class="meta-item"><strong>Inventário:</strong> ${inventory.name}</div>
        <div class="meta-item"><strong>Loja:</strong> ${inventory.store}</div>
        <div class="meta-item"><strong>Status:</strong> <span class="badge ${inventory.status === 'aberto' ? 'badge-warning' : 'badge-success'}">${inventory.status.toUpperCase()}</span></div>
        <div class="meta-item"><strong>Criado em:</strong> ${createdFormatted}</div>
        <div class="meta-item"><strong>Horário de Início:</strong> ${startFormatted}</div>
        <div class="meta-item"><strong>Filtros:</strong> Categoria: ${inventory.categoryFilter || 'Todas'}, Marca: ${inventory.brandFilter || 'Todas'}</div>
      </div>

      <div class="summary-cards">
        <div class="card">
          <div>Total de Peças Contadas</div>
          <div class="card-val">${totalFisico} un</div>
        </div>
        <div class="card setores">
          <div>Setores Auditados</div>
          <div class="card-val">${Object.keys(sectorSummary).length} setores</div>
        </div>
      </div>

      <h2>Resumo de Contagem por Setor</h2>
      <table>
        <thead>
          <tr>
            <th>Setor</th>
            <th class="txt-right">Variedade de Itens (SKUs)</th>
            <th class="txt-right">Total de Peças Coletadas</th>
          </tr>
        </thead>
        <tbody>
          ${Object.keys(sectorSummary).map(sec => `
            <tr>
              <td><strong>${sec}</strong></td>
              <td class="txt-right">${sectorSummary[sec].distinctItems.size}</td>
              <td class="txt-right">${sectorSummary[sec].totalItems}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <h2>Detalhamento do Inventário</h2>
      <table>
        <thead>
          <tr>
            <th>Código de Barras</th>
            <th>Descrição</th>
            <th>Marca / Categoria</th>
            <th class="txt-right">Contagem Física</th>
            <th class="txt-right">Recontagem (Conf.)</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows.map(row => `
            <tr>
              <td><code>${row.barcode}</code></td>
              <td>${row.description}</td>
              <td><small>${row.brand} / ${row.category}</small></td>
              <td class="txt-right"><strong>${row.qtyColetada}</strong></td>
              <td class="txt-right" style="color: #6c757d;">${row.qtyRecount || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="footer">
        <p>Amura Collector - Sistema Profissional de Coleta de Dados Offline e Online para Inventários.</p>
        <p>&copy; 2026 - Auditoria de Estoques.</p>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
