import React, { useState } from 'react';
import { Plus, Search, Package, Trash2, Edit2, AlertTriangle, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Part } from '../types';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

const emptyForm: Omit<Part, 'id' | 'createdAt'> = {
  name: '', partNumber: '', sku: '', supplierId: '', quantity: 0, minimumStock: 0,
  cost: 0, retailPrice: 0, warehouseId: '', location: '', compatibility: [],
  photos: [], supplierLink: '', notes: '',
};

export default function Parts() {
  const { data, addPart, updatePart, deletePart, getSupplier, getWarehouse } = useApp();
  const [search, setSearch] = useState('');
  const [lowOnly, setLowOnly] = useState(false);
  const [filterSupplier, setFilterSupplier] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Part | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Part | null>(null);
  const [form, setForm] = useState({ ...emptyForm, compatibilityText: '' });

  const filtered = data.parts.filter(p => {
    const matchSearch = [p.name, p.partNumber, p.sku, p.notes].join(' ').toLowerCase().includes(search.toLowerCase());
    const matchLow = !lowOnly || p.quantity <= p.minimumStock;
    const matchSup = filterSupplier === 'all' || p.supplierId === filterSupplier;
    return matchSearch && matchLow && matchSup;
  });

  const lowCount = data.parts.filter(p => p.quantity <= p.minimumStock).length;

  const openAdd = () => { setEditTarget(null); setForm({ ...emptyForm, compatibilityText: '' }); setModalOpen(true); };
  const openEdit = (p: Part) => {
    setEditTarget(p);
    setForm({ ...p, compatibilityText: p.compatibility.join(', ') });
    setModalOpen(true);
  };
  const save = () => {
    if (!form.name.trim()) return;
    const { compatibilityText, ...rest } = form;
    const payload = { ...rest, compatibility: compatibilityText.split(',').map(s => s.trim()).filter(Boolean) };
    if (editTarget) updatePart(editTarget.id, payload);
    else addPart(payload);
    setModalOpen(false);
  };
  const num = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [field]: Number(e.target.value) }));
  const str = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [field]: e.target.value }));

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-0.5">
            <div className="w-1.5 h-6 bg-red-500 rounded-full" />
            <h1 className="text-2xl font-black text-white">Parts Inventory</h1>
          </div>
          <p className="text-gray-500 text-sm ml-4">{data.parts.length} SKUs · {lowCount > 0 && <span className="text-yellow-400">{lowCount} low stock</span>}</p>
        </div>
        <button onClick={openAdd} className="btn-primary"><Plus size={16}/> Add Part</button>
      </div>

      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input className="input pl-9" placeholder="Search name, part #, SKU..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-44" value={filterSupplier} onChange={e => setFilterSupplier(e.target.value)}>
          <option value="all">All Suppliers</option>
          {data.suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <button onClick={() => setLowOnly(l => !l)} className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors flex items-center gap-2 ${lowOnly ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/40' : 'bg-gray-900 text-gray-400 border-gray-800'}`}>
          <AlertTriangle size={14}/> Low Stock
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left">
              <th className="data-label px-4 py-3">Part</th>
              <th className="data-label px-4 py-3">SKU</th>
              <th className="data-label px-4 py-3">Supplier</th>
              <th className="data-label px-4 py-3">Location</th>
              <th className="data-label px-4 py-3 text-right">Qty</th>
              <th className="data-label px-4 py-3 text-right">Cost</th>
              <th className="data-label px-4 py-3 text-right">Retail</th>
              <th className="data-label px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {filtered.map(p => {
              const low = p.quantity <= p.minimumStock;
              return (
                <tr key={p.id} className="hover:bg-gray-800/30 transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{p.name}</span>
                      {low && <span className={`badge ${p.quantity === 0 ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{p.quantity === 0 ? 'OUT' : 'LOW'}</span>}
                    </div>
                    {p.compatibility.length > 0 && <p className="text-[10px] text-gray-600 mt-0.5">{p.compatibility.join(', ')}</p>}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{p.sku}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{getSupplier(p.supplierId)?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{getWarehouse(p.warehouseId)?.name.split('—')[0].trim() ?? ''} {p.location}</td>
                  <td className="px-4 py-3 text-right"><span className={`font-mono font-semibold ${low ? 'text-yellow-400' : 'text-gray-200'}`}>{p.quantity}</span><span className="text-gray-600 text-xs">/{p.minimumStock}</span></td>
                  <td className="px-4 py-3 text-right text-gray-400">${p.cost}</td>
                  <td className="px-4 py-3 text-right text-white font-medium">${p.retailPrice}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {p.supplierLink && <a href={p.supplierLink} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded text-gray-500 hover:text-red-400 hover:bg-gray-700"><ExternalLink size={13}/></a>}
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded text-gray-500 hover:text-white hover:bg-gray-700"><Edit2 size={13}/></button>
                      <button onClick={() => setDeleteTarget(p)} className="p-1.5 rounded text-gray-500 hover:text-red-400 hover:bg-gray-700"><Trash2 size={13}/></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-16 text-gray-600"><Package size={36} className="mx-auto mb-3 opacity-30"/><p>No parts found.</p></div>}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Edit Part' : 'Add Part'} size="lg">
        <div className="space-y-4">
          <div><label className="label">Part Name</label><input className="input" value={form.name} onChange={str('name')} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Part Number</label><input className="input font-mono" value={form.partNumber} onChange={str('partNumber')} /></div>
            <div><label className="label">SKU</label><input className="input font-mono" value={form.sku} onChange={str('sku')} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Supplier</label>
              <select className="input" value={form.supplierId} onChange={str('supplierId')}>
                <option value="">—</option>{data.suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Warehouse</label>
              <select className="input" value={form.warehouseId} onChange={str('warehouseId')}>
                <option value="">—</option>{data.warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div><label className="label">Quantity</label><input className="input" type="number" value={form.quantity} onChange={num('quantity')} /></div>
            <div><label className="label">Min Stock</label><input className="input" type="number" value={form.minimumStock} onChange={num('minimumStock')} /></div>
            <div><label className="label">Cost</label><input className="input" type="number" value={form.cost} onChange={num('cost')} /></div>
            <div><label className="label">Retail</label><input className="input" type="number" value={form.retailPrice} onChange={num('retailPrice')} /></div>
          </div>
          <div><label className="label">Location</label><input className="input" value={form.location} onChange={str('location')} placeholder="Shelf A4" /></div>
          <div><label className="label">Compatibility (comma separated)</label><input className="input" value={form.compatibilityText} onChange={str('compatibilityText')} placeholder="Surron Ultra Bee, Talaria Sting" /></div>
          <div><label className="label">Supplier Link</label><input className="input" value={form.supplierLink} onChange={str('supplierLink')} /></div>
          <div><label className="label">Notes</label><textarea className="input resize-none" rows={2} value={form.notes} onChange={str('notes')} /></div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={save} className="btn-primary">{editTarget ? 'Save Changes' : 'Add Part'}</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteTarget && deletePart(deleteTarget.id)} title="Delete Part" message={`Delete "${deleteTarget?.name}"?`} />
    </div>
  );
}
