import React, { useState, useEffect, useRef } from 'react';
import { 
  initStorage, 
  getOperator, 
  setOperator, 
  getStore, 
  setStore, 
  getSyncMode, 
  getInventories, 
  saveInventory, 
  getCounts, 
  addCount, 
  deleteCount, 
  updateCount, 
  getCatalog, 
  setCatalog, 
  findProductByBarcode,
  resetAllStorage 
} from './utils/storage';
import { playSuccessBeep, playErrorBuzzer } from './components/SoundFeedback';

import DeviceFrame from './components/DeviceFrame';
import Scanner from './components/Scanner';
import PalletModal from './components/PalletModal';
import FileMerger from './components/FileMerger';
import KardexDashboard from './components/KardexDashboard';

export default function App() {
  // Inicializa o banco de dados local
  useEffect(() => {
    initStorage();
  }, []);

  // CONFIGURAÇÃO DE TEMA
  const [theme, setTheme] = useState(localStorage.getItem('sc_theme') || 'dark');

  useEffect(() => {
    localStorage.setItem('sc_theme', theme);
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [theme]);

  // ESTADO DE AUTENTICAÇÃO E CONFIGURAÇÃO
  const [operator, setOperatorState] = useState(getOperator());
  const [store, setStoreState] = useState(getStore());
  const [isLoggedIn, setIsLoggedIn] = useState(!!getOperator() && !!getStore());

  // INVENTÁRIO SELECIONADO
  const [inventories, setInventories] = useState([]);
  const [currentInventory, setCurrentInventory] = useState(null);
  
  // NAVEGAÇÃO
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'collect', 'sectors', 'maint', 'kardex', 'settings'

  // DADOS GERAIS
  const [catalog, setCatalogState] = useState([]);
  const [counts, setCounts] = useState([]);
  const [mergedCounts, setMergedCounts] = useState(null);

  // TELA DE COLETA (CONTATOS)
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scannedProduct, setScannedProduct] = useState(null);
  const [scanQty, setScanQty] = useState(1);
  const [activeSector, setActiveSector] = useState('Setor 01');
  const [isRecountMode, setIsRecountMode] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [palletOpen, setPalletOpen] = useState(false);

  // PESQUISA E CONSULTA (MANUTENÇÃO)
  const [maintSearch, setMaintSearch] = useState('');
  const [maintSectorFilter, setMaintSectorFilter] = useState('');

  // CAMPOS DE CRIAÇÃO LOCAL
  const [newInvName, setNewInvName] = useState('');
  const [newInvCategory, setNewInvCategory] = useState('Alimentos');
  const [newInvBrand, setNewInvBrand] = useState('');

  // NOVO SETOR
  const [newSectorName, setNewSectorName] = useState('');
  const [sectors, setSectors] = useState(['Setor 01', 'Setor 02', 'Setor 03']);

  const barcodeInputRef = useRef(null);

  // Carrega dados iniciais do localStorage
  useEffect(() => {
    if (isLoggedIn) {
      setInventories(getInventories());
      setCatalogState(getCatalog());
      setCounts(getCounts());
    }
  }, [isLoggedIn]);

  // LOGIN FLOW
  const handleLogin = (e) => {
    e.preventDefault();
    if (!operator.trim() || !store) return;
    setOperator(operator.trim());
    setStore(store);
    setOperatorState(operator.trim());
    setStoreState(store);
    setIsLoggedIn(true);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setOperator('');
    setStore('');
    setOperatorState('');
    setStoreState('');
    setIsLoggedIn(false);
    setCurrentInventory(null);
  };

  // SELEÇÃO DE INVENTÁRIO
  const handleSelectInventory = (inv) => {
    const list = getInventories();
    const updated = list.map(i => {
      if (i.id === inv.id && !i.startedAt) {
        return { ...i, startedAt: new Date().toISOString() }; // Marca data/hora de início se for o primeiro acesso
      }
      return i;
    });
    localStorage.setItem('sc_inventories', JSON.stringify(updated));
    setInventories(updated);

    const activeInv = updated.find(i => i.id === inv.id);
    setCurrentInventory(activeInv);
    setActiveTab('collect');
    
    // Configura filtros
    if (activeInv.categoryFilter) {
      setMaintSectorFilter('');
    }
  };

  // CRIAR INVENTÁRIO LOCAL
  const handleCreateLocalInventory = (e) => {
    e.preventDefault();
    if (!newInvName.trim()) return;

    const newInv = {
      id: 'local-' + Date.now(),
      name: newInvName.trim(),
      store: store,
      brandFilter: newInvBrand.trim(),
      categoryFilter: newInvCategory,
      createdAt: new Date().toISOString(),
      startedAt: new Date().toISOString(), // Inicia imediatamente
      isERP: false,
      status: 'aberto'
    };

    saveInventory(newInv);
    setInventories(getInventories());
    setNewInvName('');
    setNewInvBrand('');
    setCurrentInventory(newInv);
    setActiveTab('collect');
    alert(`Inventário "${newInv.name}" criado localmente e iniciado!`);
  };

  // ENTRADA DE CÓDIGO DE BARRAS (SCANNER OU MANUAL)
  const processBarcode = (code) => {
    const cleanCode = code.trim();
    if (!cleanCode) return;

    const prod = findProductByBarcode(cleanCode);

    if (prod) {
      // Produto encontrado
      setScannedProduct(prod);
      playSuccessBeep();

      // Grava a contagem no banco de dados offline
      const countRecord = {
        idInventario: currentInventory.id,
        barcode: cleanCode,
        quantity: parseFloat(scanQty) || 1,
        sector: activeSector,
        operator: operator,
        mode: isRecountMode ? 'recontagem' : 'coleta'
      };

      // Simula Integração em Tempo Real via API se o modo for online
      const syncMode = getSyncMode();
      if (syncMode === 'online') {
        simulateRealTimeAPI(countRecord, prod.description);
      }

      addCount(countRecord);
      setCounts(getCounts());
      
      // Reseta inputs mas mantém a descrição visível temporariamente
      setBarcodeInput('');
      
      // Auto-foca o campo de código novamente
      setTimeout(() => {
        barcodeInputRef.current?.focus();
      }, 50);

    } else {
      // Produto não cadastrado
      playErrorBuzzer();
      
      // Abre prompt rápido ou permite registrar
      const desc = prompt("Produto não encontrado no catálogo! Digite uma descrição temporária se deseja coletar mesmo assim, ou cancele:");
      if (desc !== null) {
        const newTempProd = {
          barcode: cleanCode,
          description: desc || "Produto Avulso Não Cadastrado",
          brand: "Avulsa",
          category: "Geral",
          price: 0.0,
          stock: 0
        };
        // Adiciona temporário ao catálogo local
        const updatedCat = [newTempProd, ...catalog];
        setCatalog(updatedCat);
        setCatalogState(updatedCat);

        // Prossegue com o registro da contagem
        const countRecord = {
          idInventario: currentInventory.id,
          barcode: cleanCode,
          quantity: parseFloat(scanQty) || 1,
          sector: activeSector,
          operator: operator,
          mode: isRecountMode ? 'recontagem' : 'coleta'
        };

        addCount(countRecord);
        setCounts(getCounts());
        setBarcodeInput('');
        setScannedProduct(newTempProd);
        playSuccessBeep();
      }
    }
  };

  // SIMULADOR DE API HTTP EM TEMPO REAL
  const simulateRealTimeAPI = (countRecord, desc) => {
    const apiLogs = window.sc_api_logs || [];
    const timestamp = new Date().toLocaleTimeString();
    
    // Log do envio
    const requestLog = {
      timestamp,
      type: 'API POST',
      message: `Enviando leitura em tempo real ao ERP: ${desc} (${countRecord.barcode})`,
      payload: JSON.stringify(countRecord, null, 2)
    };
    
    window.sc_api_logs = [requestLog, ...apiLogs];

    // Simula resposta do ERP após 300ms
    setTimeout(() => {
      const responseLog = {
        timestamp: new Date().toLocaleTimeString(),
        type: 'API RESPONSE',
        message: `ERP retornou 201 Created. Registro gravado sob ID ERP_${Math.floor(Math.random() * 10000)}`,
        payload: JSON.stringify({ success: true, processedAt: new Date().toISOString() }, null, 2)
      };
      window.sc_api_logs = [responseLog, ...window.sc_api_logs];
    }, 300);
  };

  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    processBarcode(barcodeInput);
  };

  // CALCULO DE QUANTIDADE PELO PALLET MODAL
  const handlePalletConfirm = (qty) => {
    setScanQty(qty);
    setPalletOpen(false);
    
    // Se já houver um código preenchido, envia direto
    if (barcodeInput) {
      processBarcode(barcodeInput);
      setScanQty(1); // restaura
    } else {
      alert(`Quantidade calculada (${qty}) definida. Insira ou leia o código de barras para coletar.`);
      barcodeInputRef.current?.focus();
    }
  };

  // INCREMENTADORES RÁPIDOS
  const adjustQty = (amount) => {
    setScanQty(prev => Math.max(1, prev + amount));
  };

  // ADICIONAR NOVO SETOR
  const handleAddSector = (e) => {
    e.preventDefault();
    if (!newSectorName.trim()) return;
    if (sectors.includes(newSectorName.trim())) {
      alert('Este setor já existe!');
      return;
    }
    const updated = [...sectors, newSectorName.trim()];
    setSectors(updated);
    setActiveSector(newSectorName.trim());
    setNewSectorName('');
    alert(`Setor "${newSectorName.trim()}" criado e selecionado!`);
  };

  // EDICÃO NA MANUTENÇÃO
  const handleMaintQtyChange = (id, val) => {
    const qty = parseFloat(val);
    if (!isNaN(qty) && qty >= 0) {
      updateCount(id, qty);
      setCounts(getCounts());
    }
  };

  const handleMaintDelete = (id) => {
    if (confirm("Tem certeza que deseja excluir esta leitura?")) {
      deleteCount(id);
      setCounts(getCounts());
    }
  };

  // MESCLAR ARQUIVOS IMPORTADOS
  const handleMergeLoad = (data) => {
    setMergedCounts(data);
    setActiveTab('kardex');
  };

  // LIMPAR DADOS DO APP
  const handleResetApp = () => {
    if (confirm("ATENÇÃO: Isso irá apagar todas as contagens locais, inventários e redefinir o catálogo padrão. Continuar?")) {
      resetAllStorage();
      handleLogout();
      alert("Aplicativo redefinido com sucesso.");
    }
  };

  // CATÁLOGO DE IMPORTAÇÃO POR TXT/CSV
  const handleCatalogImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const lines = text.split(/\r?\n/);
      const newCatalog = [];

      lines.forEach((line) => {
        if (!line.trim()) return;
        const parts = line.split(';');
        if (parts.length >= 2) {
          const barcode = parts[0].trim();
          const description = parts[1].trim();
          const brand = parts[2] ? parts[2].trim() : 'Importado';
          const category = parts[3] ? parts[3].trim() : 'Geral';
          const price = parseFloat(parts[4]) || 0.0;
          const stock = parseInt(parts[5]) || 0;

          if (barcode.toLowerCase() !== 'codigo' && barcode.toLowerCase() !== 'código') {
            newCatalog.push({ barcode, description, brand, category, price, stock });
          }
        }
      });

      if (newCatalog.length > 0) {
        setCatalog(newCatalog);
        setCatalogState(newCatalog);
        alert(`Sucesso! Catálogo importado com ${newCatalog.length} produtos.`);
      } else {
        alert("Nenhum produto válido encontrado. Certifique-se de usar o padrão: codigo;descricao;marca;categoria;preco;estoque");
      }
    };
    reader.readAsText(file);
  };

  // AUXILIARES DE TOTALIZADORES
  const activeInventoryCounts = counts.filter(c => c.idInventario === (currentInventory?.id || ''));
  const totalItemsCounted = activeInventoryCounts.reduce((acc, c) => acc + (c.mode !== 'recontagem' ? c.quantity : 0), 0);
  const totalRecountsCounted = activeInventoryCounts.reduce((acc, c) => acc + (c.mode === 'recontagem' ? c.quantity : 0), 0);
  const totalSKUsCounted = new Set(activeInventoryCounts.map(c => c.barcode)).size;

  return (
    <DeviceFrame>
      {/* SE NÃO LOGADO: TELA DE LOGIN */}
      {!isLoggedIn ? (
        <div className="login-screen animate-fade">
          <div className="login-brand">
            <img src="/logo.ico" alt="Amura Logo" className="login-logo-img" />
            <h1>Amura Collector</h1>
            <p>Sistema de Inventário e Contagem de Estoque</p>
          </div>
          
          <form onSubmit={handleLogin} className="login-form glassmorphism card-custom">
            <div className="form-group">
              <label>Nome do Operador</label>
              <input
                type="text"
                placeholder="Ex: Fabricio"
                value={operator}
                onChange={(e) => setOperatorState(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Selecione a Loja</label>
              <select value={store} onChange={(e) => setStoreState(e.target.value)} required>
                <option value="">-- Escolha a Loja --</option>
                <option value="Loja Centro">Loja Centro</option>
                <option value="Loja Shopping">Loja Shopping</option>
                <option value="Loja Norte">Loja Norte</option>
                <option value="Depósito Geral">Depósito Geral</option>
              </select>
            </div>

            <div className="form-group" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
              <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Tema: {theme === 'light' ? '☀️ Claro' : '🌙 Escuro'}
              </label>
              <button 
                type="button" 
                className="btn-theme-toggle" 
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                style={{ width: '40px', height: '40px' }}
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
            </div>

            <button type="submit" className="btn-login">Acessar Sistema</button>
          </form>
        </div>
      ) : (
        /* SE LOGADO */
        <>
          {/* HEADER GERAL */}
          <div className="app-header-container">
            <div className="app-top-header">
              <div className="logo-header-area">
                <img src="/logo.ico" alt="Amura Logo" className="logo-header-img" />
                <span className="logo-header-title">Amura Collector</span>
              </div>
              <div className="header-actions">
                <button 
                  className="btn-theme-toggle" 
                  onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                  title="Alterar Tema"
                >
                  {theme === 'light' ? '🌙' : '☀️'}
                </button>
                {currentInventory && (
                  <button className="btn-logout" onClick={() => setCurrentInventory(null)}>
                    Sair
                  </button>
                )}
              </div>
            </div>
            <div className="collect-header-status" style={{ borderBottom: 'none' }}>
              <div className="status-left">
                <strong>{currentInventory ? currentInventory.name : 'Selecione um Inventário'}</strong>
                <small>Operador: {operator} • {store}</small>
              </div>
            </div>
          </div>

          {/* APP SCREENS */}
          <div className="device-app-content">
            
            {/* TELA 1: DASHBOARD (SELECIONAR INVENTARIO) */}
            {(!currentInventory || activeTab === 'dashboard') && (
              <div className="dashboard-screen animate-fade">
                <div className="card-custom glassmorphism">
                  <div className="card-header-custom">
                    <h4>📋 Inventários Disponíveis no ERP</h4>
                    <p className="card-subtitle">Sessões ativas criadas no ERP central.</p>
                  </div>
                  <div className="inventories-list" style={{ marginTop: '12px' }}>
                    {inventories.filter(i => i.isERP).map(inv => (
                      <div 
                        key={inv.id} 
                        className={`inv-card ${currentInventory?.id === inv.id ? 'active-card' : ''}`}
                        onClick={() => handleSelectInventory(inv)}
                      >
                        <div>
                          <div className="inv-name">{inv.name}</div>
                          <div className="inv-meta">Loja: {inv.store} • Filtro: {inv.categoryFilter}</div>
                        </div>
                        <span className="inv-tag erp">ERP</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card-custom glassmorphism">
                  <div className="card-header-custom">
                    <h4>🆕 Novo Inventário Local (Avulso)</h4>
                    <p className="card-subtitle">Crie uma contagem independente diretamente pelo celular.</p>
                  </div>
                  <form onSubmit={handleCreateLocalInventory} className="local-inv-creator">
                    <div className="form-group">
                      <label>Nome do Inventário</label>
                      <input
                        type="text"
                        placeholder="Ex: Inventário Rápido Frios"
                        value={newInvName}
                        onChange={(e) => setNewInvName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Categoria Filtrada</label>
                      <select value={newInvCategory} onChange={(e) => setNewInvCategory(e.target.value)}>
                        <option value="">Todas</option>
                        <option value="Alimentos">Alimentos</option>
                        <option value="Bebidas">Bebidas</option>
                        <option value="Higiene">Higiene</option>
                        <option value="Limpeza">Limpeza</option>
                        <option value="Eletrônicos">Eletrônicos</option>
                        <option value="Vestuário">Vestuário</option>
                      </select>
                    </div>
                    <button type="submit" className="btn-create-local">Criar e Iniciar Contagem</button>
                  </form>
                </div>

                {/* HISTÓRICO DE SESSÕES LOCAIS */}
                {inventories.filter(i => !i.isERP).length > 0 && (
                  <div className="card-custom glassmorphism">
                    <div className="card-header-custom">
                      <h4>📂 Inventários Locais Anteriores</h4>
                    </div>
                    <div className="inventories-list" style={{ marginTop: '8px' }}>
                      {inventories.filter(i => !i.isERP).map(inv => (
                        <div 
                          key={inv.id} 
                          className={`inv-card ${currentInventory?.id === inv.id ? 'active-card' : ''}`}
                          onClick={() => handleSelectInventory(inv)}
                        >
                          <div>
                            <div className="inv-name">{inv.name}</div>
                            <div className="inv-meta">Loja: {inv.store} • Criado em: {new Date(inv.createdAt).toLocaleDateString()}</div>
                          </div>
                          <span className="inv-tag">Local</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TELA 2: COLETAR (SCANNER & INPUT) */}
            {currentInventory && activeTab === 'collect' && (
              <div className="animate-fade">
                
                {/* BARRA DE STATUS DA CONTAGEM */}
                <div className="collect-header-status" style={{ background: '#0e1524' }}>
                  <div className="status-left">
                    <span>Setor: <strong>{activeSector}</strong></span>
                  </div>
                  <div className="status-right">
                    <span className={`mode-indicator ${isRecountMode ? 'recount' : 'normal'}`}>
                      {isRecountMode ? 'CONFERÊNCIA (NÃO AGREGA)' : 'CONTAGEM ATIVA'}
                    </span>
                  </div>
                </div>

                {/* LEITOR DE CÂMERA ACIONADO */}
                {cameraOpen && (
                  <Scanner 
                    onScan={(code) => {
                      processBarcode(code);
                      setCameraOpen(false);
                    }}
                    onClose={() => setCameraOpen(false)}
                  />
                )}

                {/* ENTRADAS E BOTÕES */}
                <div className="collect-inputs-area">
                  <div className="scan-buttons-row">
                    <button className="btn-scan-trigger" onClick={() => setCameraOpen(true)}>
                      📷 Usar Câmera do Celular
                    </button>
                    <button className="btn-pallet-trigger" title="Contagem de Pallets" onClick={() => setPalletOpen(true)}>
                      📦
                    </button>
                  </div>

                  {/* DIGITAÇÃO MANUAL OU SCANNER FIO/BLUETOOTH */}
                  <form onSubmit={handleBarcodeSubmit} className="manual-barcode-row">
                    <input
                      type="text"
                      ref={barcodeInputRef}
                      placeholder="Código de Barras ou EAN"
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      className="input-barcode"
                      autoFocus
                    />
                    <button type="submit" className="btn-enter-barcode">OK</button>
                  </form>

                  {/* PRODUTO SELECIONADO / MOSTRAR DETALHES */}
                  {scannedProduct && (
                    <div className="scanned-product-details animate-slide">
                      <div className="prod-details-main">
                        <h4>{scannedProduct.description}</h4>
                        <div className="prod-details-meta">
                          EAN: {scannedProduct.barcode} • Marca: {scannedProduct.brand} • Cat: {scannedProduct.category}
                        </div>
                      </div>

                      {/* EDITAR QUANTIDADE E MULTIPLICADORES RÁPIDOS */}
                      <div className="qty-adjuster-row">
                        <div className="qty-input-box">
                          <button type="button" className="btn-qty-adj" onClick={() => adjustQty(-1)}>-</button>
                          <input
                            type="number"
                            min="1"
                            value={scanQty}
                            onChange={(e) => setScanQty(Math.max(1, parseFloat(e.target.value) || 1))}
                            className="input-qty"
                          />
                          <button type="button" className="btn-qty-adj" onClick={() => adjustQty(1)}>+</button>
                        </div>

                        <div className="multipliers-grid">
                          <button type="button" className="btn-mult" onClick={() => setScanQty(5)}>+5</button>
                          <button type="button" className="btn-mult" onClick={() => setScanQty(10)}>+10</button>
                          <button type="button" className="btn-mult" onClick={() => setScanQty(50)}>+50</button>
                          <button type="button" className="btn-mult" onClick={() => setScanQty(100)}>+100</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* TOTALIZADOR */}
                <div className="counting-stats-bar">
                  <div className="stat-box">
                    <small>Físico Contado</small>
                    <span>{totalItemsCounted} un</span>
                  </div>
                  <div className="stat-box">
                    <small>SKUs Únicos</small>
                    <span>{totalSKUsCounted} itens</span>
                  </div>
                  {totalRecountsCounted > 0 && (
                    <div className="stat-box" style={{ color: '#c084fc' }}>
                      <small>Recontagem (Conf.)</small>
                      <span>{totalRecountsCounted} un</span>
                    </div>
                  )}
                </div>

                {/* HISTÓRICO DAS ÚLTIMAS 5 LEITURAS */}
                <div className="recent-scans-list">
                  <div className="recent-title">Últimas Coletas Coletadas</div>
                  {activeInventoryCounts.slice(0, 5).map((item) => {
                    const prod = catalog.find(p => p.barcode === item.barcode);
                    return (
                      <div key={item.id} className={`recent-item ${item.mode === 'recontagem' ? 'recount-item' : ''} animate-slide`}>
                        <div className="recent-item-left">
                          <span className="recent-item-name">{prod ? prod.description : 'Produto Avulso'}</span>
                          <span className="recent-item-code">EAN: {item.barcode} • Setor: {item.sector}</span>
                        </div>
                        <span className="recent-item-qty">
                          {item.quantity} un
                        </span>
                      </div>
                    );
                  })}
                  {activeInventoryCounts.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#475569', fontSize: '12px', marginTop: '20px' }}>
                      Nenhum código coletado ainda neste inventário.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TELA 3: SETORIZAÇÃO */}
            {currentInventory && activeTab === 'sectors' && (
              <div className="sector-screen-wrapper animate-fade">
                <div className="card-custom glassmorphism">
                  <div className="card-header-custom">
                    <h4>📍 Setorização da Contagem</h4>
                    <p className="card-subtitle">Organize sua contagem por setores físicos (gôndola, corredor, prateleira) para facilitar a recontagem e localizar divergências.</p>
                  </div>

                  <form onSubmit={handleAddSector} className="sector-selector-box" style={{ marginTop: '12px' }}>
                    <div className="form-group">
                      <label>Cadastrar Novo Setor</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          placeholder="Ex: Corredor A, Prateleira 3"
                          value={newSectorName}
                          onChange={(e) => setNewSectorName(e.target.value)}
                          style={{ flex: 1 }}
                        />
                        <button type="submit" className="btn-add-sector" style={{ padding: '0 16px' }}>Adicionar</button>
                      </div>
                    </div>
                  </form>

                  <div className="sectors-list-container" style={{ marginTop: '16px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Selecione o setor ativo para coleta:</label>
                    {sectors.map((sec, i) => {
                      const secCounts = activeInventoryCounts.filter(c => c.sector === sec);
                      const secTotal = secCounts.reduce((acc, c) => acc + c.quantity, 0);
                      return (
                        <div
                          key={i}
                          className={`sector-item ${activeSector === sec ? 'selected' : ''}`}
                          onClick={() => {
                            setActiveSector(sec);
                            alert(`Setor ativo alterado para: ${sec}`);
                          }}
                        >
                          <div className="sector-details">
                            <span className="sector-name">{sec}</span>
                            <span className="sector-meta">{secCounts.length} leituras</span>
                          </div>
                          <strong style={{ color: activeSector === sec ? 'var(--color-primary)' : 'white' }}>
                            {secTotal} un
                          </strong>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* CONTROLE DE RECONTAGEM */}
                <div className="card-custom glassmorphism recount-toggle-card">
                  <div className="card-header-custom">
                    <h4>🔄 Modo Recontagem (Conferência)</h4>
                    <p className="card-subtitle">
                      Ative para realizar a recontagem de auditoria do setor. 
                      <strong> As quantidades coletadas neste modo NÃO se somarão à contagem principal do inventário.</strong>
                    </p>
                  </div>
                  <div className="toggle-switch-wrapper" style={{ marginTop: '10px' }}>
                    <input
                      type="checkbox"
                      checked={isRecountMode}
                      onChange={(e) => setIsRecountMode(e.target.checked)}
                      id="recount-toggle"
                    />
                    <label htmlFor="recount-toggle" style={{ fontWeight: 'bold', color: isRecountMode ? '#f87171' : 'white', cursor: 'pointer' }}>
                      {isRecountMode ? '🔴 Conferência / Recontagem Ativa' : '⚪ Contagem Normal Ativa'}
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* TELA 4: MANUTENÇÃO (CONSULTAR E REMOVER) */}
            {currentInventory && activeTab === 'maint' && (
              <div className="maintenance-screen animate-fade">
                <div className="card-custom glassmorphism" style={{ marginBottom: '8px' }}>
                  <div className="card-header-custom">
                    <h4>🛠️ Manutenção de Contagem</h4>
                    <p className="card-subtitle">Consulte o histórico completo, filtre e remova coletas erradas de setores.</p>
                  </div>
                </div>

                <div className="search-box-row">
                  <input
                    type="text"
                    placeholder="Buscar por Código ou Descrição..."
                    value={maintSearch}
                    onChange={(e) => setMaintSearch(e.target.value)}
                    className="input-search"
                  />
                  <select value={maintSectorFilter} onChange={(e) => setMaintSectorFilter(e.target.value)}>
                    <option value="">Todos os Setores</option>
                    {sectors.map((sec, i) => (
                      <option key={i} value={sec}>{sec}</option>
                    ))}
                  </select>
                </div>

                <div className="counts-maintenance-list">
                  {activeInventoryCounts
                    .filter(c => {
                      const prod = catalog.find(p => p.barcode === c.barcode);
                      const matchesText = c.barcode.includes(maintSearch) || 
                                          (prod && prod.description.toLowerCase().includes(maintSearch.toLowerCase()));
                      const matchesSector = !maintSectorFilter || c.sector === maintSectorFilter;
                      return matchesText && matchesSector;
                    })
                    .map((item) => {
                      const prod = catalog.find(p => p.barcode === item.barcode);
                      return (
                        <div key={item.id} className="maint-card animate-slide">
                          <div className="maint-left">
                            <span className="maint-title">{prod ? prod.description : 'Produto Avulso'}</span>
                            <span className="maint-meta">
                              EAN: {item.barcode} • Setor: {item.sector} <br/>
                              Modo: {item.mode === 'recontagem' ? 'Conferência' : 'Normal'} • {new Date(item.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="maint-right">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleMaintQtyChange(item.id, e.target.value)}
                              className="maint-qty-editor"
                            />
                            <button className="btn-maint-del" onClick={() => handleMaintDelete(item.id)}>
                              &times;
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  
                  {activeInventoryCounts.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#475569', padding: '30px' }}>
                      Nenhuma leitura encontrada.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TELA 5: KARDEX & SINCRONIZAÇÃO (INTEGRAÇÃO COMPLETA) */}
            {currentInventory && activeTab === 'kardex' && (
              <KardexDashboard 
                inventory={currentInventory}
                counts={counts}
                catalog={catalog}
                mergedCounts={mergedCounts}
                onClearLocalCounts={() => {
                  if (confirm("Deseja mesmo limpar as contagens locais desse inventário?")) {
                    setCounts(counts.filter(c => c.idInventario !== currentInventory.id));
                  }
                }}
              />
            )}

            {/* TELA 6: CONFIGURAÇÕES */}
            {currentInventory && activeTab === 'settings' && (
              <div className="settings-screen animate-fade">
                
                {/* IMPORTAR NOVO CATÁLOGO DE PRODUTOS */}
                <div className="card-custom glassmorphism">
                  <div className="card-header-custom">
                    <h4>📥 Importar Catálogo de Produtos (ERP)</h4>
                    <p className="card-subtitle">Carregue a planilha de produtos do seu ERP. Formato aceito: CSV/TXT (codigo;descricao;marca;categoria;preco;estoque).</p>
                  </div>
                  <div style={{ marginTop: '12px' }}>
                    <input
                      type="file"
                      accept=".txt,.csv"
                      onChange={handleCatalogImport}
                      id="catalog-upload-input"
                      style={{ display: 'none' }}
                    />
                    <button className="btn-add-sector" style={{ width: '100%' }} onClick={() => document.getElementById('catalog-upload-input').click()}>
                      📁 Selecionar Arquivo de Catálogo
                    </button>
                  </div>
                </div>

                {/* MESCLAR ARQUIVOS DE OUTROS DISPOSITIVOS */}
                <FileMerger onMergeLoad={handleMergeLoad} catalog={catalog} />

                {/* SIMULADOR DE SCANNER BLUETOOTH */}
                <div className="card-custom glassmorphism bluetooth-scanner-test-box">
                  <div className="card-header-custom">
                    <h4>🔌 Teste de Leitor Sem Fio (Bluetooth/USB)</h4>
                    <p className="card-subtitle">Leitores operam simulando um teclado físico. Selecione o campo abaixo e bip no leitor para testar o envio no app.</p>
                  </div>
                  <input
                    type="text"
                    placeholder="Bipe seu leitor bluetooth aqui..."
                    className="bluetooth-input-sim"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        processBarcode(e.target.value);
                        e.target.value = '';
                        alert("Leitura do leitor sem fio capturada!");
                      }
                    }}
                  />
                  <div className="bluetooth-test-hint">
                    Dica: O leitor deve estar configurado com sufixo "Enter" (Carriage Return) para enviar a leitura automaticamente.
                  </div>
                </div>

                {/* LIMPEZA E ZERAR BANCO */}
                <div className="card-custom glassmorphism">
                  <div className="card-header-custom">
                    <h4>⚠️ Manutenção do Sistema</h4>
                    <p className="card-subtitle">Use essas opções com cuidado.</p>
                  </div>
                  <div className="config-btn-row" style={{ marginTop: '12px' }}>
                    <button className="btn-config-action danger" onClick={handleResetApp}>
                      💥 Resetar Todo App
                    </button>
                    <button className="btn-config-action" onClick={handleLogout}>
                      🔓 Sair da Loja
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* APP NAVIGATION BOTTOM BAR */}
          <div className="app-navigation-bar">
            <button 
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => { setActiveTab('dashboard'); setMergedCounts(null); }}
            >
              <span className="nav-icon">📊</span>
              <span>Dashboard</span>
            </button>

            <button 
              className={`nav-item ${activeTab === 'collect' ? 'active' : ''}`}
              onClick={() => { setActiveTab('collect'); setMergedCounts(null); }}
            >
              <span className="nav-icon">🎯</span>
              <span>Coletar</span>
            </button>

            <button 
              className={`nav-item ${activeTab === 'sectors' ? 'active' : ''}`}
              onClick={() => { setActiveTab('sectors'); setMergedCounts(null); }}
            >
              <span className="nav-icon">📍</span>
              <span>Setores</span>
            </button>

            <button 
              className={`nav-item ${activeTab === 'maint' ? 'active' : ''}`}
              onClick={() => { setActiveTab('maint'); setMergedCounts(null); }}
            >
              <span className="nav-icon">🛠️</span>
              <span>Manutenção</span>
            </button>

            <button 
              className={`nav-item ${activeTab === 'kardex' ? 'active' : ''}`}
              onClick={() => setActiveTab('kardex')}
            >
              <span className="nav-icon">🔌</span>
              <span>Sinc & ERP</span>
            </button>

            <button 
              className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => { setActiveTab('settings'); setMergedCounts(null); }}
            >
              <span className="nav-icon">⚙️</span>
              <span>Ajustes</span>
            </button>
          </div>

          {/* PALLET CALCULATOR MODAL */}
          {palletOpen && (
            <PalletModal 
              product={scannedProduct}
              onConfirm={handlePalletConfirm}
              onClose={() => setPalletOpen(false)}
            />
          )}
        </>
      )}
    </DeviceFrame>
  );
}
