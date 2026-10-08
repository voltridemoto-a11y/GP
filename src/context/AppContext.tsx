import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  AppData, Page, Motorcycle, Part, Supplier, Shipment, PurchaseOrder,
  VaultEntry, GPDocument, Warehouse, ActivityEntry,
} from '../types';
import { seedData } from '../data/seedData';
import { fetchAllData, saveCollection, resetServerData, health } from '../api';

const STORAGE_KEY = 'gpbikes_cmd_data_v1';
const CURRENT_USER = 'Braden';

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

// Vault password codec (XOR + base64)
export function encodePassword(s: string) {
  return btoa(s.split('').map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ (42 + (i % 7)))).join(''));
}
export function decodePassword(enc: string) {
  try {
    return atob(enc).split('').map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ (42 + (i % 7)))).join('');
  } catch { return ''; }
}

export interface SearchResult {
  type: string; id: string; title: string; subtitle: string; page: Page;
}

interface AppContextType {
  data: AppData;
  loading: boolean;
  online: boolean;
  currentPage: Page;
  selectedId: string | null;
  theme: 'dark' | 'light';
  setPage: (page: Page, id?: string) => void;
  toggleTheme: () => void;
  logActivity: (action: string, entityType: string, actionType: ActivityEntry['actionType'], entityId?: string, entityName?: string, details?: string) => void;

