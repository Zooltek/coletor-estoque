// storage.js - Armazenamento Offline-first usando LocalStorage
import { mockCatalog, mockStores } from '../data/mockCatalog';

const KEYS = {
  CATALOG: 'sc_catalog',
  INVENTORIES: 'sc_inventories',
  COUNTS: 'sc_counts',
  KARDEX: 'sc_kardex',
  OPERATOR: 'sc_operator',
  STORE: 'sc_store',
  STORES: 'sc_stores',
  API_ENDPOINT: 'sc_api_endpoint',
  SYNC_MODE: 'sc_sync_mode', // 'online' | 'lote'
};

// Inicializador de dados padrões caso o storage esteja limpo
export const initStorage = () => {
  if (!localStorage.getItem(KEYS.CATALOG)) {
    localStorage.setItem(KEYS.CATALOG, JSON.stringify(mockCatalog));
  }

  if (!localStorage.getItem(KEYS.INVENTORIES)) {
    localStorage.setItem(KEYS.INVENTORIES, JSON.stringify([]));
  }

  if (!localStorage.getItem(KEYS.STORES)) {
    localStorage.setItem(KEYS.STORES, JSON.stringify(mockStores));
  }

  if (!localStorage.getItem(KEYS.COUNTS)) {
    localStorage.setItem(KEYS.COUNTS, JSON.stringify([]));
  }

  // Inicializa o Kardex fictício com algumas movimentações para demonstração
  if (!localStorage.getItem(KEYS.KARDEX)) {
    const now = new Date();
    // Gera transações que ocorreram recentemente (para simulação de vendas durante a contagem)
    const mockKardex = [
      // Venda ocorrida há 10 minutos (produto 78910001)
      {
        id: "k-1",
        barcode: "78910001", // Arroz Integral
        type: "venda",
        quantity: 2,
        timestamp: new Date(now.getTime() - 10 * 60 * 1000).toISOString()
      },
      // Venda ocorrida há 5 minutos (produto 78910001)
      {
        id: "k-2",
        barcode: "78910001", // Arroz Integral
        type: "venda",
        quantity: 3,
        timestamp: new Date(now.getTime() - 5 * 60 * 1000).toISOString()
      },
      // Entrada ocorrida há 15 minutos (produto 78910002)
      {
        id: "k-3",
        barcode: "78910002", // Feijão Preto
        type: "entrada",
        quantity: 20,
        timestamp: new Date(now.getTime() - 15 * 60 * 1000).toISOString()
      },
      // Venda ocorrida há 1 minuto (produto 78930003)
      {
        id: "k-4",
        barcode: "78930003", // Fone JBL
        type: "venda",
        quantity: 1,
        timestamp: new Date(now.getTime() - 1 * 60 * 1000).toISOString()
      }
    ];
    localStorage.setItem(KEYS.KARDEX, JSON.stringify(mockKardex));
  }

  if (!localStorage.getItem(KEYS.SYNC_MODE)) {
    localStorage.setItem(KEYS.SYNC_MODE, 'lote'); // default para lote
  }

  if (!localStorage.getItem(KEYS.API_ENDPOINT)) {
    localStorage.setItem(KEYS.API_ENDPOINT, 'https://erp.seusistema.com.br/api/contagem');
  }
};

// OPERADOR E LOJA
export const getOperator = () => localStorage.getItem(KEYS.OPERATOR) || '';
export const setOperator = (val) => localStorage.setItem(KEYS.OPERATOR, val);
export const getStore = () => localStorage.getItem(KEYS.STORE) || '';
export const setStore = (val) => localStorage.setItem(KEYS.STORE, val);

// MODOS E ENDPOINTS
export const getSyncMode = () => localStorage.getItem(KEYS.SYNC_MODE) || 'lote';
export const setSyncMode = (val) => localStorage.setItem(KEYS.SYNC_MODE, val);
export const getApiEndpoint = () => localStorage.getItem(KEYS.API_ENDPOINT) || '';
export const setApiEndpoint = (val) => localStorage.setItem(KEYS.API_ENDPOINT, val);

// CATALOGO
export const getCatalog = () => {
  return JSON.parse(localStorage.getItem(KEYS.CATALOG) || '[]');
};
export const setCatalog = (catalog) => {
  localStorage.setItem(KEYS.CATALOG, JSON.stringify(catalog));
};
export const findProductByBarcode = (barcode) => {
  const catalog = getCatalog();
  return catalog.find(p => p.barcode === barcode) || null;
};

// INVENTARIOS
export const getInventories = () => {
  return JSON.parse(localStorage.getItem(KEYS.INVENTORIES) || '[]');
};

export const saveInventory = (inv) => {
  const list = getInventories();
  const index = list.findIndex(i => i.id === inv.id);
  if (index >= 0) {
    list[index] = inv;
  } else {
    list.push(inv);
  }
  localStorage.setItem(KEYS.INVENTORIES, JSON.stringify(list));
  return list;
};

// COLETAS
export const getCounts = () => {
  return JSON.parse(localStorage.getItem(KEYS.COUNTS) || '[]');
};

export const saveCounts = (counts) => {
  localStorage.setItem(KEYS.COUNTS, JSON.stringify(counts));
};

export const addCount = (count) => {
  const list = getCounts();
  const newCount = {
    id: 'c-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    timestamp: new Date().toISOString(),
    ...count
  };
  list.unshift(newCount); // Insere no início para mostrar os últimos coletados primeiro
  saveCounts(list);
  return newCount;
};

export const updateCount = (id, newQty) => {
  const list = getCounts();
  const index = list.findIndex(c => c.id === id);
  if (index >= 0) {
    list[index].quantity = parseFloat(newQty);
    saveCounts(list);
    return true;
  }
  return false;
};

export const deleteCount = (id) => {
  const list = getCounts();
  const filtered = list.filter(c => c.id !== id);
  saveCounts(filtered);
  return filtered;
};

export const clearCountsForInventory = (invId) => {
  const list = getCounts();
  const filtered = list.filter(c => c.idInventario !== invId);
  saveCounts(filtered);
};

// KARDEX
export const getKardex = () => {
  return JSON.parse(localStorage.getItem(KEYS.KARDEX) || '[]');
};

export const addKardexMove = (move) => {
  const list = getKardex();
  const newMove = {
    id: 'k-' + Date.now(),
    timestamp: new Date().toISOString(),
    ...move
  };
  list.push(newMove);
  localStorage.setItem(KEYS.KARDEX, JSON.stringify(list));
  return newMove;
};

// LOJAS
export const getStores = () => {
  return JSON.parse(localStorage.getItem(KEYS.STORES) || '[]');
};
export const setStores = (stores) => {
  localStorage.setItem(KEYS.STORES, JSON.stringify(stores));
};

// LIMPAR TUDO (Reset do App)
export const resetAllStorage = () => {
  localStorage.removeItem(KEYS.CATALOG);
  localStorage.removeItem(KEYS.INVENTORIES);
  localStorage.removeItem(KEYS.COUNTS);
  localStorage.removeItem(KEYS.KARDEX);
  localStorage.removeItem(KEYS.STORES);
  initStorage();
};
