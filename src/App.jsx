import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  initStorage, 
  getOperator, 
  setOperator, 
  getStore, 
  setStore, 
  getStores,
  saveCounts,
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
    setStoresList(getStores());
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
  const [stores, setStoresList] = useState([]);
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
  
  // Modos de contagem e estados adicionais do leitor
  const [countMethod, setCountMethod] = useState(localStorage.getItem('sc_count_method') || 'scan'); // 'scan' | 'type'
  const [isBipagemMode, setIsBipagemMode] = useState(localStorage.getItem('sc_bipagem_mode') !== 'false'); // default true
  const [isPaused, setIsPaused] = useState(false);
  const [soundMuted, setSoundMuted] = useState(localStorage.getItem('sc_sound_muted') === 'true');
  const [isBlindCount, setIsBlindCount] = useState(localStorage.getItem('sc_blind_count') === 'true');

  useEffect(() => {
    localStorage.setItem('sc_blind_count', isBlindCount);
  }, [isBlindCount]);

  useEffect(() => {
    localStorage.setItem('sc_count_method', countMethod);
  }, [countMethod]);

  useEffect(() => {
    localStorage.setItem('sc_bipagem_mode', isBipagemMode);
  }, [isBipagemMode]);

  useEffect(() => {
    localStorage.setItem('sc_sound_muted', soundMuted);
  }, [soundMuted]);

  const [cameraOpen, setCameraOpen] = useState(localStorage.getItem('sc_count_method') !== 'type');
  const [palletOpen, setPalletOpen] = useState(false);

  // PESQUISA E CONSULTA (MANUTENÇÃO)
  const [maintSearch, setMaintSearch] = useState('');
  const [maintSectorFilter, setMaintSectorFilter] = useState('');

  // CAMPOS DE CRIAÇÃO LOCAL
  const [newInvName, setNewInvName] = useState('');
  const [newInvCategory, setNewInvCategory] = useState('');
  const [newInvBrand, setNewInvBrand] = useState('');

  // Extrai categorias do catálogo de forma dinâmica
  const categoriesList = useMemo(() => {
    const unique = Array.from(new Set(catalog.map(p => p.category))).filter(Boolean);
    if (!unique.includes('Geral')) {
      unique.push('Geral');
    }
    return unique.sort();
  }, [catalog]);

  // NOVO SETOR (Inicia vazio por padrão)
  const [newSectorName, setNewSectorName] = useState('');
  const [sectors, setSectors] = useState([]);

  // RELATÓRIO EM MODAL INTERNO
  const [reportModalOpen, setReportModalOpen] = useState(false);

  // Consolidar contagens do inventário atual para o relatório
  const reportCounts = useMemo(() => {
    if (!currentInventory) return [];
    return counts.filter(c => c.idInventario === currentInventory.id);
  }, [counts, currentInventory]);

  // Consolidar contagens por código de barras (desconsidera recontagem/conferência)
  const consolidatedCountsForReport = useMemo(() => {
    const consolidated = {};
    reportCounts.filter(c => c.mode !== 'recontagem').forEach(c => {
      consolidated[c.barcode] = (consolidated[c.barcode] || 0) + c.quantity;
    });
    return consolidated;
  }, [reportCounts]);

  // Consolidar recontagens (conferências)
  const recountCountsForReport = useMemo(() => {
    const recounts = {};
    reportCounts.filter(c => c.mode === 'recontagem').forEach(c => {
      recounts[c.barcode] = (recounts[c.barcode] || 0) + c.quantity;
    });
    return recounts;
  }, [reportCounts]);

  // Mapeia setores para o resumo por setor do relatório
  const reportSectorSummary = useMemo(() => {
    const summary = {};
    reportCounts.forEach(c => {
      const sec = c.sector || 'Sem Setor (Geral)';
      if (!summary[sec]) {
        summary[sec] = { totalItems: 0, distinctItems: new Set() };
      }
      summary[sec].totalItems += c.quantity;
      summary[sec].distinctItems.add(c.barcode);
    });
    return summary;
  }, [reportCounts]);

  // Itens para o detalhamento da tabela
  const reportItemsRows = useMemo(() => {
    return catalog.map(p => {
      const qtyColetada = consolidatedCountsForReport[p.barcode] || 0;
      const qtyRecount = recountCountsForReport[p.barcode] || 0;
      return {
        ...p,
        qtyColetada,
        qtyRecount
      };
    }).filter(row => row.qtyColetada > 0 || row.qtyRecount > 0);
  }, [catalog, consolidatedCountsForReport, recountCountsForReport]);

  const reportTotalFisico = useMemo(() => {
    return reportItemsRows.reduce((acc, row) => acc + row.qtyColetada, 0);
  }, [reportItemsRows]);

  const barcodeInputRef = useRef(null);

  // Carrega dados iniciais do localStorage
  useEffect(() => {
    if (isLoggedIn) {
      setInventories(getInventories());
      setCatalogState(getCatalog());
      setCounts(getCounts());
    }
  }, [isLoggedIn]);

  // Carrega os setores do inventário ativo quando ele muda
  useEffect(() => {
    if (currentInventory) {
      const savedSectors = localStorage.getItem(`sc_sectors_${currentInventory.id}`);
      if (savedSectors) {
        const parsed = JSON.parse(savedSectors);
        setSectors(parsed);
        setActiveSector(parsed[0] || '');
      } else {
        const defaultSectors = [];
        setSectors(defaultSectors);
        setActiveSector('');
        localStorage.setItem(`sc_sectors_${currentInventory.id}`, JSON.stringify(defaultSectors));
      }
    } else {
      setSectors([]);
      setActiveSector('');
    }
  }, [currentInventory]);

  // LOGIN FLOW
  const handleLogin = (e) => {
    e.preventDefault();
    const activeStore = store || (stores && stores[0]) || 'Depósito Geral';
    if (!operator.trim() || !activeStore) return;
    setOperator(operator.trim());
    setStore(activeStore);
    setOperatorState(operator.trim());
    setStoreState(activeStore);
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
    setCameraOpen(countMethod === 'scan'); // Abre a câmera automaticamente se for escaneamento!
    
    // Configura filtros
    if (activeInv.categoryFilter) {
      setMaintSectorFilter('');
    }
  };

  // CRIAR INVENTÁRIO LOCAL
  const handleCreateLocalInventory = (e) => {
    e.preventDefault();
    if (!newInvName.trim()) return;

    const activeStore = store || (stores && stores[0]) || 'Depósito Geral';

    const newInv = {
      id: 'local-' + Date.now(),
      name: newInvName.trim(),
      store: activeStore,
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
    setCameraOpen(countMethod === 'scan'); // Abre a câmera automaticamente se for escaneamento!
    alert(`Inventário "${newInv.name}" criado localmente e iniciado!`);
  };

  // EXCLUIR INVENTÁRIO LOCAL
  const handleDeleteInventory = (invId, e) => {
    e.stopPropagation(); // Evita selecionar o inventário ao clicar em excluir
    if (confirm("Tem certeza que deseja excluir este inventário local e todas as suas contagens?")) {
      const list = getInventories();
      const filtered = list.filter(i => i.id !== invId);
      localStorage.setItem('sc_inventories', JSON.stringify(filtered));
      setInventories(filtered);
      
      const countsList = getCounts();
      const filteredCounts = countsList.filter(c => c.idInventario !== invId);
      saveCounts(filteredCounts);
      setCounts(filteredCounts);
      
      if (currentInventory?.id === invId) {
        setCurrentInventory(null);
      }
      
      alert("Inventário excluído com sucesso.");
    }
  };

  // ENTRADA DE CÓDIGO DE BARRAS (SCANNER OU MANUAL)
  const processBarcode = (code) => {
    const cleanCode = code.trim();
    if (!cleanCode) return;

    const prod = findProductByBarcode(cleanCode);

    if (prod) {
      // Produto encontrado
      if (isBipagemMode) {
        // Modo Bipagem: grava a contagem imediatamente (quantidade 1) e bipa
        const countRecord = {
          idInventario: currentInventory.id,
          barcode: cleanCode,
          quantity: 1,
          sector: activeSector,
          operator: operator,
          mode: isRecountMode ? 'recontagem' : 'coleta'
        };

        const syncMode = getSyncMode();
        if (syncMode === 'online') {
          simulateRealTimeAPI(countRecord, prod.description);
        }

        addCount(countRecord);
        setCounts(getCounts());
        setScannedProduct(prod);
        setBarcodeInput('');
        
        if (!soundMuted) {
          playSuccessBeep();
        }

        // Foca o input de digitação novamente apenas se estiver nesse modo
        if (countMethod === 'type') {
          setTimeout(() => {
            barcodeInputRef.current?.focus();
          }, 50);
        }
      } else {
        // Modo Scanner/Digitação com confirmação manual (carrega e pausa scanner se for câmera)
        setScannedProduct(prod);
        setScanQty(1);
        if (countMethod === 'scan') {
          setIsPaused(true);
        }
      }
    } else {
      // Produto não cadastrado
      if (isBlindCount) {
        // Modo Contagem Cega: registra o produto avulso automaticamente
        const newTempProd = {
          barcode: cleanCode,
          description: `Produto Avulso (EAN: ${cleanCode})`,
          brand: "Avulsa",
          category: "Geral",
          price: 0.0,
          stock: 0
        };

        // Adiciona temporário ao catálogo local
        const updatedCat = [newTempProd, ...catalog];
        setCatalog(updatedCat);
        setCatalogState(updatedCat);

        if (isBipagemMode) {
          const countRecord = {
            idInventario: currentInventory.id,
            barcode: cleanCode,
            quantity: 1,
            sector: activeSector,
            operator: operator,
            mode: isRecountMode ? 'recontagem' : 'coleta'
          };

          const syncMode = getSyncMode();
          if (syncMode === 'online') {
            simulateRealTimeAPI(countRecord, newTempProd.description);
          }

          addCount(countRecord);
          setCounts(getCounts());
          setBarcodeInput('');
          setScannedProduct(newTempProd);
          
          if (!soundMuted) {
            playSuccessBeep();
          }

          if (countMethod === 'type') {
            setTimeout(() => {
              barcodeInputRef.current?.focus();
            }, 50);
          }
        } else {
          setScannedProduct(newTempProd);
          setScanQty(1);
          if (countMethod === 'scan') {
            setIsPaused(true);
          }
        }
      } else {
        if (!soundMuted) {
          playErrorBuzzer();
        }
        
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

          if (isBipagemMode) {
            const countRecord = {
              idInventario: currentInventory.id,
              barcode: cleanCode,
              quantity: 1,
              sector: activeSector,
              operator: operator,
              mode: isRecountMode ? 'recontagem' : 'coleta'
            };

            const syncMode = getSyncMode();
            if (syncMode === 'online') {
              simulateRealTimeAPI(countRecord, newTempProd.description);
            }

            addCount(countRecord);
            setCounts(getCounts());
            setBarcodeInput('');
            setScannedProduct(newTempProd);
            
            if (!soundMuted) {
              playSuccessBeep();
            }

            if (countMethod === 'type') {
              setTimeout(() => {
                barcodeInputRef.current?.focus();
              }, 50);
            }
          } else {
            setScannedProduct(newTempProd);
            setScanQty(1);
            if (countMethod === 'scan') {
              setIsPaused(true);
            }
          }
        }
      }
    }
  };

  // CONFIRMAR E GRAVAR A CONTAGEM (Modo Scanner e Modo Digitação com Confirmação)
  const confirmCount = () => {
    if (!currentInventory || !scannedProduct) return;

    const countRecord = {
      idInventario: currentInventory.id,
      barcode: scannedProduct.barcode,
      quantity: parseFloat(scanQty) || 1,
      sector: activeSector,
      operator: operator,
      mode: isRecountMode ? 'recontagem' : 'coleta'
    };

    // Simula Integração em Tempo Real via API se o modo for online
    const syncMode = getSyncMode();
    if (syncMode === 'online') {
      simulateRealTimeAPI(countRecord, scannedProduct.description);
    }

    addCount(countRecord);
    setCounts(getCounts());

    if (!soundMuted) {
      playSuccessBeep();
    }

    // Limpa estado de leitura e retoma câmera
    setScannedProduct(null);
    setScanQty(1);
    setBarcodeInput('');
    setIsPaused(false);

    if (countMethod === 'type') {
      setTimeout(() => {
        barcodeInputRef.current?.focus();
      }, 50);
    }
  };

  // CANCELAR A CONTAGEM ATUAL (Modo Scanner e Modo Digitação com Confirmação)
  const cancelCount = () => {
    setScannedProduct(null);
    setScanQty(1);
    setBarcodeInput('');
    setIsPaused(false);

    if (countMethod === 'type') {
      setTimeout(() => {
        barcodeInputRef.current?.focus();
      }, 50);
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
    if (currentInventory) {
      localStorage.setItem(`sc_sectors_${currentInventory.id}`, JSON.stringify(updated));
    }
    setActiveSector(newSectorName.trim());
    setNewSectorName('');
    alert(`Setor "${newSectorName.trim()}" criado e selecionado!`);
  };

  // EXCLUIR SETOR
  const handleDeleteSector = (secName, e) => {
    e.stopPropagation(); // Evita selecionar o setor ao excluir
    
    // Verifica se existem contagens associadas ao setor no inventário atual
    const secCounts = activeInventoryCounts.filter(c => c.sector === secName);
    if (secCounts.length > 0) {
      if (!confirm(`Atenção: Existem ${secCounts.length} contagens no "${secName}". Se você excluí-lo, todas as contagens deste setor serão apagadas definitivamente! Deseja continuar?`)) {
        return;
      }
      
      // Exclui contagens associadas
      const countsList = getCounts();
      const filteredCounts = countsList.filter(c => !(c.idInventario === currentInventory.id && c.sector === secName));
      saveCounts(filteredCounts);
      setCounts(filteredCounts);
    }
    
    const updated = sectors.filter(s => s !== secName);
    setSectors(updated);
    if (currentInventory) {
      localStorage.setItem(`sc_sectors_${currentInventory.id}`, JSON.stringify(updated));
    }
    
    if (activeSector === secName) {
      setActiveSector(updated[0] || '');
    }
    
    alert(`Setor "${secName}" excluído com sucesso.`);
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
      setStoresList(getStores());
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

            {stores.length > 1 ? (
              <div className="form-group animate-slide">
                <label>Selecione a Loja</label>
                <select value={store} onChange={(e) => setStoreState(e.target.value)} required>
                  <option value="">-- Escolha a Loja --</option>
                  {stores.map((s, idx) => (
                    <option key={idx} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="form-group" style={{ display: 'none' }}>
                <label>Loja Ativa</label>
                <input type="text" value={store || (stores[0] || 'Depósito Geral')} readOnly />
              </div>
            )}

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
            {activeTab === 'dashboard' && (
              <div className="dashboard-screen animate-fade">
                <div className="card-custom glassmorphism">
                  <div className="card-header-custom">
                    <h4>📋 Inventários Disponíveis no ERP</h4>
                    <p className="card-subtitle">Sessões ativas criadas no ERP central.</p>
                  </div>
                  <div className="inventories-list" style={{ marginTop: '12px' }}>
                    {inventories.filter(i => i.isERP).length === 0 ? (
                      <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px', fontSize: '13px', border: '1px dashed var(--border-color)', borderRadius: '12px' }}>
                        🔌 Integração com ERP Inativa <br />
                        <span style={{ fontSize: '11px', display: 'block', marginTop: '4px' }}>
                          Conecte a API do ERP na aba <strong>Sinc & ERP</strong> para carregar as sessões de inventário.
                        </span>
                      </div>
                    ) : (
                      inventories.filter(i => i.isERP).map(inv => (
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
                      ))
                    )}
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
                      <label>Categoria Filtrada (Do Catálogo)</label>
                      <select value={newInvCategory} onChange={(e) => setNewInvCategory(e.target.value)}>
                        <option value="">Todas as Categorias</option>
                        {categoriesList.map((cat, idx) => (
                          <option key={idx} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <button type="submit" className="btn-create-local" style={{ marginTop: '18px', width: '100%' }}>Criar e Iniciar Contagem</button>
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
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="inv-tag">Local</span>
                            <button 
                              className="btn-delete-inv" 
                              onClick={(e) => handleDeleteInventory(inv.id, e)}
                              title="Excluir Inventário"
                              style={{ 
                                background: 'rgba(239, 68, 68, 0.15)', 
                                color: '#ef4444', 
                                border: '1px solid rgba(239, 68, 68, 0.3)', 
                                padding: '6px 10px', 
                                borderRadius: '8px', 
                                fontSize: '12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                              }}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TELA 2: COLETAR (SCANNER & INPUT) */}
            {activeTab === 'collect' && (
              !currentInventory ? (
                <div className="card-custom glassmorphism animate-fade" style={{ margin: '20px', textAlign: 'center', padding: '40px' }}>
                  <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>📋</span>
                  <h4 style={{ color: 'var(--color-primary)' }}>Nenhum Inventário Selecionado</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '8px' }}>
                    Você precisa selecionar um inventário existente ou criar um novo inventário avulso na aba <strong>Dashboard</strong> antes de continuar.
                  </p>
                  <button 
                    className="btn-create-local" 
                    style={{ marginTop: '20px', padding: '10px 20px', display: 'inline-block', width: 'auto' }}
                    onClick={() => setActiveTab('dashboard')}
                  >
                    Ir para o Dashboard
                  </button>
                </div>
              ) : (
                <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 120px)' }}>
                  
                  {/* BARRA DE STATUS DA CONTAGEM */}
                  <div className="collect-header-status detailed">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className="status-left">
                        <span>Setor: <strong>{activeSector || 'Sem Setor (Geral)'}</strong></span>
                      </div>
                      <div className="status-right">
                        <span className={`mode-indicator ${isRecountMode ? 'recount' : 'normal'}`}>
                          {isRecountMode ? 'CONFERÊNCIA' : 'CONTAGEM ATIVA'}
                        </span>
                      </div>
                    </div>

                    {/* CONTROLE DE BIPAGEM CONTÍNUA */}
                    <div className="bipagem-toggle-row">
                      <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-main)' }}>
                        Contagem por bipagem (Auto-salvar)
                      </span>
                      <label className="switch-custom">
                        <input 
                          type="checkbox" 
                          checked={isBipagemMode} 
                          onChange={(e) => {
                            setIsBipagemMode(e.target.checked);
                            // Reseta pausas se desativar
                            if (e.target.checked) {
                              setIsPaused(false);
                            }
                          }}
                        />
                        <span className="slider-custom"></span>
                      </label>
                    </div>
                    
                    {/* SINALIZAÇÃO DE CONTAGEM CEGA */}
                    <div className={`blind-count-container ${isBlindCount ? 'active' : ''}`}>
                      <label className={`blind-count-label ${isBlindCount ? 'active' : ''}`}>
                        <input 
                          type="checkbox" 
                          checked={isBlindCount} 
                          onChange={(e) => setIsBlindCount(e.target.checked)}
                          style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                        />
                        <span>Modo Contagem Cega (Sem validar catálogo)</span>
                      </label>
                      <span className={`blind-count-badge ${isBlindCount ? 'active' : ''}`}>
                        {isBlindCount ? 'ATIVO 👁️ Cega' : 'DESATIVADO 📋'}
                      </span>
                    </div>
                  </div>

                  {/* LEITOR DE CÂMERA OU DIGITAÇÃO */}
                  <div style={{ flex: 1 }}>
                    {countMethod === 'scan' ? (
                      <div>
                        {cameraOpen ? (
                          <Scanner 
                            onScan={processBarcode}
                            onClose={() => setCameraOpen(false)}
                            isPaused={isPaused}
                            soundMuted={soundMuted}
                            onToggleMute={() => setSoundMuted(!soundMuted)}
                            currentInventory={currentInventory}
                            scannedProduct={scannedProduct}
                            totalItemsCounted={totalItemsCounted}
                            isBipagemMode={isBipagemMode}
                            scanQty={scanQty}
                            adjustQty={adjustQty}
                            setScanQty={setScanQty}
                            confirmCount={confirmCount}
                            cancelCount={cancelCount}
                            setPalletOpen={setPalletOpen}
                          />
                        ) : (
                          <div className="card-custom glassmorphism" style={{ margin: '16px', textAlign: 'center', padding: '30px' }}>
                            <span style={{ fontSize: '36px', display: 'block', marginBottom: '12px' }}>📷</span>
                            <h5>Câmera do Leitor Desativada</h5>
                            <button 
                              className="btn-scan-trigger" 
                              style={{ marginTop: '16px', width: '100%' }} 
                              onClick={() => setCameraOpen(true)}
                            >
                              📷 Ativar Câmera do Celular
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="collect-inputs-area" style={{ marginTop: '10px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)' }}>
                          Código do Produto
                        </label>
                        <form 
                          onSubmit={(e) => {
                            e.preventDefault();
                            processBarcode(barcodeInput);
                          }} 
                          className="manual-barcode-row"
                        >
                          <input
                            type="text"
                            ref={barcodeInputRef}
                            placeholder="Código de barras ou código interno"
                            value={barcodeInput}
                            onChange={(e) => setBarcodeInput(e.target.value)}
                            className="input-barcode"
                            autoFocus
                          />
                          <button type="submit" className="btn-enter-barcode">Pesquisar produto</button>
                        </form>
                      </div>
                    )}

                    {/* PRODUTO SELECIONADO / MOSTRAR DETALHES (EDITAR CONTAGEM) */}
                    {scannedProduct && countMethod === 'type' && (
                      <div className="scanned-product-details animate-slide" style={{ margin: '16px', border: '1px solid var(--color-primary)' }}>
                        <div className="prod-details-main">
                          <h4 style={{ color: 'var(--color-primary)' }}>{scannedProduct.description}</h4>
                          <div className="prod-details-meta" style={{ marginTop: '4px' }}>
                            <strong>EAN:</strong> {scannedProduct.barcode} <br />
                            <strong>Marca:</strong> {scannedProduct.brand} • <strong>Cat:</strong> {scannedProduct.category}
                          </div>
                        </div>

                        {/* EDITAR QUANTIDADE E MULTIPLICADORES RÁPIDOS */}
                        <div className="qty-adjuster-row" style={{ marginTop: '12px', flexDirection: 'column', gap: '12px' }}>
                          <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)' }}>
                            Informe a Quantidade Coletada:
                          </label>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <div className="qty-input-box" style={{ flex: 1 }}>
                              <button type="button" className="btn-qty-adj" onClick={() => adjustQty(-1)}>-</button>
                              <input
                                type="number"
                                min="1"
                                value={scanQty}
                                onChange={(e) => setScanQty(Math.max(1, parseFloat(e.target.value) || 1))}
                                className="input-qty"
                                style={{ fontSize: '16px', fontWeight: 'bold', textAlign: 'center' }}
                              />
                              <button type="button" className="btn-qty-adj" onClick={() => adjustQty(1)}>+</button>
                            </div>

                            <button 
                              type="button" 
                              className="btn-pallet-trigger" 
                              title="Calculadora de Pallets" 
                              onClick={() => setPalletOpen(true)}
                              style={{ height: '42px', width: '42px', borderRadius: '10px' }}
                            >
                              📦
                            </button>
                          </div>

                          {!isBipagemMode && (
                            <>
                              <div className="multipliers-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                                <button type="button" className="btn-mult" onClick={() => setScanQty(prev => prev + 5)}>+5</button>
                                <button type="button" className="btn-mult" onClick={() => setScanQty(prev => prev + 10)}>+10</button>
                                <button type="button" className="btn-mult" onClick={() => setScanQty(prev => prev + 50)}>+50</button>
                                <button type="button" className="btn-mult" onClick={() => setScanQty(prev => prev + 100)}>+100</button>
                              </div>

                              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                                <button 
                                  type="button" 
                                  onClick={confirmCount} 
                                  className="btn-login"
                                  style={{ flex: 1, margin: 0, padding: '10px', fontSize: '14px', background: 'var(--color-primary)' }}
                                >
                                  💾 Confirmar Contagem
                                </button>
                                <button 
                                  type="button" 
                                  onClick={cancelCount} 
                                  className="btn-maint-del"
                                  style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '10px 16px', borderRadius: '12px' }}
                                >
                                  Cancelar
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* TOTALIZADOR */}
                  <div className="counting-stats-bar" style={{ marginTop: '16px' }}>
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
                  <div className="recent-scans-list" style={{ padding: '0 16px', marginBottom: '16px' }}>
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

                  {/* FOOTER BAR FOR SELECTION OF METHOD */}
                  <div className="scan-mode-footer-bar">
                    <button 
                      type="button"
                      className={`btn-method-tab ${countMethod === 'type' ? 'active' : ''}`}
                      onClick={() => {
                        setCountMethod('type');
                        setCameraOpen(false);
                        setIsPaused(false);
                        setScannedProduct(null);
                        setTimeout(() => {
                          barcodeInputRef.current?.focus();
                        }, 50);
                      }}
                    >
                      ⌨️ Digitar
                    </button>
                    <button 
                      type="button"
                      className={`btn-method-tab ${countMethod === 'scan' ? 'active' : ''}`}
                      onClick={() => {
                        setCountMethod('scan');
                        setCameraOpen(true);
                        setIsPaused(false);
                        setScannedProduct(null);
                      }}
                    >
                      🔍 Escanear
                    </button>
                </div>
              </div>
            )
          )}

            {/* TELA 3: SETORIZAÇÃO */}
            {activeTab === 'sectors' && (
              !currentInventory ? (
                <div className="card-custom glassmorphism animate-fade" style={{ margin: '20px', textAlign: 'center', padding: '40px' }}>
                  <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>📋</span>
                  <h4 style={{ color: 'var(--color-primary)' }}>Nenhum Inventário Selecionado</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '8px' }}>
                    Você precisa selecionar um inventário existente ou criar um novo inventário avulso na aba <strong>Dashboard</strong> antes de continuar.
                  </p>
                  <button 
                    className="btn-create-local" 
                    style={{ marginTop: '20px', padding: '10px 20px', display: 'inline-block', width: 'auto' }}
                    onClick={() => setActiveTab('dashboard')}
                  >
                    Ir para o Dashboard
                  </button>
                </div>
              ) : (
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
                    {sectors.length === 0 ? (
                      <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px 16px', fontSize: '12px', border: '1px dashed var(--border-color)', borderRadius: '10px' }}>
                        Nenhum setor cadastrado. <br />
                        <span style={{ fontSize: '10px', marginTop: '4px', display: 'block' }}>Cadastre um setor acima se desejar organizar sua contagem por gôndolas/corredores.</span>
                      </div>
                    ) : (
                      sectors.map((sec, i) => {
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
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <strong style={{ color: activeSector === sec ? 'var(--color-primary)' : 'white' }}>
                              {secTotal} un
                            </strong>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteSector(sec, e)}
                              title="Excluir Setor"
                              style={{
                                background: 'rgba(239, 68, 68, 0.15)',
                                color: '#ef4444',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                              }}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      );
                        })
                      )}
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
            )
          )}

            {/* TELA 4: MANUTENÇÃO (CONSULTAR E REMOVER) */}
            {activeTab === 'maint' && (
              !currentInventory ? (
                <div className="card-custom glassmorphism animate-fade" style={{ margin: '20px', textAlign: 'center', padding: '40px' }}>
                  <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>📋</span>
                  <h4 style={{ color: 'var(--color-primary)' }}>Nenhum Inventário Selecionado</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '8px' }}>
                    Você precisa selecionar um inventário existente ou criar um novo inventário avulso na aba <strong>Dashboard</strong> antes de continuar.
                  </p>
                  <button 
                    className="btn-create-local" 
                    style={{ marginTop: '20px', padding: '10px 20px', display: 'inline-block', width: 'auto' }}
                    onClick={() => setActiveTab('dashboard')}
                  >
                    Ir para o Dashboard
                  </button>
                </div>
              ) : (
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
            )
          )}

            {/* TELA 5: KARDEX & SINCRONIZAÇÃO (INTEGRAÇÃO COMPLETA) */}
            {activeTab === 'kardex' && (
              !currentInventory ? (
                <div className="card-custom glassmorphism animate-fade" style={{ margin: '20px', textAlign: 'center', padding: '40px' }}>
                  <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>📋</span>
                  <h4 style={{ color: 'var(--color-primary)' }}>Nenhum Inventário Selecionado</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '8px' }}>
                    Você precisa selecionar um inventário existente ou criar um novo inventário avulso na aba <strong>Dashboard</strong> antes de continuar.
                  </p>
                  <button 
                    className="btn-create-local" 
                    style={{ marginTop: '20px', padding: '10px 20px', display: 'inline-block', width: 'auto' }}
                    onClick={() => setActiveTab('dashboard')}
                  >
                    Ir para o Dashboard
                  </button>
                </div>
              ) : (
                <KardexDashboard 
                  inventory={currentInventory}
                  counts={counts}
                  catalog={catalog}
                  mergedCounts={mergedCounts}
                  onOpenReport={() => setReportModalOpen(true)}
                  onClearLocalCounts={() => {
                  if (confirm("Deseja mesmo limpar as contagens locais desse inventário?")) {
                    setCounts(counts.filter(c => c.idInventario !== currentInventory.id));
                  }
                }}
              />
              )
            )}

            {/* TELA 6: CONFIGURAÇÕES */}
            {activeTab === 'settings' && (
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
              className={`nav-item ${activeTab === 'sectors' ? 'active' : ''}`}
              onClick={() => { setActiveTab('sectors'); setMergedCounts(null); }}
            >
              <span className="nav-icon">📍</span>
              <span>Setores</span>
            </button>

            <button 
              className={`nav-item ${activeTab === 'collect' ? 'active' : ''}`}
              onClick={() => { setActiveTab('collect'); setMergedCounts(null); }}
            >
              <span className="nav-icon">🎯</span>
              <span>Coletar</span>
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

          {/* VISUALIZAÇÃO DO RELATÓRIO PDF EM MODAL INTERNO */}
          {reportModalOpen && currentInventory && (
            <div id="print-report-modal" className="report-modal-backdrop">
              <div className="report-modal-content">
                <div className="report-modal-header no-print">
                  <h3 style={{ margin: 0, color: 'var(--color-primary)' }}>Visualização do Relatório</h3>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      className="btn-maint-del" 
                      style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: '13px', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', cursor: 'pointer', transition: 'all 0.2s' }}
                      onClick={() => setReportModalOpen(false)}
                    >
                      Sair
                    </button>
                    <button 
                      className="btn-create-local" 
                      style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                      onClick={() => window.print()}
                    >
                      🖨️ Salvar PDF / Imprimir
                    </button>
                  </div>
                </div>
                
                <div className="report-print-body">
                  <div className="header" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #f26522', paddingBottom: '10px', marginBottom: '20px' }}>
                    <div>
                      <h1 style={{ margin: 0, color: '#f26522', fontSize: '24px' }}>Amura Collector</h1>
                      <p style={{ margin: '3px 0 0 0', color: 'var(--text-muted)' }}>Relatório Executivo de Contagem de Estoque</p>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '12px', color: 'var(--text-muted)' }}>
                      <strong>Data de Emissão:</strong> {new Date().toLocaleDateString('pt-BR')}<br />
                      <strong>Hora:</strong> {new Date().toLocaleTimeString('pt-BR')}
                    </div>
                  </div>

                  <div className="meta-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginBottom: '20px', backgroundColor: 'rgba(255,255,255,0.01)', padding: '15px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    <div className="meta-item"><strong>Inventário:</strong> {currentInventory.name}</div>
                    <div className="meta-item"><strong>Loja:</strong> {currentInventory.store}</div>
                    <div className="meta-item"><strong>Status:</strong> <span style={{ textTransform: 'uppercase', fontWeight: 'bold', color: 'var(--color-primary)' }}>{currentInventory.status}</span></div>
                    <div className="meta-item"><strong>Criado em:</strong> {new Date(currentInventory.createdAt).toLocaleString('pt-BR')}</div>
                    <div className="meta-item"><strong>Horário de Início:</strong> {currentInventory.startedAt ? new Date(currentInventory.startedAt).toLocaleString('pt-BR') : 'Não Iniciado'}</div>
                    <div className="meta-item"><strong>Filtros:</strong> Categoria: {currentInventory.categoryFilter || 'Todas'}, Marca: {currentInventory.brandFilter || 'Todas'}</div>
                  </div>

                  <div className="summary-cards" style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
                    <div className="card" style={{ flex: 1, padding: '15px', background: 'rgba(242, 101, 34, 0.05)', borderLeft: '5px solid #f26522', borderRadius: '4px' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total de Peças Contadas</div>
                      <div className="card-val" style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '5px' }}>{reportTotalFisico} un</div>
                    </div>
                    <div className="card setores" style={{ flex: 1, padding: '15px', background: 'rgba(122, 12, 123, 0.05)', borderLeft: '5px solid #7a0c7b', borderRadius: '4px' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Setores Auditados</div>
                      <div className="card-val" style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '5px' }}>{Object.keys(reportSectorSummary).length} setores</div>
                    </div>
                  </div>

                  <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', fontSize: '14px', marginTop: '24px' }}>Resumo de Contagem por Setor</h3>
                  <div className="report-table-container">
                    <table style={{ borderCollapse: 'collapse', fontSize: '12px' }}>
                      <thead>
                        <tr style={{ background: '#7a0c7b', color: '#fff' }}>
                          <th style={{ border: '1px solid var(--border-color)', padding: '8px 10px', textAlign: 'left' }}>Setor</th>
                          <th style={{ border: '1px solid var(--border-color)', padding: '8px 10px', textAlign: 'right' }}>Variedade de Itens (SKUs)</th>
                          <th style={{ border: '1px solid var(--border-color)', padding: '8px 10px', textAlign: 'right' }}>Total de Peças Coletadas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.keys(reportSectorSummary).map(sec => (
                          <tr key={sec} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ border: '1px solid var(--border-color)', padding: '8px 10px' }}><strong>{sec}</strong></td>
                            <td style={{ border: '1px solid var(--border-color)', padding: '8px 10px', textAlign: 'right' }}>{reportSectorSummary[sec].distinctItems.size}</td>
                            <td style={{ border: '1px solid var(--border-color)', padding: '8px 10px', textAlign: 'right' }}>{reportSectorSummary[sec].totalItems}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', fontSize: '14px', marginTop: '24px' }}>Detalhamento do Inventário</h3>
                  <div className="report-table-container">
                    <table style={{ borderCollapse: 'collapse', fontSize: '12px' }}>
                      <thead>
                        <tr style={{ background: '#7a0c7b', color: '#fff' }}>
                          <th style={{ border: '1px solid var(--border-color)', padding: '8px 10px', textAlign: 'left' }}>Código de Barras</th>
                          <th style={{ border: '1px solid var(--border-color)', padding: '8px 10px', textAlign: 'left' }}>Descrição</th>
                          <th style={{ border: '1px solid var(--border-color)', padding: '8px 10px', textAlign: 'left' }}>Marca / Categoria</th>
                          <th style={{ border: '1px solid var(--border-color)', padding: '8px 10px', textAlign: 'right' }}>Contagem Física</th>
                          <th style={{ border: '1px solid var(--border-color)', padding: '8px 10px', textAlign: 'right' }}>Recontagem (Conf.)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportItemsRows.map(row => (
                          <tr key={row.barcode} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ border: '1px solid var(--border-color)', padding: '8px 10px' }}><code>{row.barcode}</code></td>
                            <td style={{ border: '1px solid var(--border-color)', padding: '8px 10px' }}>{row.description}</td>
                            <td style={{ border: '1px solid var(--border-color)', padding: '8px 10px' }}><small>{row.brand} / {row.category}</small></td>
                            <td style={{ border: '1px solid var(--border-color)', padding: '8px 10px', textAlign: 'right' }}><strong>{row.qtyColetada}</strong></td>
                            <td style={{ border: '1px solid var(--border-color)', padding: '8px 10px', textAlign: 'right', color: 'var(--text-muted)' }}>{row.qtyRecount || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="footer" style={{ marginTop: '50px', fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                    <p>Amura Collector - Sistema Profissional de Coleta de Dados Offline e Online para Inventários.</p>
                    <p>&copy; 2026 - Auditoria de Estoques.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </DeviceFrame>
  );
}
