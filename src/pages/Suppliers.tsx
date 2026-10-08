import React, { useState } from 'react';
import { Plus, Search, Building2, Trash2, Edit2, Mail, Phone, Globe } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Supplier } from '../types';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusBadge from '../components/StatusBadge';

const emptyForm: Omit<Supplier, 'id' | 'createdAt'> = {
  name: '', contactPerson: '', email: '', phone: '', website: '', country: '', countryCode: '🌐',
  address: '', products: [], moq: 1, shippingMethod: '', leadTimeDays: 0, paymentTerms: '',
  notes: '', status: 'active',
};

export default function Suppliers() {
  const { data, addSupplier, updateSupplier, deleteSupplier, setPage } = useApp();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Supplier | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null);
  const [form, setForm] = useState({ ...emptyForm, productsText: '' });

  const filtered = data.suppliers.filter(s =>
    [s.name, s.contactPerson, s.email, s.country, s.products.join(' ')].join(' ').toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditTarget(null); setForm({ ...emptyForm, productsText: '' }); setModalOpen(true); };
  const openEdit = (s: Supplier) => { setEditTarget(s); setForm({ ...s, productsText: s.products.join(', ') }); setModalOpen(true); };
  const save = () => {
    if (!form.name.trim()) return;
    const { productsText, ...rest } = form;
    const payload = { ...rest, products: productsText.split(',').map(p => p.trim()).filter(Boolean) };
    if (editTarget) updateSupplier(editTarget.id, payload);
    else addSupplier(payload);
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
            <h1 className="text-2xl font-black text-white">Suppliers</h1>
          </div>
          <p className="text-gray-500 text-sm ml-4">{data.suppliers.length} suppliers</p>
        </div>
        <button onClick={openAdd} className="btn-primary"><Plus size={16}/> Add Supplier</button>
      </div>

      <div className="relative mb-5">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input className="input pl-9" placeholder="Search suppliers..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(s => {
          const poCount = data.purchaseOrders.filter(p => p.supplierId === s.id).length;
          return (
            <div key={s.id} className="card-tech card group">
              <div className="flex items-start justify-between mb-3">
                <button onClick={() => setPage('supplier-detail', s.id)} className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-xl bg-red-600/15 border border-red-600/30 flex items-center justify-center text-lg">{s.countryCode}</div>
                  <div>
                    <p className="font-bold text-white text-sm">{s.name}</p>
                    <p className="text-xs text-gray-500">{s.country}</p>
                  </div>
                </button>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(s)} className="p-1.5 rounded text-gray-500 hover:text-white hover:bg-gray-700"><Edit2 size={13}/></button>
                  <button onClick={() => setDeleteTarget(s)} className="p-1.5 rounded text-gray-500 hover:text-red-400 hover:bg-gray-700"><Trash2 size={13}/></button>
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-gray-400 mb-3">
                <div className="flex items-center gap-2"><Mail size={12} className="text-gray-600"/>{s.email}</div>
                <div className="flex items-center gap-2"><Phone size={12} className="text-gray-600"/>{s.phone}</div>
                {s.website && <div className="flex items-center gap-2"><Globe size={12} className="text-gray-600"/><a href={s.website} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline">{s.website.replace('https://', '')}</a></div>}
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                {s.products.slice(0, 3).map(p => <span key={p} className="badge bg-gray-800 text-gray-400">{p}</span>)}
                {s.products.length > 3 && <span className="badge bg-gray-800 text-gray-500">+{s.products.length - 3}</span>}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                <StatusBadge status={s.status} />
                <span className="text-xs text-gray-600">{poCount} orders · {s.leadTimeDays}d lead</span>
              </div>
            </div>
          );
        })}
      </div>
      {filtered.length === 0 && <div className="text-center py-16 text-gray-600"><Building2 size={36} className="mx-auto mb-3 opacity-30"/><p>No suppliers found.</p></div>}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Edit Supplier' : 'Add Supplier'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2"><label className="label">Company Name</label><input className="input" value={form.name} onChange={str('name')} /></div>
            <div><label className="label">Flag Emoji</label><input className="input" value={form.countryCode} onChange={str('countryCode')} placeholder="🇨🇳" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Contact Person</label><input className="input" value={form.contactPerson} onChange={str('contactPerson')} /></div>
            <div><label className="label">Country</label><input className="input" value={form.country} onChange={str('country')} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Email</label><input className="input" value={form.email} onChange={str('email')} /></div>
            <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={str('phone')} /></div>
          </div>
          <div><label className="label">Website</label><input className="input" value={form.website} onChange={str('website')} /></div>
          <div><label className="label">Address</label><input className="input" value={form.address} onChange={str('address')} /></div>
          <div><label className="label">Products (comma separated)</label><input className="input" value={form.productsText} onChange={str('productsText')} /></div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="label">MOQ</label><input className="input" type="number" value={form.moq} onChange={num('moq')} /></div>
            <div><label className="label">Lead Time (days)</label><input className="input" type="number" value={form.leadTimeDays} onChange={num('leadTimeDays')} /></div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={str('status')}>
                <option value="active">Active</option><option value="inactive">Inactive</option><option value="pending">Pending</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Shipping Method</label><input className="input" value={form.shippingMethod} onChange={str('shippingMethod')} /></div>
            <div><label className="label">Payment Terms</label><input className="input" value={form.paymentTerms} onChange={str('paymentTerms')} /></div>
          </div>
          <div><label className="label">Notes</label><textarea className="input resize-none" rows={2} value={form.notes} onChange={str('notes')} /></div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={save} className="btn-primary">{editTarget ? 'Save Changes' : 'Add Supplier'}</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteTarget && deleteSupplier(deleteTarget.id)} title="Delete Supplier" message={`Delete "${deleteTarget?.name}"?`} />
    </div>
  );
}
