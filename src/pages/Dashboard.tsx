import { Bike, Package, Truck, ShoppingCart, DollarSign, AlertTriangle, Plus, ChevronRight, Clock, TrendingUp, Boxes } from 'lucide-react';
import { useApp } from '../context/AppContext';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';

export default function Dashboard() {
  const { data, setPage, getSupplier } = useApp();

  const bikesInInventory = data.motorcycles.filter(m => ['warehouse', 'ready-for-sale', 'reserved', 'service', 'delivered'].includes(m.status));
  const bikesInTransit = data.motorcycles.filter(m => ['in-transit', 'shipped', 'customs'].includes(m.status));
  const partsTotal = data.parts.reduce((s, p) => s + p.quantity, 0);
  const openPOs = data.purchaseOrders.filter(p => !['delivered', 'cancelled'].includes(p.status));
  const delayedShipments = data.shipments.filter(s => s.status === 'delayed');
  const lowStock = data.parts.filter(p => p.quantity <= p.minimumStock);
  const inTransitShipments = data.shipments.filter(s => ['in-transit', 'picked-up', 'processing', 'customs', 'out-for-delivery'].includes(s.status));

  const totalInventoryValue =
    data.motorcycles.filter(m => m.status !== 'sold').reduce((s, m) => s + m.currentValue, 0) +
    data.parts.reduce((s, p) => s + p.quantity * p.cost, 0);

  // Upcoming deliveries (shipments not yet delivered, sorted by ETA)
  const upcoming = [...data.shipments]
    .filter(s => s.status !== 'delivered')
    .sort((a, b) => new Date(a.estimatedArrival).getTime() - new Date(b.estimatedArrival).getTime())
    .slice(0, 5);

  // Inventory by status breakdown
  const statusBreakdown = data.motorcycles.reduce((acc, m) => {
    acc[m.status] = (acc[m.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const maxStatus = Math.max(1, ...Object.values(statusBreakdown));

  const brandBreakdown = data.motorcycles.reduce((acc, m) => {
    acc[m.brand] = (acc[m.brand] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-0.5">
            <div className="w-1.5 h-6 bg-red-500 rounded-full" />
            <h1 className="text-2xl font-black text-white tracking-tight">Command Center</h1>
          </div>
          <p className="text-gray-500 text-sm ml-4 font-mono">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setPage('motorcycles')} className="btn-secondary"><Plus size={15}/> Bike</button>
          <button onClick={() => setPage('shipments')} className="btn-secondary"><Plus size={15}/> Shipment</button>
          <button onClick={() => setPage('purchase-orders')} className="btn-primary"><Plus size={15}/> Purchase Order</button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <StatCard label="Bikes In Stock" value={bikesInInventory.length} icon={Bike} color="bg-red-600" onClick={() => setPage('motorcycles')} />
        <StatCard label="Parts On Hand" value={partsTotal} icon={Package} color="bg-blue-600" onClick={() => setPage('parts')} />
        <StatCard label="In Transit" value={bikesInTransit.length} icon={Truck} color="bg-orange-600" sub="motorcycles" onClick={() => setPage('shipments')} />
        <StatCard label="Open POs" value={openPOs.length} icon={ShoppingCart} color="bg-amber-600" onClick={() => setPage('purchase-orders')} />
        <StatCard label="Inventory Value" value={`$${(totalInventoryValue / 1000).toFixed(0)}k`} icon={DollarSign} color="bg-green-600" onClick={() => setPage('analytics')} />
        <StatCard label="Delayed" value={delayedShipments.length} icon={AlertTriangle} color="bg-rose-600" sub="shipments" onClick={() => setPage('shipments')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Alerts + Upcoming */}
        <div className="space-y-5">
          {/* Alerts */}
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={15} className="text-yellow-400" />
              <span className="font-semibold text-white text-sm">Alerts</span>
            </div>
            <div className="space-y-2">
              {delayedShipments.map(s => (
                <div key={s.id} onClick={() => setPage('shipment-detail', s.id)} className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-xs cursor-pointer hover:bg-red-500/15">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 pulse-dot shrink-0" />
                  <span className="text-red-300">{s.shipmentNumber} delayed — {getSupplier(s.supplierId)?.name}</span>
                </div>
              ))}
              {lowStock.map(p => (
                <div key={p.id} onClick={() => setPage('parts')} className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2 text-xs cursor-pointer hover:bg-yellow-500/15">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 pulse-dot shrink-0" />
                  <span className="text-yellow-300">{p.quantity === 0 ? 'OUT' : 'LOW'}: {p.name} ({p.quantity}/{p.minimumStock})</span>
                </div>
              ))}
              {delayedShipments.length === 0 && lowStock.length === 0 && (
                <p className="text-gray-600 text-xs">All clear. No active alerts.</p>
              )}
            </div>
          </div>

          {/* Upcoming deliveries */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-gray-400" />
                <span className="font-semibold text-white text-sm">Upcoming Deliveries</span>
              </div>
              <button onClick={() => setPage('shipments')} className="text-xs text-gray-500 hover:text-red-400 flex items-center gap-1">All <ChevronRight size={12}/></button>
            </div>
            <div className="space-y-2">
              {upcoming.map(s => {
                const days = Math.ceil((new Date(s.estimatedArrival).getTime() - Date.now()) / 86400000);
                return (
                  <div key={s.id} onClick={() => setPage('shipment-detail', s.id)} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0 cursor-pointer hover:opacity-80">
                    <div className="min-w-0">
                      <p className="text-sm text-white truncate">{getSupplier(s.supplierId)?.name}</p>
                      <p className="text-xs text-gray-600">{s.shipmentNumber} · {s.items.reduce((n, i) => n + i.quantity, 0)} units</p>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <p className="text-xs text-gray-300">{new Date(s.estimatedArrival).toLocaleDateString()}</p>
                      <p className={`text-[10px] ${days < 0 ? 'text-red-400' : days <= 3 ? 'text-yellow-400' : 'text-gray-600'}`}>
                        {days < 0 ? `${Math.abs(days)}d late` : days === 0 ? 'today' : `${days}d`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Middle: Inventory breakdown */}
        <div className="space-y-5">
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Boxes size={15} className="text-gray-400" />
              <span className="font-semibold text-white text-sm">Inventory by Status</span>
            </div>
            <div className="space-y-2.5">
              {Object.entries(statusBreakdown).sort((a, b) => b[1] - a[1]).map(([status, count]) => (
                <div key={status}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400 capitalize">{status.replace(/-/g, ' ')}</span>
                    <span className="text-gray-300 font-mono">{count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: `${(count / maxStatus) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={15} className="text-gray-400" />
              <span className="font-semibold text-white text-sm">Fleet by Brand</span>
            </div>
            <div className="space-y-2.5">
              {Object.entries(brandBreakdown).sort((a, b) => b[1] - a[1]).map(([brand, count]) => (
                <div key={brand} className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">{brand}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full" style={{ width: `${(count / data.motorcycles.length) * 100}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 font-mono w-5 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Activity + In Transit */}
        <div className="space-y-5">
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-white text-sm">In Transit</span>
              <StatusBadge status="in-transit" />
            </div>
            <div className="space-y-2">
              {inTransitShipments.slice(0, 5).map(s => (
                <div key={s.id} onClick={() => setPage('shipment-detail', s.id)} className="flex items-center justify-between py-1.5 cursor-pointer hover:opacity-80">
                  <div>
                    <p className="text-sm text-white">{s.shipmentNumber}</p>
                    <p className="text-xs text-gray-600">{s.carrier} · {s.origin.split(',')[0]}</p>
                  </div>
                  <StatusBadge status={s.status} />
                </div>
              ))}
              {inTransitShipments.length === 0 && <p className="text-gray-600 text-xs">Nothing in transit.</p>}
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-white text-sm">Recent Activity</span>
              <button onClick={() => setPage('activity')} className="text-xs text-gray-500 hover:text-red-400 flex items-center gap-1">All <ChevronRight size={12}/></button>
            </div>
            <div className="space-y-2.5">
              {data.activity.slice(0, 6).map(a => (
                <div key={a.id} className="flex gap-2.5">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                    a.actionType === 'added' ? 'bg-green-500' :
                    a.actionType === 'deleted' ? 'bg-red-500' :
                    a.actionType === 'moved' ? 'bg-purple-500' :
                    a.actionType === 'received' ? 'bg-blue-500' : 'bg-gray-500'
                  }`} />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-300 leading-snug">{a.action}</p>
                    <p className="text-[10px] text-gray-600 font-mono">{a.user} · {new Date(a.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
