import React, { useState } from 'react';
import { Plus, Search, Truck, Trash2, Edit2, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Shipment, ShipmentStatus, ShipmentItem } from '../types';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusBadge from '../components/StatusBadge';

const FLOW: ShipmentStatus[] = ['ordered','processing','picked-up','in-transit','customs','out-for-delivery','delivered'];
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

const emptyForm: Omit<Shipment, 'id' | 'createdAt'> = {
  shipmentNumber: '', trackingNumber: '', carrier: '', supplierId: '', purchaseOrderId: '',
  items: [], origin: '', destination: 'GP Bikes Warehouse', shippingMethod: 'sea',
  orderDate: new Date().toISOString().split('T')[0], shipDate: '', estimatedArrival: new Date().toISOString().split('T')[0],
  actualArrival: '', status: 'ordered', documents: [], photos: [], notes: '',
};

function MiniTimeline({ status }: { status: ShipmentStatus }) {
  if (status === 'delayed') {
    return <div className="text-xs text-red-400 font-medium">⚠ Delayed in transit</div>;
  }
  const idx = FLOW.indexOf(status);
  return (
    <div className="flex items-center gap-0.5">
      {FLOW.map((step, i) => (
        <div key={step} className="flex items-center">
          <div className={`w-2 h-2 rounded-full ${i <= idx ? 'bg-red-500' : 'bg-gray-700'}`} title={step} />
          {i < FLOW.length - 1 && <div className={`w-5 h-0.5 ${i < idx ? 'bg-red-500' : 'bg-gray-700'}`} />}
        </div>
      ))}
    </div>
  );
}

