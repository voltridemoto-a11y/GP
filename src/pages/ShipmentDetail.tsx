import { ArrowLeft, Truck, MapPin, Package, FileText, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ShipmentStatus } from '../types';
import StatusBadge from '../components/StatusBadge';
import TrackingBadge from '../components/TrackingBadge';

const FLOW: { key: ShipmentStatus; label: string }[] = [
  { key: 'ordered', label: 'Ordered' },
  { key: 'processing', label: 'Processing' },
  { key: 'picked-up', label: 'Picked Up' },
  { key: 'in-transit', label: 'In Transit' },
  { key: 'customs', label: 'Customs' },
  { key: 'out-for-delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
];

export default function ShipmentDetail({ id }: { id: string }) {
  const { getShipment, getSupplier, setPage, data } = useApp();
  const s = getShipment(id);
  if (!s) return <div className="p-8 text-gray-500">Shipment not found.</div>;

  const supplier = getSupplier(s.supplierId);
  const po = s.purchaseOrderId ? data.purchaseOrders.find(p => p.id === s.purchaseOrderId) : null;
  const delayed = s.status === 'delayed';
  const currentIdx = delayed ? FLOW.findIndex(f => f.key === 'in-transit') : FLOW.findIndex(f => f.key === s.status);
  const totalValue = s.items.reduce((n, i) => n + i.quantity * i.unitCost, 0);
  const docs = data.documents.filter(d => d.entityType === 'shipment' && d.entityId === id);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <button onClick={() => setPage('shipments')} className="flex items-center gap-2 text-gray-500 hover:text-white text-sm mb-5 transition-colors">
        <ArrowLeft size={16} /> Back to Shipments
      </button>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${delayed ? 'bg-red-600/20 border border-red-600/30' : 'bg-gray-800 border border-gray-700'}`}>
            <Truck size={24} className={delayed ? 'text-red-400' : 'text-gray-300'} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-white font-mono">{s.shipmentNumber}</h1>
              <StatusBadge status={s.status} />
            </div>
            <p className="text-gray-400">{supplier?.countryCode} {supplier?.name} · {s.carrier} · {s.shippingMethod}</p>
          </div>
        </div>
      </div>

      {/* Visual timeline */}
      <div className="card mb-6">
        <p className="data-label mb-6">Shipment Progress</p>
        <div className="flex items-center justify-between relative px-2">
          <div className="absolute top-3 left-6 right-6 h-0.5 bg-gray-800" />
          <div className="absolute top-3 left-6 h-0.5 bg-red-500 transition-all" style={{ width: currentIdx >= 0 ? `calc(${(currentIdx / (FLOW.length - 1)) * 100}% - ${currentIdx === 0 ? 0 : 12}px)` : 0 }} />
          {FLOW.map((step, i) => {
            const done = i <= currentIdx;
            return (
              <div key={step.key} className="relative flex flex-col items-center z-10" style={{ flex: 1 }}>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${done ? 'bg-red-500 border-red-500' : 'bg-gray-900 border-gray-700'}`}>
                  {done && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <span className={`text-[9px] mt-2 text-center ${done ? 'text-gray-200' : 'text-gray-600'}`}>{step.label}</span>
              </div>
            );
          })}
        </div>
        {delayed && (
          <div className="mt-5 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2.5 text-sm text-red-300 flex items-center gap-2">
            ⚠ This shipment is delayed. {s.notes}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Tracking */}
          {s.trackingNumber && (
            <div className="card">
              <p className="data-label mb-3">Live Tracking</p>
              <TrackingBadge trackingNumber={s.trackingNumber} carrier={s.carrier} />
            </div>
          )}

          {/* Items */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4"><Package size={15} className="text-gray-400"/><span className="font-semibold text-white text-sm">Contents</span><span className="ml-auto text-sm text-white font-bold">${totalValue.toLocaleString()}</span></div>
            <table className="w-full text-sm">
              <thead><tr className="text-gray-600 border-b border-gray-800 text-left"><th className="pb-2 font-normal text-xs">Product</th><th className="pb-2 font-normal text-xs">SKU</th><th className="pb-2 font-normal text-xs text-right">Qty</th><th className="pb-2 font-normal text-xs text-right">Cost</th></tr></thead>
              <tbody className="divide-y divide-gray-800/50">
                {s.items.map(i => (
                  <tr key={i.id}><td className="py-2 text-gray-300">{i.productName}</td><td className="py-2 font-mono text-xs text-gray-500">{i.sku}</td><td className="py-2 text-right text-gray-300">{i.quantity}</td><td className="py-2 text-right text-gray-300">${i.unitCost.toLocaleString()}</td></tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Documents */}
          <div className="card">
            <div className="flex items-center gap-2 mb-3"><FileText size={15} className="text-gray-400"/><span className="font-semibold text-white text-sm">Documents</span></div>
            {docs.length === 0 ? <p className="text-gray-600 text-sm">No documents.</p> : (
              <div className="space-y-2">
                {docs.map(d => (
                  <div key={d.id} className="flex items-center justify-between bg-gray-800/50 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2"><FileText size={14} className="text-gray-500"/><span className="text-sm text-gray-300">{d.name}</span></div>
                    <span className="text-xs text-gray-600">{d.fileSize}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center gap-2 mb-4"><MapPin size={15} className="text-gray-400"/><span className="font-semibold text-white text-sm">Route</span></div>
            <div className="space-y-3 text-sm">
              <div><p className="text-xs text-gray-600">Origin</p><p className="text-gray-200">{s.origin}</p></div>
              <div><p className="text-xs text-gray-600">Destination</p><p className="text-gray-200">{s.destination}</p></div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-2 mb-4"><Calendar size={15} className="text-gray-400"/><span className="font-semibold text-white text-sm">Dates</span></div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Ordered</span><span className="text-gray-200">{new Date(s.orderDate).toLocaleDateString()}</span></div>
              {s.shipDate && <div className="flex justify-between"><span className="text-gray-500">Shipped</span><span className="text-gray-200">{new Date(s.shipDate).toLocaleDateString()}</span></div>}
              <div className="flex justify-between"><span className="text-gray-500">Est. Arrival</span><span className="text-gray-200">{new Date(s.estimatedArrival).toLocaleDateString()}</span></div>
              {s.actualArrival && <div className="flex justify-between"><span className="text-gray-500">Delivered</span><span className="text-green-400">{new Date(s.actualArrival).toLocaleDateString()}</span></div>}
            </div>
          </div>
          {po && (
            <div className="card">
              <p className="data-label mb-2">Linked PO</p>
              <button onClick={() => setPage('po-detail', po.id)} className="text-sm text-red-400 hover:underline font-mono">{po.poNumber}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
