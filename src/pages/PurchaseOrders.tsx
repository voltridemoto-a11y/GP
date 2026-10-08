import React, { useState } from 'react';
import { Plus, Search, ShoppingCart, Trash2, Edit2, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PurchaseOrder, POStatus, PaymentStatus, POItem } from '../types';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusBadge from '../components/StatusBadge';

const PO_STATUSES: POStatus[] = ['draft','sent','confirmed','in-production','shipped','delivered','cancelled'];
const PAY_STATUSES: PaymentStatus[] = ['unpaid','deposit-paid','partial','paid','overdue'];
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

const emptyForm: Omit<PurchaseOrder, 'id' | 'createdAt'> = {
  poNumber: '', supplierId: '', items: [], shippingCost: 0, taxesFees: 0, deposit: 0,
  paymentStatus: 'unpaid', expectedDelivery: new Date().toISOString().split('T')[0], notes: '', status: 'draft',
};

export default function PurchaseOrders() {
  const { data, addPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder, getSupplier, setPage } = useApp();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<PurchaseOrder | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PurchaseOrder | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const itemsTotal = (po: Pick<PurchaseOrder, 'items' | 'shippingCost' | 'taxesFees'>) =>
    po.items.reduce((n, i) => n + i.quantity * i.unitCost, 0) + po.shippingCost + po.taxesFees;

  const filtered = data.purchaseOrders.filter(p => {
    const matchSearch = [p.poNumber, getSupplier(p.supplierId)?.name ?? ''].join(' ').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const openAdd = () => {
    setEditTarget(null);
    setForm({ ...emptyForm, poNumber: `GPB-PO-${new Date().getFullYear()}-${String(data.purchaseOrders.length + 41).padStart(4, '0')}`, items: [{ id: uid(), productName: '', sku: '', quantity: 1, unitCost: 0 }] });
    setModalOpen(true);
  };
  const openEdit = (p: PurchaseOrder) => { setEditTarget(p); setForm({ ...p, expectedDelivery: p.expectedDelivery.split('T')[0] }); setModalOpen(true); };
  const save = () => {
    if (!form.poNumber.trim()) return;
    if (editTarget) updatePurchaseOrder(editTarget.id, form);
    else addPurchaseOrder(form);
    setModalOpen(false);
  };
  const str = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [field]: e.target.value }));
  const num = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [field]: Number(e.target.value) }));
  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { id: uid(), productName: '', sku: '', quantity: 1, unitCost: 0 }] }));
  const updItem = (id: string, field: keyof Omit<POItem, 'id'>, val: string | number) => setForm(f => ({ ...f, items: f.items.map(i => i.id === id ? { ...i, [field]: val } : i) }));
  const rmItem = (id: string) => setForm(f => ({ ...f, items: f.items.filter(i => i.id !== id) }));

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-0.5">
            <div className="w-1.5 h-6 bg-red-500 rounded-full" />
            <h1 className="text-2xl font-black text-white">Purchase Orders</h1>
          </div>
          <p className="text-gray-500 text-sm ml-4">{data.purchaseOrders.length} POs</p>
        </div>
        <button onClick={openAdd} className="btn-primary"><Plus size={16}/> New PO</button>
      </div>

      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input className="input pl-9" placeholder="Search PO # or supplier..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-44" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          {PO_STATUSES.map(s => <option key={s} value={s}>{s.replace(/-/g, ' ')}</option>)}
        </select>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left">
              <th className="data-label px-4 py-3">PO Number</th>
              <th className="data-label px-4 py-3">Supplier</th>
              <th className="data-label px-4 py-3">Items</th>
              <th className="data-label px-4 py-3">Status</th>
              <th className="data-label px-4 py-3">Payment</th>
              <th className="data-label px-4 py-3">Expected</th>
              <th className="data-label px-4 py-3 text-right">Total</th>
              <th className="data-label px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {filtered.map(p => (
              <tr key={p.id} className="hover:bg-gray-800/30 transition-colors group cursor-pointer" onClick={() => setPage('po-detail', p.id)}>
                <td className="px-4 py-3 font-mono font-semibold text-white">{p.poNumber}</td>
                <td className="px-4 py-3 text-gray-300">{getSupplier(p.supplierId)?.name ?? '—'}</td>
                <td className="px-4 py-3 text-gray-500">{p.items.length}</td>
                <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                <td className="px-4 py-3"><StatusBadge status={p.paymentStatus} /></td>
                <td className="px-4 py-3 text-gray-400 text-xs">{new Date(p.expectedDelivery).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right text-white font-medium">${itemsTotal(p).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                    <button onClick={() => openEdit(p)} className="p-1.5 rounded text-gray-500 hover:text-white hover:bg-gray-700"><Edit2 size={13}/></button>
                    <button onClick={() => setDeleteTarget(p)} className="p-1.5 rounded text-gray-500 hover:text-red-400 hover:bg-gray-700"><Trash2 size={13}/></button>
                    <ChevronRight size={14} className="text-gray-600" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-16 text-gray-600"><ShoppingCart size={36} className="mx-auto mb-3 opacity-30"/><p>No purchase orders found.</p></div>}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Edit PO' : 'New Purchase Order'} size="xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">PO Number</label><input className="input font-mono" value={form.poNumber} onChange={str('poNumber')} /></div>
            <div>
              <label className="label">Supplier</label>
              <select className="input" value={form.supplierId} onChange={str('supplierId')}>
                <option value="">—</option>{data.suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={str('status')}>
                {PO_STATUSES.map(s => <option key={s} value={s}>{s.replace(/-/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Payment</label>
              <select className="input" value={form.paymentStatus} onChange={str('paymentStatus')}>
                {PAY_STATUSES.map(s => <option key={s} value={s}>{s.replace(/-/g, ' ')}</option>)}
              </select>
            </div>
            <div><label className="label">Expected</label><input className="input" type="date" value={form.expectedDelivery} onChange={str('expectedDelivery')} /></div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2"><label className="label mb-0">Line Items</label><button onClick={addItem} className="text-xs text-red-400 flex items-center gap-1"><Plus size={12}/>Add</button></div>
            <div className="space-y-2">
              {form.items.map(item => (
                <div key={item.id} className="grid grid-cols-5 gap-2">
                  <input className="input text-xs col-span-2" placeholder="Product" value={item.productName} onChange={e => updItem(item.id, 'productName', e.target.value)} />
                  <input className="input text-xs" placeholder="SKU" value={item.sku} onChange={e => updItem(item.id, 'sku', e.target.value)} />
                  <input className="input text-xs" type="number" placeholder="Qty" value={item.quantity} onChange={e => updItem(item.id, 'quantity', Number(e.target.value))} />
                  <div className="flex gap-1">
                    <input className="input text-xs flex-1" type="number" placeholder="Cost" value={item.unitCost} onChange={e => updItem(item.id, 'unitCost', Number(e.target.value))} />
                    <button onClick={() => rmItem(item.id)} className="text-gray-600 hover:text-red-400 px-1"><Trash2 size={12}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="label">Shipping Cost</label><input className="input" type="number" value={form.shippingCost} onChange={num('shippingCost')} /></div>
            <div><label className="label">Taxes/Fees</label><input className="input" type="number" value={form.taxesFees} onChange={num('taxesFees')} /></div>
            <div><label className="label">Deposit Paid</label><input className="input" type="number" value={form.deposit} onChange={num('deposit')} /></div>
          </div>
          <p className="text-right text-sm font-bold text-white">Total: ${itemsTotal(form).toLocaleString()}</p>
          <div><label className="label">Notes</label><textarea className="input resize-none" rows={2} value={form.notes} onChange={str('notes')} /></div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={save} className="btn-primary">{editTarget ? 'Save Changes' : 'Create PO'}</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteTarget && deletePurchaseOrder(deleteTarget.id)} title="Delete PO" message={`Delete ${deleteTarget?.poNumber}?`} />
    </div>
  );
}
