import React, { useState } from 'react';
import { Plus, Trash2, Download, RotateCcw, Warehouse as WarehouseIcon, Users, Building } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ConfirmDialog from '../components/ConfirmDialog';

const ROLES = [
  { name: 'Admin', desc: 'Full access to everything including vault and financials', color: 'text-red-400' },
  { name: 'Manager', desc: 'Inventory, suppliers, orders, shipments, analytics', color: 'text-blue-400' },
  { name: 'Warehouse', desc: 'Inventory and warehouse locations. No financials or vault', color: 'text-orange-400' },
  { name: 'Sales', desc: 'Products, availability, reservations, customers', color: 'text-green-400' },
  { name: 'Read Only', desc: 'View everything, cannot modify', color: 'text-gray-400' },
];

export default function Settings() {
  const { data, addWarehouse, deleteWarehouse, exportData, resetData } = useApp();
  const [company, setCompany] = useState({ name: 'GP Bikes Inc.', address: '1200 Industrial Blvd, Your City', phone: '(555) 123-4567', email: 'ops@gpbikes.com' });
  const [resetOpen, setResetOpen] = useState(false);
  const [newWh, setNewWh] = useState({ name: '', address: '', rows: 4, cols: 6 });

  const addWh = () => {
    if (!newWh.name.trim()) return;
    addWarehouse({ ...newWh });
    setNewWh({ name: '', address: '', rows: 4, cols: 6 });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1.5 h-6 bg-red-500 rounded-full" />
        <h1 className="text-2xl font-black text-white">Settings</h1>
      </div>

      <div className="space-y-6">
        {/* Company Info */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4"><Building size={16} className="text-gray-400"/><h3 className="font-semibold text-white text-sm">Company Information</h3></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Company Name</label><input className="input" value={company.name} onChange={e => setCompany(c => ({ ...c, name: e.target.value }))} /></div>
            <div><label className="label">Phone</label><input className="input" value={company.phone} onChange={e => setCompany(c => ({ ...c, phone: e.target.value }))} /></div>
            <div><label className="label">Email</label><input className="input" value={company.email} onChange={e => setCompany(c => ({ ...c, email: e.target.value }))} /></div>
            <div><label className="label">Address</label><input className="input" value={company.address} onChange={e => setCompany(c => ({ ...c, address: e.target.value }))} /></div>
          </div>
        </div>

        {/* Warehouses */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4"><WarehouseIcon size={16} className="text-gray-400"/><h3 className="font-semibold text-white text-sm">Warehouses</h3></div>
          <div className="space-y-2 mb-4">
            {data.warehouses.map(w => (
              <div key={w.id} className="flex items-center justify-between bg-gray-800/40 rounded-lg px-3 py-2.5 group">
                <div>
                  <p className="text-sm text-white font-medium">{w.name}</p>
                  <p className="text-xs text-gray-500">{w.address} · {w.rows}×{w.cols} grid</p>
                </div>
                <button onClick={() => deleteWarehouse(w.id)} className="p-1.5 rounded text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100"><Trash2 size={13}/></button>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-5 gap-2 items-end border-t border-gray-800 pt-4">
            <div className="col-span-2"><label className="label">Name</label><input className="input text-xs" value={newWh.name} onChange={e => setNewWh(w => ({ ...w, name: e.target.value }))} placeholder="Warehouse C" /></div>
            <div><label className="label">Rows</label><input className="input text-xs" type="number" value={newWh.rows} onChange={e => setNewWh(w => ({ ...w, rows: Number(e.target.value) }))} /></div>
            <div><label className="label">Cols</label><input className="input text-xs" type="number" value={newWh.cols} onChange={e => setNewWh(w => ({ ...w, cols: Number(e.target.value) }))} /></div>
            <button onClick={addWh} className="btn-primary justify-center"><Plus size={14}/></button>
          </div>
        </div>

        {/* Roles */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4"><Users size={16} className="text-gray-400"/><h3 className="font-semibold text-white text-sm">User Roles</h3></div>
          <p className="text-xs text-gray-600 mb-3">Role-based permissions activate when the multi-user backend is connected.</p>
          <div className="space-y-2">
            {ROLES.map(r => (
              <div key={r.name} className="flex items-start gap-3 bg-gray-800/40 rounded-lg px-3 py-2.5">
                <span className={`text-sm font-bold w-24 shrink-0 ${r.color}`}>{r.name}</span>
                <span className="text-xs text-gray-400">{r.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Data */}
        <div className="card">
          <h3 className="font-semibold text-white text-sm mb-4">Data Management</h3>
          <div className="flex gap-3">
            <button onClick={exportData} className="btn-secondary"><Download size={15}/> Export Backup (JSON)</button>
            <button onClick={() => setResetOpen(true)} className="btn-danger"><RotateCcw size={15}/> Reset to Sample Data</button>
          </div>
          <p className="text-xs text-gray-600 mt-3">Export downloads all your data as a JSON file you can keep as a backup.</p>
        </div>
      </div>

      <ConfirmDialog open={resetOpen} onClose={() => setResetOpen(false)} onConfirm={resetData} title="Reset All Data" message="This replaces ALL current data with the original sample data. Export a backup first if you want to keep your changes." />
    </div>
  );
}