  addMotorcycle: (m: Omit<Motorcycle, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMotorcycle: (id: string, m: Partial<Motorcycle>) => void;
  deleteMotorcycle: (id: string) => void;
  addPart: (p: Omit<Part, 'id' | 'createdAt'>) => void;
  updatePart: (id: string, p: Partial<Part>) => void;
  deletePart: (id: string) => void;
  addSupplier: (s: Omit<Supplier, 'id' | 'createdAt'>) => void;
  updateSupplier: (id: string, s: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  addShipment: (s: Omit<Shipment, 'id' | 'createdAt'>) => void;
  updateShipment: (id: string, s: Partial<Shipment>) => void;
  deleteShipment: (id: string) => void;
  addPurchaseOrder: (p: Omit<PurchaseOrder, 'id' | 'createdAt'>) => void;
  updatePurchaseOrder: (id: string, p: Partial<PurchaseOrder>) => void;
  deletePurchaseOrder: (id: string) => void;
  addVaultEntry: (v: Omit<VaultEntry, 'id' | 'createdAt'>) => void;
  updateVaultEntry: (id: string, v: Partial<VaultEntry>) => void;
  deleteVaultEntry: (id: string) => void;
  addDocument: (d: Omit<GPDocument, 'id'>) => void;
  deleteDocument: (id: string) => void;
  addWarehouse: (w: Omit<Warehouse, 'id'>) => void;
  updateWarehouse: (id: string, w: Partial<Warehouse>) => void;
  deleteWarehouse: (id: string) => void;

  getSupplier: (id: string) => Supplier | undefined;
  getWarehouse: (id: string) => Warehouse | undefined;
  getMotorcycle: (id: string) => Motorcycle | undefined;
  getShipment: (id: string) => Shipment | undefined;
  getPurchaseOrder: (id: string) => PurchaseOrder | undefined;
  searchAll: (query: string) => SearchResult[];
  exportData: () => void;
  resetData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const emptyData: AppData = {
  motorcycles: [], parts: [], suppliers: [], shipments: [],
  purchaseOrders: [], vault: [], documents: [], warehouses: [], activity: [],
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Track which collections changed so we only PUT what's dirty
  const dirty = useRef<Set<keyof AppData>>(new Set());
  const onlineRef = useRef(false);

  // Load on mount: try server, fall back to localStorage, else seed
  useEffect(() => {
    (async () => {
      const isUp = await health();
      onlineRef.current = isUp;
      setOnline(isUp);
      if (isUp) {
        try {
          const serverData = await fetchAllData();
          setData(serverData);
          setLoading(false);
          return;
        } catch { /* fall through */ }
      }
      // Offline fallback — localStorage then seed
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        setData(stored ? JSON.parse(stored) : seedData);
      } catch {
        setData(seedData);
      }
      setLoading(false);
    })();
  }, []);

  // Persist helper — writes dirty collections to server (or localStorage offline)
  const persist = useCallback((next: AppData, changed: (keyof AppData)[]) => {
    if (onlineRef.current) {
      changed.forEach(name => {
        saveCollection(name, next[name]).catch(() => {
          // On failure, cache locally so data isn't lost
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
        });
      });
    } else {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
    }
  }, []);

  // Generic mutate: update state + persist the touched collections
  const mutate = useCallback((changed: (keyof AppData)[], updater: (d: AppData) => AppData) => {
    setData(prev => {
      const next = updater(prev);
      persist(next, changed);
      return next;
    });
  }, [persist]);

  const setPage = useCallback((page: Page, id?: string) => {
    setCurrentPage(page); setSelectedId(id ?? null); window.scrollTo(0, 0);
  }, []);
  const toggleTheme = useCallback(() => setTheme(t => t === 'dark' ? 'light' : 'dark'), []);

  const logActivity = useCallback((action: string, entityType: string, actionType: ActivityEntry['actionType'], entityId?: string, entityName?: string, details?: string) => {
    const entry: ActivityEntry = { id: uid(), action, entityType, entityId, entityName, user: CURRENT_USER, timestamp: new Date().toISOString(), details, actionType };
    mutate(['activity'], d => ({ ...d, activity: [entry, ...d.activity].slice(0, 200) }));
  }, [mutate]);

  // ── Motorcycles
  const addMotorcycle = useCallback((m: Omit<Motorcycle, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const item: Motorcycle = { ...m, id: uid(), createdAt: now, updatedAt: now };
    const entry: ActivityEntry = { id: uid(), action: `Added motorcycle ${m.bikeId} (${m.brand} ${m.model})`, entityType: 'motorcycle', entityId: item.id, entityName: m.bikeId, user: CURRENT_USER, timestamp: now, actionType: 'added' };
    mutate(['motorcycles', 'activity'], d => ({ ...d, motorcycles: [...d.motorcycles, item], activity: [entry, ...d.activity].slice(0, 200) }));
  }, [mutate]);
  const updateMotorcycle = useCallback((id: string, u: Partial<Motorcycle>) => {
    mutate(['motorcycles'], d => ({ ...d, motorcycles: d.motorcycles.map(m => m.id === id ? { ...m, ...u, updatedAt: new Date().toISOString() } : m) }));
  }, [mutate]);
  const deleteMotorcycle = useCallback((id: string) => {
    mutate(['motorcycles'], d => ({ ...d, motorcycles: d.motorcycles.filter(m => m.id !== id) }));
  }, [mutate]);

  // ── Parts
  const addPart = useCallback((p: Omit<Part, 'id' | 'createdAt'>) => {
    const item: Part = { ...p, id: uid(), createdAt: new Date().toISOString() };
    mutate(['parts'], d => ({ ...d, parts: [...d.parts, item] }));
  }, [mutate]);
  const updatePart = useCallback((id: string, u: Partial<Part>) => {
    mutate(['parts'], d => ({ ...d, parts: d.parts.map(p => p.id === id ? { ...p, ...u } : p) }));
  }, [mutate]);
  const deletePart = useCallback((id: string) => {
    mutate(['parts'], d => ({ ...d, parts: d.parts.filter(p => p.id !== id) }));
  }, [mutate]);

  // ── Suppliers
  const addSupplier = useCallback((s: Omit<Supplier, 'id' | 'createdAt'>) => {
    const item: Supplier = { ...s, id: uid(), createdAt: new Date().toISOString() };
    mutate(['suppliers'], d => ({ ...d, suppliers: [...d.suppliers, item] }));
  }, [mutate]);
  const updateSupplier = useCallback((id: string, u: Partial<Supplier>) => {
    mutate(['suppliers'], d => ({ ...d, suppliers: d.suppliers.map(s => s.id === id ? { ...s, ...u } : s) }));
  }, [mutate]);
  const deleteSupplier = useCallback((id: string) => {
    mutate(['suppliers'], d => ({ ...d, suppliers: d.suppliers.filter(s => s.id !== id) }));
  }, [mutate]);

  // ── Shipments
  const addShipment = useCallback((s: Omit<Shipment, 'id' | 'createdAt'>) => {
    const item: Shipment = { ...s, id: uid(), createdAt: new Date().toISOString() };
    const entry: ActivityEntry = { id: uid(), action: `Created shipment ${s.shipmentNumber}`, entityType: 'shipment', entityId: item.id, entityName: s.shipmentNumber, user: CURRENT_USER, timestamp: new Date().toISOString(), actionType: 'added' };
    mutate(['shipments', 'activity'], d => ({ ...d, shipments: [...d.shipments, item], activity: [entry, ...d.activity].slice(0, 200) }));
  }, [mutate]);
  const updateShipment = useCallback((id: string, u: Partial<Shipment>) => {
    mutate(['shipments'], d => ({ ...d, shipments: d.shipments.map(s => s.id === id ? { ...s, ...u } : s) }));
  }, [mutate]);
  const deleteShipment = useCallback((id: string) => {
    mutate(['shipments'], d => ({ ...d, shipments: d.shipments.filter(s => s.id !== id) }));
  }, [mutate]);

  // ── Purchase Orders
  const addPurchaseOrder = useCallback((p: Omit<PurchaseOrder, 'id' | 'createdAt'>) => {
    const item: PurchaseOrder = { ...p, id: uid(), createdAt: new Date().toISOString() };
    const entry: ActivityEntry = { id: uid(), action: `Created PO ${p.poNumber}`, entityType: 'purchase-order', entityId: item.id, entityName: p.poNumber, user: CURRENT_USER, timestamp: new Date().toISOString(), actionType: 'added' };
    mutate(['purchaseOrders', 'activity'], d => ({ ...d, purchaseOrders: [...d.purchaseOrders, item], activity: [entry, ...d.activity].slice(0, 200) }));
  }, [mutate]);
  const updatePurchaseOrder = useCallback((id: string, u: Partial<PurchaseOrder>) => {
    mutate(['purchaseOrders'], d => ({ ...d, purchaseOrders: d.purchaseOrders.map(p => p.id === id ? { ...p, ...u } : p) }));
  }, [mutate]);
  const deletePurchaseOrder = useCallback((id: string) => {
    mutate(['purchaseOrders'], d => ({ ...d, purchaseOrders: d.purchaseOrders.filter(p => p.id !== id) }));
  }, [mutate]);

  // ── Vault
  const addVaultEntry = useCallback((v: Omit<VaultEntry, 'id' | 'createdAt'>) => {
    const item: VaultEntry = { ...v, id: uid(), createdAt: new Date().toISOString() };
    mutate(['vault'], d => ({ ...d, vault: [...d.vault, item] }));
  }, [mutate]);
  const updateVaultEntry = useCallback((id: string, u: Partial<VaultEntry>) => {
    mutate(['vault'], d => ({ ...d, vault: d.vault.map(v => v.id === id ? { ...v, ...u, lastUpdated: new Date().toISOString() } : v) }));
  }, [mutate]);
  const deleteVaultEntry = useCallback((id: string) => {
    mutate(['vault'], d => ({ ...d, vault: d.vault.filter(v => v.id !== id) }));
  }, [mutate]);

  // ── Documents
  const addDocument = useCallback((doc: Omit<GPDocument, 'id'>) => {
    const item: GPDocument = { ...doc, id: uid() };
    mutate(['documents'], d => ({ ...d, documents: [...d.documents, item] }));
  }, [mutate]);
  const deleteDocument = useCallback((id: string) => {
    mutate(['documents'], d => ({ ...d, documents: d.documents.filter(x => x.id !== id) }));
  }, [mutate]);

  // ── Warehouses
  const addWarehouse = useCallback((w: Omit<Warehouse, 'id'>) => {
    mutate(['warehouses'], d => ({ ...d, warehouses: [...d.warehouses, { ...w, id: uid() }] }));
  }, [mutate]);
  const updateWarehouse = useCallback((id: string, u: Partial<Warehouse>) => {
    mutate(['warehouses'], d => ({ ...d, warehouses: d.warehouses.map(w => w.id === id ? { ...w, ...u } : w) }));
  }, [mutate]);
  const deleteWarehouse = useCallback((id: string) => {
    mutate(['warehouses'], d => ({ ...d, warehouses: d.warehouses.filter(w => w.id !== id) }));
  }, [mutate]);

  // ── Getters
  const getSupplier = useCallback((id: string) => data.suppliers.find(s => s.id === id), [data.suppliers]);
  const getWarehouse = useCallback((id: string) => data.warehouses.find(w => w.id === id), [data.warehouses]);
  const getMotorcycle = useCallback((id: string) => data.motorcycles.find(m => m.id === id), [data.motorcycles]);
  const getShipment = useCallback((id: string) => data.shipments.find(s => s.id === id), [data.shipments]);
  const getPurchaseOrder = useCallback((id: string) => data.purchaseOrders.find(p => p.id === id), [data.purchaseOrders]);

  const searchAll = useCallback((query: string): SearchResult[] => {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    const results: SearchResult[] = [];
    data.motorcycles.forEach(m => {
      if ([m.bikeId, m.vin, m.brand, m.model, m.color, m.notes].join(' ').toLowerCase().includes(q))
        results.push({ type: 'Motorcycle', id: m.id, title: `${m.bikeId} — ${m.brand} ${m.model}`, subtitle: `VIN ${m.vin} · ${m.status}`, page: 'motorcycle-detail' });
    });
    data.parts.forEach(p => {
      if ([p.name, p.partNumber, p.sku, p.notes].join(' ').toLowerCase().includes(q))
        results.push({ type: 'Part', id: p.id, title: p.name, subtitle: `SKU ${p.sku} · Qty ${p.quantity}`, page: 'parts' });
    });
    data.suppliers.forEach(s => {
      if ([s.name, s.contactPerson, s.email, s.country, s.products.join(' ')].join(' ').toLowerCase().includes(q))
        results.push({ type: 'Supplier', id: s.id, title: s.name, subtitle: `${s.country} · ${s.contactPerson}`, page: 'supplier-detail' });
    });
    data.shipments.forEach(s => {
      if ([s.shipmentNumber, s.trackingNumber ?? '', s.carrier, s.origin, s.destination].join(' ').toLowerCase().includes(q))
        results.push({ type: 'Shipment', id: s.id, title: s.shipmentNumber, subtitle: `${s.carrier} · ${s.status}`, page: 'shipment-detail' });
    });
    data.purchaseOrders.forEach(p => {
      if ([p.poNumber, p.notes].join(' ').toLowerCase().includes(q))
        results.push({ type: 'Purchase Order', id: p.id, title: p.poNumber, subtitle: `${p.status} · ${p.paymentStatus}`, page: 'po-detail' });
    });
    data.documents.forEach(doc => {
      if ([doc.name, doc.type, doc.notes].join(' ').toLowerCase().includes(q))
        results.push({ type: 'Document', id: doc.id, title: doc.name, subtitle: doc.type.replace(/-/g, ' '), page: 'documents' });
    });
    return results.slice(0, 50);
  }, [data]);

  const exportData = useCallback(() => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `gpbikes-backup-${new Date().toISOString().split('T')[0]}.json`; a.click();
    URL.revokeObjectURL(url);
  }, [data]);

  const resetData = useCallback(() => {
    if (onlineRef.current) {
      resetServerData().then(fresh => setData(fresh)).catch(() => setData(seedData));
    } else {
      localStorage.removeItem(STORAGE_KEY);
      setData(seedData);
    }
  }, []);

  return (
    <AppContext.Provider value={{
      data, loading, online, currentPage, selectedId, theme, setPage, toggleTheme, logActivity,
      addMotorcycle, updateMotorcycle, deleteMotorcycle,
      addPart, updatePart, deletePart,
      addSupplier, updateSupplier, deleteSupplier,
      addShipment, updateShipment, deleteShipment,
      addPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder,
      addVaultEntry, updateVaultEntry, deleteVaultEntry,
      addDocument, deleteDocument,
      addWarehouse, updateWarehouse, deleteWarehouse,
      getSupplier, getWarehouse, getMotorcycle, getShipment, getPurchaseOrder,
      searchAll, exportData, resetData,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
