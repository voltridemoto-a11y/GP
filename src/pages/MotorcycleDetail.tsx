import { ArrowLeft, Bike, DollarSign, MapPin, Calendar, Gauge, Battery, Cpu, Wrench, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';
import StatusBadge from '../components/StatusBadge';
import FileUpload from '../components/FileUpload';

export default function MotorcycleDetail({ id }: { id: string }) {
  const { getMotorcycle, getSupplier, getWarehouse, setPage, updateMotorcycle, data } = useApp();
  const m = getMotorcycle(id);
  if (!m) return <div className="p-8 text-gray-500">Motorcycle not found.</div>;

  const supplier = getSupplier(m.supplierId);
  const warehouse = getWarehouse(m.warehouseId);
  const margin = m.salePrice - m.purchasePrice;
  const marginPct = m.purchasePrice ? ((margin / m.purchasePrice) * 100).toFixed(1) : '0';
  const docs = data.documents.filter(d => d.entityType === 'motorcycle' && d.entityId === id);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <button onClick={() => setPage('motorcycles')} className="flex items-center gap-2 text-gray-500 hover:text-white text-sm mb-5 transition-colors">
        <ArrowLeft size={16} /> Back to Motorcycles
      </button>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-red-600/15 border border-red-600/30 flex items-center justify-center">
            <Bike size={24} className="text-red-400" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-white font-mono">{m.bikeId}</h1>
              <StatusBadge status={m.status} />
            </div>
            <p className="text-gray-400">{m.year} {m.brand} {m.model} · {m.color}</p>
            <p className="text-gray-600 text-xs font-mono mt-0.5">VIN: {m.vin}</p>
          </div>
        </div>
        <select
          value={m.status}
          onChange={e => updateMotorcycle(id, { status: e.target.value as any })}
          className="input w-44"
        >
          {['ordered','manufacturing','shipped','in-transit','customs','delivered','warehouse','ready-for-sale','reserved','sold','warranty','service'].map(s => (
            <option key={s} value={s}>{s.replace(/-/g, ' ')}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: photos + specs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Photo gallery */}
          <div className="card">
            <FileUpload photos={m.photos} onChange={photos => updateMotorcycle(id, { photos })} label="Photo Gallery" />
          </div>

          {/* Specs */}
          <div className="card">
            <p className="data-label mb-4">Specifications</p>
            <div className="grid grid-cols-2 gap-y-4 gap-x-6">
              <SpecRow icon={Gauge} label="Mileage" value={`${m.mileage} mi`} />
              <SpecRow icon={Bike} label="Condition" value={m.condition} />
              <SpecRow icon={Battery} label="Battery" value={m.batteryInfo || '—'} />
              <SpecRow icon={Cpu} label="Controller" value={m.controllerInfo || '—'} />
              <SpecRow icon={Wrench} label="Modifications" value={m.modifications || 'None'} />
              <SpecRow icon={Calendar} label="Purchased" value={new Date(m.purchaseDate).toLocaleDateString()} />
            </div>
          </div>

          {/* Documents */}
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <FileText size={15} className="text-gray-400" />
              <span className="font-semibold text-white text-sm">Documents</span>
            </div>
            {docs.length === 0 ? <p className="text-gray-600 text-sm">No documents attached.</p> : (
              <div className="space-y-2">
                {docs.map(d => (
                  <div key={d.id} className="flex items-center justify-between bg-gray-800/50 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-gray-500" />
                      <span className="text-sm text-gray-300">{d.name}</span>
                    </div>
                    <span className="text-xs text-gray-600">{d.fileSize}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {m.notes && (
            <div className="card">
              <p className="data-label mb-2">Notes</p>
              <p className="text-gray-300 text-sm">{m.notes}</p>
            </div>
          )}
        </div>

        {/* Right: financials + location */}
        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign size={15} className="text-green-400" />
              <span className="font-semibold text-white text-sm">Financials</span>
            </div>
            <div className="space-y-3">
              <FinRow label="Purchase Price" value={m.purchasePrice} />
              <FinRow label="Current Value" value={m.currentValue} />
              <FinRow label="Sale Price" value={m.salePrice} highlight />
              <div className="border-t border-gray-800 pt-3 flex justify-between items-center">
                <span className="text-sm text-gray-400">Projected Margin</span>
                <div className="text-right">
                  <p className={`text-lg font-black ${margin >= 0 ? 'text-green-400' : 'text-red-400'}`}>${margin.toLocaleString()}</p>
                  <p className="text-xs text-gray-600">{marginPct}%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={15} className="text-gray-400" />
              <span className="font-semibold text-white text-sm">Location</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Warehouse</span><span className="text-gray-200">{warehouse?.name ?? '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Position</span><span className="text-gray-200">{m.warehouseLocation || '—'}</span></div>
            </div>
            <button onClick={() => setPage('warehouse')} className="btn-secondary w-full justify-center mt-3 text-xs">View on Warehouse Map</button>
          </div>

          <div className="card">
            <p className="data-label mb-3">Supplier</p>
            {supplier ? (
              <button onClick={() => setPage('supplier-detail', supplier.id)} className="w-full text-left hover:opacity-80">
                <p className="text-sm text-white font-medium">{supplier.countryCode} {supplier.name}</p>
                <p className="text-xs text-gray-500">{supplier.contactPerson} · {supplier.email}</p>
              </button>
            ) : <p className="text-gray-600 text-sm">—</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function SpecRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon size={15} className="text-gray-600 mt-0.5 shrink-0" />
      <div>
        <p className="text-[10px] text-gray-600 uppercase tracking-wide">{label}</p>
        <p className="text-sm text-gray-200 capitalize">{value}</p>
      </div>
    </div>
  );
}

function FinRow({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`font-semibold ${highlight ? 'text-white text-base' : 'text-gray-300 text-sm'}`}>${value.toLocaleString()}</span>
    </div>
  );
}
