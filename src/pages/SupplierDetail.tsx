import { ArrowLeft, Mail, Phone, Globe, MapPin, Package, Truck, Clock, CheckCircle2, DollarSign } from 'lucide-react';
import { useApp } from '../context/AppContext';
import StatusBadge from '../components/StatusBadge';

export default function SupplierDetail({ id }: { id: string }) {
  const { getSupplier, setPage, data } = useApp();
  const s = getSupplier(id);
  if (!s) return <div className="p-8 text-gray-500">Supplier not found.</div>;

  const pos = data.purchaseOrders.filter(p => p.supplierId === id);
  const shipments = data.shipments.filter(sh => sh.supplierId === id);
  const bikes = data.motorcycles.filter(m => m.supplierId === id);

  const totalSpend = pos.reduce((sum, p) => sum + p.items.reduce((n, i) => n + i.quantity * i.unitCost, 0) + p.shippingCost, 0);
  const delivered = shipments.filter(sh => sh.status === 'delivered');
  const onTime = delivered.filter(sh => sh.actualArrival && new Date(sh.actualArrival) <= new Date(sh.estimatedArrival)).length;
  const onTimePct = delivered.length ? Math.round((onTime / delivered.length) * 100) : 100;
  const delayed = shipments.filter(sh => sh.status === 'delayed').length;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <button onClick={() => setPage('suppliers')} className="flex items-center gap-2 text-gray-500 hover:text-white text-sm mb-5 transition-colors">
        <ArrowLeft size={16} /> Back to Suppliers
      </button>

      <div className="flex items-start gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-red-600/15 border border-red-600/30 flex items-center justify-center text-2xl">{s.countryCode}</div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-white">{s.name}</h1>
            <StatusBadge status={s.status} />
          </div>
          <p className="text-gray-400">{s.country} · {s.contactPerson}</p>
        </div>
      </div>

      {/* Performance metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="card"><div className="flex items-center gap-2 mb-1"><Clock size={14} className="text-blue-400"/><span className="data-label">Lead Time</span></div><p className="text-2xl font-black text-white">{s.leadTimeDays}d</p></div>
        <div className="card"><div className="flex items-center gap-2 mb-1"><CheckCircle2 size={14} className="text-green-400"/><span className="data-label">On-Time</span></div><p className="text-2xl font-black text-white">{onTimePct}%</p></div>
        <div className="card"><div className="flex items-center gap-2 mb-1"><Package size={14} className="text-orange-400"/><span className="data-label">Orders</span></div><p className="text-2xl font-black text-white">{pos.length}</p></div>
        <div className="card"><div className="flex items-center gap-2 mb-1"><DollarSign size={14} className="text-green-400"/><span className="data-label">Total Spend</span></div><p className="text-2xl font-black text-white">${(totalSpend/1000).toFixed(0)}k</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="card">
            <p className="data-label mb-3">Contact</p>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center gap-2"><Mail size={14} className="text-gray-600"/>{s.email}</div>
              <div className="flex items-center gap-2"><Phone size={14} className="text-gray-600"/>{s.phone}</div>
              {s.website && <div className="flex items-center gap-2"><Globe size={14} className="text-gray-600"/><a href={s.website} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline">{s.website.replace('https://','')}</a></div>}
              <div className="flex items-start gap-2"><MapPin size={14} className="text-gray-600 mt-0.5"/>{s.address}</div>
            </div>
          </div>
          <div className="card space-y-2 text-sm">
            <p className="data-label mb-1">Terms</p>
            <div className="flex justify-between"><span className="text-gray-500">MOQ</span><span className="text-gray-200">{s.moq} units</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span className="text-gray-200">{s.shippingMethod}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Payment</span><span className="text-gray-200 text-right">{s.paymentTerms}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Delayed Shipments</span><span className={delayed > 0 ? 'text-red-400' : 'text-gray-200'}>{delayed}</span></div>
          </div>
          <div className="card">
            <p className="data-label mb-2">Products</p>
            <div className="flex flex-wrap gap-1.5">{s.products.map(p => <span key={p} className="badge bg-gray-800 text-gray-300">{p}</span>)}</div>
          </div>
          {s.notes && <div className="card"><p className="data-label mb-2">Notes</p><p className="text-gray-300 text-sm">{s.notes}</p></div>}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex items-center gap-2 mb-4"><Package size={15} className="text-gray-400"/><span className="font-semibold text-white text-sm">Purchase Orders</span><span className="ml-auto badge bg-gray-800 text-gray-400">{pos.length}</span></div>
            {pos.length === 0 ? <p className="text-gray-600 text-sm">No orders.</p> : (
              <div className="space-y-2">
                {pos.map(p => (
                  <button key={p.id} onClick={() => setPage('po-detail', p.id)} className="w-full flex items-center justify-between bg-gray-800/40 rounded-lg px-3 py-2.5 hover:bg-gray-800 transition-colors text-left">
                    <div><p className="font-mono text-sm text-white">{p.poNumber}</p><p className="text-xs text-gray-500">{p.items.length} line items</p></div>
                    <div className="flex items-center gap-2"><StatusBadge status={p.status}/><StatusBadge status={p.paymentStatus}/></div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="card">
            <div className="flex items-center gap-2 mb-4"><Truck size={15} className="text-gray-400"/><span className="font-semibold text-white text-sm">Shipments</span><span className="ml-auto badge bg-gray-800 text-gray-400">{shipments.length}</span></div>
            {shipments.length === 0 ? <p className="text-gray-600 text-sm">No shipments.</p> : (
              <div className="space-y-2">
                {shipments.map(sh => (
                  <button key={sh.id} onClick={() => setPage('shipment-detail', sh.id)} className="w-full flex items-center justify-between bg-gray-800/40 rounded-lg px-3 py-2.5 hover:bg-gray-800 transition-colors text-left">
                    <div><p className="font-mono text-sm text-white">{sh.shipmentNumber}</p><p className="text-xs text-gray-500">{sh.carrier} · ETA {new Date(sh.estimatedArrival).toLocaleDateString()}</p></div>
                    <StatusBadge status={sh.status}/>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="card">
            <div className="flex items-center gap-2 mb-4"><span className="font-semibold text-white text-sm">Bikes Supplied</span><span className="ml-auto badge bg-gray-800 text-gray-400">{bikes.length}</span></div>
            <div className="flex flex-wrap gap-2">
              {bikes.map(b => (
                <button key={b.id} onClick={() => setPage('motorcycle-detail', b.id)} className="badge bg-gray-800 text-gray-300 hover:bg-gray-700 font-mono">{b.bikeId}</button>
              ))}
              {bikes.length === 0 && <p className="text-gray-600 text-sm">None.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
