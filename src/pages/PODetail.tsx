import { ArrowLeft, ShoppingCart, Truck, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';
import StatusBadge from '../components/StatusBadge';

export default function PODetail({ id }: { id: string }) {
  const { getPurchaseOrder, getSupplier, setPage, data } = useApp();
  const po = getPurchaseOrder(id);
  if (!po) return <div className="p-8 text-gray-500">Purchase order not found.</div>;

  const supplier = getSupplier(po.supplierId);
  const subtotal = po.items.reduce((n, i) => n + i.quantity * i.unitCost, 0);
  const total = subtotal + po.shippingCost + po.taxesFees;
  const balance = total - po.deposit;
  const shipments = data.shipments.filter(s => s.purchaseOrderId === id);
  const docs = data.documents.filter(d => d.entityType === 'order' && d.entityId === id);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <button onClick={() => setPage('purchase-orders')} className="flex items-center gap-2 text-gray-500 hover:text-white text-sm mb-5 transition-colors">
        <ArrowLeft size={16} /> Back to Purchase Orders
      </button>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-red-600/15 border border-red-600/30 flex items-center justify-center">
            <ShoppingCart size={22} className="text-red-400" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-white font-mono">{po.poNumber}</h1>
              <StatusBadge status={po.status} />
              <StatusBadge status={po.paymentStatus} />
            </div>
            <button onClick={() => supplier && setPage('supplier-detail', supplier.id)} className="text-gray-400 hover:text-white">{supplier?.countryCode} {supplier?.name}</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <p className="data-label mb-4">Line Items</p>
            <table className="w-full text-sm">
              <thead><tr className="text-gray-600 border-b border-gray-800 text-left"><th className="pb-2 font-normal text-xs">Product</th><th className="pb-2 font-normal text-xs">SKU</th><th className="pb-2 font-normal text-xs text-right">Qty</th><th className="pb-2 font-normal text-xs text-right">Unit</th><th className="pb-2 font-normal text-xs text-right">Total</th></tr></thead>
              <tbody className="divide-y divide-gray-800/50">
                {po.items.map(i => (
                  <tr key={i.id}>
                    <td className="py-2.5 text-gray-300">{i.productName}</td>
                    <td className="py-2.5 font-mono text-xs text-gray-500">{i.sku}</td>
                    <td className="py-2.5 text-right text-gray-300">{i.quantity}</td>
                    <td className="py-2.5 text-right text-gray-300">${i.unitCost.toLocaleString()}</td>
                    <td className="py-2.5 text-right text-white font-medium">${(i.quantity * i.unitCost).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {shipments.length > 0 && (
            <div className="card">
              <div className="flex items-center gap-2 mb-3"><Truck size={15} className="text-gray-400"/><span className="font-semibold text-white text-sm">Linked Shipments</span></div>
              <div className="space-y-2">
                {shipments.map(s => (
                  <button key={s.id} onClick={() => setPage('shipment-detail', s.id)} className="w-full flex items-center justify-between bg-gray-800/40 rounded-lg px-3 py-2.5 hover:bg-gray-800 text-left">
                    <span className="font-mono text-sm text-white">{s.shipmentNumber}</span>
                    <StatusBadge status={s.status} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {docs.length > 0 && (
            <div className="card">
              <div className="flex items-center gap-2 mb-3"><FileText size={15} className="text-gray-400"/><span className="font-semibold text-white text-sm">Documents</span></div>
              <div className="space-y-2">
                {docs.map(d => (
                  <div key={d.id} className="flex items-center justify-between bg-gray-800/50 rounded-lg px-3 py-2">
                    <span className="text-sm text-gray-300">{d.name}</span>
                    <span className="text-xs text-gray-600">{d.fileSize}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {po.notes && <div className="card"><p className="data-label mb-2">Notes</p><p className="text-gray-300 text-sm">{po.notes}</p></div>}
        </div>

        <div className="space-y-6">
          <div className="card">
            <p className="data-label mb-4">Payment Summary</p>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="text-gray-200">${subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span className="text-gray-200">${po.shippingCost.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Taxes/Fees</span><span className="text-gray-200">${po.taxesFees.toLocaleString()}</span></div>
              <div className="flex justify-between border-t border-gray-800 pt-2.5"><span className="text-gray-300 font-medium">Total</span><span className="text-white font-bold text-base">${total.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Deposit Paid</span><span className="text-green-400">−${po.deposit.toLocaleString()}</span></div>
              <div className="flex justify-between border-t border-gray-800 pt-2.5"><span className="text-gray-300 font-medium">Balance Due</span><span className={`font-bold text-base ${balance > 0 ? 'text-yellow-400' : 'text-green-400'}`}>${balance.toLocaleString()}</span></div>
            </div>
          </div>
          <div className="card space-y-2 text-sm">
            <p className="data-label mb-1">Details</p>
            <div className="flex justify-between"><span className="text-gray-500">Expected</span><span className="text-gray-200">{new Date(po.expectedDelivery).toLocaleDateString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Created</span><span className="text-gray-200">{new Date(po.createdAt).toLocaleDateString()}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
