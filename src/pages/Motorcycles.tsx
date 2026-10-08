import React, { useState } from 'react';
import { Plus, Search, Bike, Trash2, Edit2, ChevronRight, LayoutGrid, List } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Motorcycle, BikeStatus } from '../types';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusBadge from '../components/StatusBadge';

const BIKE_STATUSES: BikeStatus[] = ['ordered','manufacturing','shipped','in-transit','customs','delivered','warehouse','ready-for-sale','reserved','sold','warranty','service'];

const emptyForm: Omit<Motorcycle, 'id' | 'createdAt' | 'updatedAt'> = {
  bikeId: '', vin: '', brand: '', model: '', year: new Date().getFullYear(), color: '',
  condition: 'new', purchasePrice: 0, currentValue: 0, salePrice: 0, supplierId: '',
  purchaseDate: new Date().toISOString().split('T')[0], arrivalDate: '', warehouseId: '',
  warehouseLocation: '', status: 'ordered', mileage: 0, batteryInfo: '', controllerInfo: '',
  modifications: '', photos: [], documents: [], notes: '',
};

export default function Motorcycles() {
  const { data, addMotorcycle, updateMotorcycle, deleteMotorcycle, getSupplier, setPage } = useApp();
  const [search, setSearch] = useState('');
  const [filterBrand, setFilterBrand] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Motorcycle | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Motorcycle | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const brands = Array.from(new Set(data.motorcycles.map(m => m.brand)));

  const filtered = data.motorcycles.filter(m => {
    const matchSearch = [m.bikeId, m.vin, m.brand, m.model, m.color].join(' ').toLowerCase().includes(search.toLowerCase());
    const matchBrand = filterBrand === 'all' || m.brand === filterBrand;
    const matchStatus = filterStatus === 'all' || m.status === filterStatus;
    return matchSearch && matchBrand && matchStatus;
  });

  const openAdd = () => { setEditTarget(null); setForm({ ...emptyForm }); setModalOpen(true); };
  const openEdit = (m: Motorcycle) => {
    setEditTarget(m);
    setForm({ ...m, arrivalDate: m.arrivalDate?.split('T')[0] ?? '', purchaseDate: m.purchaseDate.split('T')[0] });
    setModalOpen(true);
  };
  const save = () => {
    if (!form.bikeId.trim()) return;
    const payload = { ...form, arrivalDate: form.arrivalDate || undefined };
    if (editTarget) updateMotorcycle(editTarget.id, payload);
    else addMotorcycle(payload);
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
            <h1 className="text-2xl font-black text-white">Motorcycles</h1>
          </div>
          <p className="text-gray-500 text-sm ml-4">{data.motorcycles.length} bikes · {data.motorcycles.filter(m => m.status === 'ready-for-sale').length} ready for sale</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-900 border border-gray-800 rounded-lg p-0.5">
            <button onClick={() => setView('table')} className={`p-1.5 rounded ${view === 'table' ? 'bg-gray-700 text-white' : 'text-gray-500'}`}><List size={15}/></button>
            <button onClick={() => setView('grid')} className={`p-1.5 rounded ${view === 'grid' ? 'bg-gray-700 text-white' : 'text-gray-500'}`}><LayoutGrid size={15}/></button>
          </div>
          <button onClick={openAdd} className="btn-primary"><Plus size={16}/> Add Bike</button>
        </div>
      </div>

      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input className="input pl-9" placeholder="Search bike ID, VIN, model..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-40" value={filterBrand} onChange={e => setFilterBrand(e.target.value)}>
          <option value="all">All Brands</option>
          {brands.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <select className="input w-44" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          {BIKE_STATUSES.map(s => <option key={s} value={s}>{s.replace(/-/g, ' ')}</option>)}
        </select>
      </div>

      {view === 'table' ? (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left">
                <th className="data-label px-4 py-3">Bike ID</th>
                <th className="data-label px-4 py-3">Brand / Model</th>
                <th className="data-label px-4 py-3">Year</th>
                <th className="data-label px-4 py-3">Color</th>
                <th className="data-label px-4 py-3">Status</th>
                <th className="data-label px-4 py-3">Location</th>
                <th className="data-label px-4 py-3">Sale Price</th>
                <th className="data-label px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {filtered.map(m => (
                <tr key={m.id} className="hover:bg-gray-800/30 transition-colors group cursor-pointer" onClick={() => setPage('motorcycle-detail', m.id)}>
                  <td className="px-4 py-3 font-mono font-semibold text-white">{m.bikeId}</td>
                  <td className="px-4 py-3"><span className="text-gray-200">{m.brand}</span> <span className="text-gray-500">{m.model}</span></td>
                  <td className="px-4 py-3 text-gray-400">{m.year}</td>
                  <td className="px-4 py-3 text-gray-400">{m.color}</td>
                  <td className="px-4 py-3"><StatusBadge status={m.status} /></td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{m.warehouseLocation || '—'}</td>
                  <td className="px-4 py-3 text-white font-medium">${m.salePrice.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                      <button onClick={() => setPage('motorcycle-detail', m.id)} className="p-1.5 rounded text-gray-500 hover:text-white hover:bg-gray-700"><ChevronRight size={14}/></button>
                      <button onClick={() => openEdit(m)} className="p-1.5 rounded text-gray-500 hover:text-white hover:bg-gray-700"><Edit2 size={14}/></button>
                      <button onClick={() => setDeleteTarget(m)} className="p-1.5 rounded text-gray-500 hover:text-red-400 hover:bg-gray-700"><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-16 text-gray-600"><Bike size={36} className="mx-auto mb-3 opacity-30"/><p>No motorcycles found.</p></div>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(m => (
            <div key={m.id} onClick={() => setPage('motorcycle-detail', m.id)} className="card-tech card cursor-pointer">
              <div className="aspect-video bg-gray-800 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                {m.photos[0] ? <img src={m.photos[0]} alt={m.bikeId} className="w-full h-full object-cover" /> : <Bike size={32} className="text-gray-700" />}
              </div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono font-bold text-white text-sm">{m.bikeId}</span>
                <StatusBadge status={m.status} />
              </div>
              <p className="text-sm text-gray-300">{m.brand} {m.model}</p>
              <p className="text-xs text-gray-600">{m.year} · {m.color}</p>
              <p className="text-white font-bold text-sm mt-2">${m.salePrice.toLocaleString()}</p>
            </div>
          ))}
          {filtered.length === 0 && <div className="col-span-full text-center py-16 text-gray-600"><Bike size={36} className="mx-auto mb-3 opacity-30"/><p>No motorcycles found.</p></div>}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? `Edit ${editTarget.bikeId}` : 'Add Motorcycle'} size="xl">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div><label className="label">Bike ID</label><input className="input font-mono" value={form.bikeId} onChange={str('bikeId')} placeholder="UB-001" /></div>
            <div className="col-span-2"><label className="label">VIN / Serial</label><input className="input font-mono" value={form.vin} onChange={str('vin')} /></div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div><label className="label">Brand</label><input className="input" value={form.brand} onChange={str('brand')} /></div>
            <div><label className="label">Model</label><input className="input" value={form.model} onChange={str('model')} /></div>
            <div><label className="label">Year</label><input className="input" type="number" value={form.year} onChange={num('year')} /></div>
            <div><label className="label">Color</label><input className="input" value={form.color} onChange={str('color')} /></div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="label">Condition</label>
              <select className="input" value={form.condition} onChange={str('condition')}>
                <option value="new">New</option><option value="used">Used</option><option value="demo">Demo</option><option value="damaged">Damaged</option>
              </select>
            </div>
            <div><label className="label">Mileage</label><input className="input" type="number" value={form.mileage} onChange={num('mileage')} /></div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={str('status')}>
                {BIKE_STATUSES.map(s => <option key={s} value={s}>{s.replace(/-/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Supplier</label>
              <select className="input" value={form.supplierId} onChange={str('supplierId')}>
                <option value="">—</option>
                {data.suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="label">Purchase Price</label><input className="input" type="number" value={form.purchasePrice} onChange={num('purchasePrice')} /></div>
            <div><label className="label">Current Value</label><input className="input" type="number" value={form.currentValue} onChange={num('currentValue')} /></div>
            <div><label className="label">Sale Price</label><input className="input" type="number" value={form.salePrice} onChange={num('salePrice')} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Purchase Date</label><input className="input" type="date" value={form.purchaseDate} onChange={str('purchaseDate')} /></div>
            <div><label className="label">Arrival Date</label><input className="input" type="date" value={form.arrivalDate} onChange={str('arrivalDate')} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Warehouse</label>
              <select className="input" value={form.warehouseId} onChange={str('warehouseId')}>
                <option value="">—</option>
                {data.warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div><label className="label">Location</label><input className="input" value={form.warehouseLocation} onChange={str('warehouseLocation')} placeholder="Row 2 / Position 6" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Battery Info</label><input className="input" value={form.batteryInfo} onChange={str('batteryInfo')} /></div>
            <div><label className="label">Controller Info</label><input className="input" value={form.controllerInfo} onChange={str('controllerInfo')} /></div>
          </div>
          <div><label className="label">Modifications</label><input className="input" value={form.modifications} onChange={str('modifications')} /></div>
          <div><label className="label">Notes</label><textarea className="input resize-none" rows={2} value={form.notes} onChange={str('notes')} /></div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={save} className="btn-primary">{editTarget ? 'Save Changes' : 'Add Motorcycle'}</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteTarget && deleteMotorcycle(deleteTarget.id)} title="Delete Motorcycle" message={`Delete ${deleteTarget?.bikeId}? This cannot be undone.`} />
    </div>
  );
}
