import {
  LayoutDashboard, Activity as ActivityIcon, Search, Bike, Package,
  Warehouse, Building2, Truck, FileText, ShoppingCart, Lock,
  BarChart3, Settings as SettingsIcon,
} from 'lucide-react';
import { Page } from '../types';
import { useApp } from '../context/AppContext';

interface NavItem { page: Page; label: string; icon: React.ElementType; }
interface NavSection { title: string; items: NavItem[]; }

const sections: NavSection[] = [
  { title: 'Overview', items: [
    { page: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { page: 'activity', label: 'Activity', icon: ActivityIcon },
    { page: 'search', label: 'Search', icon: Search },
  ]},
  { title: 'Inventory', items: [
    { page: 'motorcycles', label: 'Motorcycles', icon: Bike },
    { page: 'parts', label: 'Parts', icon: Package },
    { page: 'warehouse', label: 'Warehouse Map', icon: Warehouse },
  ]},
  { title: 'Supply Chain', items: [
    { page: 'suppliers', label: 'Suppliers', icon: Building2 },
    { page: 'shipments', label: 'Shipments', icon: Truck },
    { page: 'purchase-orders', label: 'Purchase Orders', icon: ShoppingCart },
  ]},
  { title: 'Company', items: [
    { page: 'documents', label: 'Documents', icon: FileText },
    { page: 'vault', label: 'Company Vault', icon: Lock },
    { page: 'analytics', label: 'Analytics', icon: BarChart3 },
    { page: 'settings', label: 'Settings', icon: SettingsIcon },
  ]},
];

// which detail pages map back to which nav item for active highlighting
const detailMap: Partial<Record<Page, Page>> = {
  'motorcycle-detail': 'motorcycles',
  'supplier-detail': 'suppliers',
  'shipment-detail': 'shipments',
  'po-detail': 'purchase-orders',
};

export default function Sidebar() {
  const { currentPage, setPage } = useApp();
  const activePage = detailMap[currentPage] ?? currentPage;

  return (
    <aside className="w-60 shrink-0 bg-gray-950 border-r border-gray-800 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <img src="/gpbikes-logo.svg" alt="GP Bikes" className="w-10 h-10 shrink-0 drop-shadow-[0_0_8px_rgba(220,38,38,0.4)]" />
          <div>
            <p className="font-black text-white text-sm leading-tight tracking-wide">GP BIKES</p>
            <p className="text-gray-600 text-[10px] font-mono tracking-widest uppercase">Command Center</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-5 overflow-y-auto">
        {sections.map(section => (
          <div key={section.title}>
            <p className="data-label px-3 mb-1.5">{section.title}</p>
            <div className="space-y-0.5">
              {section.items.map(({ page, label, icon: Icon }) => {
                const active = activePage === page;
                return (
                  <button
                    key={page}
                    onClick={() => setPage(page)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                      active
                        ? 'bg-red-600/15 text-red-400 border-r-2 border-red-500'
                        : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800/60'
                    }`}
                  >
                    <Icon size={16} className="shrink-0" />
                    <span className="text-left">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-gray-800 flex items-center justify-between">
        <span className="text-gray-600 text-[10px] font-mono">v1.0.0</span>
        <span className="flex items-center gap-1.5 text-[10px] font-mono text-green-500">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 pulse-dot" /> ONLINE
        </span>
      </div>
    </aside>
  );
}