export default function Shipments() {
  const { data, addShipment, updateShipment, deleteShipment, getSupplier, setPage } = useApp();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Shipment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Shipment | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const filtered = data.shipments.filter(s => {
    const matchSearch = [s.shipmentNumber, s.trackingNumber ?? '', s.carrier, getSupplier(s.supplierId)?.name ?? ''].join(' ').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const openAdd = () => {
    setEditTarget(null);
    setForm({ ...emptyForm, shipmentNumber: `GP${10290 + data.shipments.length + 10}`, items: [{ id: uid(), productName: '', sku: '', quantity: 1, unitCost: 0 }] });
    setModalOpen(true);
  };
  const openEdit = (s: Shipment) => {
    setEditTarget(s);
    setForm({ ...s, shipDate: s.shipDate?.split('T')[0] ?? '', actualArrival: s.actualArrival?.split('T')[0] ?? '', estimatedArrival: s.estimatedArrival.split('T')[0], orderDate: s.orderDate.split('T')[0] });
    setModalOpen(true);
  };
  const save = () => {
    if (!form.shipmentNumber.trim()) return;
    const payload = { ...form, shipDate: form.shipDate || undefined, actualArrival: form.actualArrival || undefined, trackingNumber: form.trackingNumber || undefined, purchaseOrderId: form.purchaseOrderId || undefined };
    if (editTarget) updateShipment(editTarget.id, payload);
    else addShipment(payload);
    setModalOpen(false);
  };
  const str = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [field]: e.target.value }));
  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { id: uid(), productName: '', sku: '', quantity: 1, unitCost: 0 }] }));
  const updItem = (id: string, field: keyof Omit<ShipmentItem, 'id'>, val: string | number) => setForm(f => ({ ...f, items: f.items.map(i => i.id === id ? { ...i, [field]: val } : i) }));
  const rmItem = (id: string) => setForm(f => ({ ...f, items: f.items.filter(i => i.id !== id) }));

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-0.5">
            <div className="w-1.5 h-6 bg-red-500 rounded-full" />
            <h1 className="text-2xl font-black text-white">Shipments</h1>
          </div>
          <p className="text-gray-500 text-sm ml-4">{data.shipments.length} shipments · {data.shipments.filter(s => s.status === 'delayed').length > 0 && <span className="text-red-400">{data.shipments.filter(s => s.status === 'delayed').length} delayed</span>}</p>
        </div>
        <button onClick={openAdd} className="btn-primary"><Plus size={16}/> New Shipment</button>
      </div>

      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input className="input pl-9" placeholder="Search shipment #, tracking, carrier..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-44" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          {[...FLOW, 'delayed'].map(s => <option key={s} value={s}>{s.replace(/-/g, ' ')}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map(s => {
          const supplier = getSupplier(s.supplierId);
          const totalUnits = s.items.reduce((n, i) => n + i.quantity, 0);
          const delayed = s.status === 'delayed';
          return (
            <div key={s.id} className={`card-tech card cursor-pointer ${delayed ? 'border-red-500/40' : ''}`} onClick={() => setPage('shipment-detail', s.id)}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${delayed ? 'bg-red-600/20' : 'bg-gray-800'}`}>
                  <Truck size={16} className={delayed ? 'text-red-400' : 'text-gray-400'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono font-bold text-white text-sm">{s.shipmentNumber}</span>
                    <StatusBadge status={s.status} />
                    <span className="text-xs text-gray-600">{s.carrier}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{supplier?.countryCode} {supplier?.name} · {totalUnits} units · {s.origin.split(',')[0]} → {s.destination.split(',')[0]}</p>
                </div>
                <div className="hidden md:block"><MiniTimeline status={s.status} /></div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-400">ETA {new Date(s.estimatedArrival).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                  <button onClick={() => openEdit(s)} className="p-1.5 rounded text-gray-500 hover:text-white hover:bg-gray-700"><Edit2 size={13}/></button>
                  <button onClick={() => setDeleteTarget(s)} className="p-1.5 rounded text-gray-500 hover:text-red-400 hover:bg-gray-700"><Trash2 size={13}/></button>
                  <ChevronRight size={14} className="text-gray-600" />
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <div className="text-center py-16 text-gray-600"><Truck size={36} className="mx-auto mb-3 opacity-30"/><p>No shipments found.</p></div>}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Edit Shipment' : 'New Shipment'} size="xl">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div><label className="label">Shipment #</label><input className="input font-mono" value={form.shipmentNumber} onChange={str('shipmentNumber')} /></div>
            <div><label className="label">Tracking #</label><input className="input font-mono" value={form.trackingNumber} onChange={str('trackingNumber')} /></div>
            <div><label className="label">Carrier</label><input className="input" value={form.carrier} onChange={str('carrier')} placeholder="UPS, FedEx, DHL..." /></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Supplier</label>
              <select className="input" value={form.supplierId} onChange={str('supplierId')}>
                <option value="">—</option>{data.suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Method</label>
              <select className="input" value={form.shippingMethod} onChange={str('shippingMethod')}>
                <option value="sea">Sea</option><option value="air">Air</option><option value="ground">Ground</option><option value="express">Express</option>
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={str('status')}>
                {[...FLOW, 'delayed'].map(s => <option key={s} value={s}>{s.replace(/-/g, ' ')}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Origin</label><input className="input" value={form.origin} onChange={str('origin')} /></div>
            <div><label className="label">Destination</label><input className="input" value={form.destination} onChange={str('destination')} /></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="label">Order Date</label><input className="input" type="date" value={form.orderDate} onChange={str('orderDate')} /></div>
            <div><label className="label">Ship Date</label><input className="input" type="date" value={form.shipDate} onChange={str('shipDate')} /></div>
            <div><label className="label">Est. Arrival</label><input className="input" type="date" value={form.estimatedArrival} onChange={str('estimatedArrival')} /></div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2"><label className="label mb-0">Items</label><button onClick={addItem} className="text-xs text-red-400 flex items-center gap-1"><Plus size={12}/>Add</button></div>
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
          <div><label className="label">Notes</label><textarea className="input resize-none" rows={2} value={form.notes} onChange={str('notes')} /></div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={save} className="btn-primary">{editTarget ? 'Save Changes' : 'Create Shipment'}</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteTarget && deleteShipment(deleteTarget.id)} title="Delete Shipment" message={`Delete ${deleteTarget?.shipmentNumber}?`} />
    </div>
  );
}
