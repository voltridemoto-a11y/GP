import { useState, useCallback } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import SplashScreen from './components/SplashScreen';
import Dashboard from './pages/Dashboard';
import Motorcycles from './pages/Motorcycles';
import MotorcycleDetail from './pages/MotorcycleDetail';
import WarehouseMap from './pages/WarehouseMap';
import Parts from './pages/Parts';
import Suppliers from './pages/Suppliers';
import SupplierDetail from './pages/SupplierDetail';
import Shipments from './pages/Shipments';
import ShipmentDetail from './pages/ShipmentDetail';
import PurchaseOrders from './pages/PurchaseOrders';
import PODetail from './pages/PODetail';
import Documents from './pages/Documents';
import Vault from './pages/Vault';
import Analytics from './pages/Analytics';
import Activity from './pages/Activity';
import Settings from './pages/Settings';
import Search from './pages/Search';

function AppInner() {
  const { currentPage, selectedId, loading } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-gray-700 border-t-red-500 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm font-mono">Loading data…</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      {currentPage === 'dashboard'          && <Dashboard />}
      {currentPage === 'motorcycles'        && <Motorcycles />}
      {currentPage === 'motorcycle-detail'  && <MotorcycleDetail id={selectedId!} />}
      {currentPage === 'warehouse'          && <WarehouseMap />}
      {currentPage === 'parts'              && <Parts />}
      {currentPage === 'suppliers'          && <Suppliers />}
      {currentPage === 'supplier-detail'    && <SupplierDetail id={selectedId!} />}
      {currentPage === 'shipments'          && <Shipments />}
      {currentPage === 'shipment-detail'    && <ShipmentDetail id={selectedId!} />}
      {currentPage === 'purchase-orders'    && <PurchaseOrders />}
      {currentPage === 'po-detail'          && <PODetail id={selectedId!} />}
      {currentPage === 'documents'          && <Documents />}
      {currentPage === 'vault'              && <Vault />}
      {currentPage === 'analytics'          && <Analytics />}
      {currentPage === 'activity'           && <Activity />}
      {currentPage === 'settings'           && <Settings />}
      {currentPage === 'search'             && <Search />}
    </Layout>
  );
}

export default function App() {
  const [splashDone, setSplashDone] = useState(false);
  const handleSplashComplete = useCallback(() => setSplashDone(true), []);

  return (
    <>
      {!splashDone && <SplashScreen onComplete={handleSplashComplete} />}
      <div className={splashDone ? 'block' : 'invisible pointer-events-none'}>
        <AppProvider>
          <AppInner />
        </AppProvider>
      </div>
    </>
  );
}
