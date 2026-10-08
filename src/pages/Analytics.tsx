import { DollarSign, TrendingUp, Package, Bike, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';

function BarChart({ data, color = 'bg-red-500' }: { data: { label: string; value: number; display?: string }[]; color?: string }) {
  const max = Math.max(1, ...data.map(d => d.value));
  return (
    <div className="space-y-2.5">
      {data.map(d => (
        <div key={d.label}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-400">{d.label}</span>
            <span className="text-gray-300 font-mono">{d.display ?? d.value}</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${(d.value / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Analytics() {
  const { data } = useApp();

  const activeBikes = data.motorcycles.filter(m => m.status !== 'sold');
  const soldBikes = data.motorcycles.filter(m => m.status === 'sold');
  const bikeValue = activeBikes.reduce((s, m) => s + m.currentValue, 0);
  const partValue = data.parts.reduce((s, p) => s + p.quantity * p.cost, 0);
  const totalValue = bikeValue + partValue;
  const avgPurchase = data.motorcycles.length ? data.motorcycles.reduce((s, m) => s + m.purchasePrice, 0) / data.motorcycles.length : 0;
  const avgSale = data.motorcycles.length ? data.motorcycles.reduce((s, m) => s + m.salePrice, 0) / data.motorcycles.length : 0;
  const totalSpend = data.purchaseOrders.reduce((s, p) => s + p.items.reduce((n, i) => n + i.quantity * i.unitCost, 0) + p.shippingCost, 0);
  const grossProfit = soldBikes.reduce((s, m) => s + (m.salePrice - m.purchasePrice), 0);

  // Inventory value by brand
  const valueByBrand = Object.entries(activeBikes.reduce((acc, m) => {
    acc[m.brand] = (acc[m.brand] || 0) + m.currentValue;
    return acc;
  }, {} as Record<string, number>)).map(([label, value]) => ({ label, value, display: `$${(value/1000).toFixed(1)}k` })).sort((a, b) => b.value - a.value);

  // Spend by supplier
  const spendBySupplier = Object.entries(data.purchaseOrders.reduce((acc, p) => {
    const name = data.suppliers.find(s => s.id === p.supplierId)?.name ?? 'Unknown';
    acc[name] = (acc[name] || 0) + p.items.reduce((n, i) => n + i.quantity * i.unitCost, 0);
    return acc;
  }, {} as Record<string, number>)).map(([label, value]) => ({ label, value, display: `$${(value/1000).toFixed(1)}k` })).sort((a, b) => b.value - a.value);

  // Bikes by status
  const byStatus = Object.entries(data.motorcycles.reduce((acc, m) => {
    acc[m.status] = (acc[m.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>)).map(([label, value]) => ({ label: label.replace(/-/g, ' '), value })).sort((a, b) => b.value - a.value);

  const lowStock = data.parts.filter(p => p.quantity <= p.minimumStock);

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1.5 h-6 bg-red-500 rounded-full" />
        <h1 className="text-2xl font-black text-white">Analytics</h1>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        <Metric icon={DollarSign} label="Inventory Value" value={`$${(totalValue/1000).toFixed(0)}k`} color="text-green-400" />
        <Metric icon={Package} label="Total Spend" value={`$${(totalSpend/1000).toFixed(0)}k`} color="text-blue-400" />
        <Metric icon={TrendingUp} label="Gross Profit" value={`$${(grossProfit/1000).toFixed(1)}k`} color="text-emerald-400" sub={`${soldBikes.length} sold`} />
        <Metric icon={Bike} label="Avg Purchase" value={`$${avgPurchase.toFixed(0)}`} color="text-orange-400" />
        <Metric icon={Bike} label="Avg Sale" value={`$${avgSale.toFixed(0)}`} color="text-red-400" />
        <Metric icon={AlertTriangle} label="Low Stock" value={lowStock.length} color="text-yellow-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-white text-sm mb-4">Inventory Value by Brand</h3>
          <BarChart data={valueByBrand} color="bg-red-500" />
        </div>
        <div className="card">
          <h3 className="font-semibold text-white text-sm mb-4">Spend by Supplier</h3>
          <BarChart data={spendBySupplier} color="bg-blue-500" />
        </div>
        <div className="card">
          <h3 className="font-semibold text-white text-sm mb-4">Fleet by Status</h3>
          <BarChart data={byStatus} color="bg-orange-500" />
        </div>
        <div className="card">
          <h3 className="font-semibold text-white text-sm mb-4">Low Stock Products</h3>
          {lowStock.length === 0 ? <p className="text-gray-600 text-sm">All parts above minimum stock.</p> : (
            <div className="space-y-2">
              {lowStock.map(p => (
                <div key={p.id} className="flex items-center justify-between bg-gray-800/40 rounded-lg px-3 py-2">
                  <span className="text-sm text-gray-300">{p.name}</span>
                  <span className={`text-xs font-mono ${p.quantity === 0 ? 'text-red-400' : 'text-yellow-400'}`}>{p.quantity} / {p.minimumStock}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value, color, sub }: { icon: React.ElementType; label: string; value: string | number; color: string; sub?: string }) {
  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-1"><Icon size={14} className={color}/><span className="data-label">{label}</span></div>
      <p className="text-2xl font-black text-white">{value}</p>
      {sub && <p className="text-[10px] text-gray-600 mt-0.5">{sub}</p>}
    </div>
  );
}
