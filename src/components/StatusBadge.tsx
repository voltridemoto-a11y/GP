const styles: Record<string, string> = {
  // Bike statuses
  'ordered': 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  'manufacturing': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  'shipped': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'in-transit': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  'customs': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  'delivered': 'bg-green-500/20 text-green-300 border-green-500/30',
  'warehouse': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'ready-for-sale': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'reserved': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  'sold': 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  'warranty': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  'service': 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  // Shipment extra
  'processing': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'picked-up': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  'out-for-delivery': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  'delayed': 'bg-red-500/20 text-red-300 border-red-500/30',
  // PO
  'draft': 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  'sent': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'confirmed': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  'in-production': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  'cancelled': 'bg-red-500/20 text-red-300 border-red-500/30',
  // Payment
  'unpaid': 'bg-red-500/20 text-red-300 border-red-500/30',
  'deposit-paid': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  'partial': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  'paid': 'bg-green-500/20 text-green-300 border-green-500/30',
  'overdue': 'bg-red-500/20 text-red-300 border-red-500/30',
  // Supplier / general
  'active': 'bg-green-500/20 text-green-300 border-green-500/30',
  'inactive': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  'pending': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
};

export default function StatusBadge({ status, className = '' }: { status: string; className?: string }) {
  const style = styles[status] ?? 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style} ${className}`}>
      {status.replace(/-/g, ' ')}
    </span>
  );
}
