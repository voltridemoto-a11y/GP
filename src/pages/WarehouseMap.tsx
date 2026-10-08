import { useState } from 'react';
import { Warehouse as WarehouseIcon, Bike, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';
import StatusBadge from '../components/StatusBadge';

const statusDot: Record<string, string> = {
  'ready-for-sale': 'bg-emerald-500',
  'warehouse': 'bg-blue-500',
  'reserved': 'bg-yellow-500',
  'sold': 'bg-teal-500',
  'service': 'bg-rose-500',
  'delivered': 'bg-green-500',
};

export default function WarehouseMap() {
  const { data, setPage } = useApp();
  const [selectedWh, setSelectedWh] = useState(data.warehouses[0]?.id ?? '');

  const warehouse = data.warehouses.find(w => w.id === selectedWh);
  const bikesHere = data.motorcycles.filter(m => m.warehouseId === selectedWh && m.mapPosition);
  const unassigned = data.motorcycles.filter(m =>
    ['warehouse', 'ready-for-sale', 'reserved', 'service', 'delivered'].includes(m.status) && !m.mapPosition
  );

  const bikeAt = (x: number, y: number) =>
    bikesHere.find(m => m.mapPosition?.x === x && m.mapPosition?.y === y);

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1.5 h-6 bg-red-500 rounded-full" />
        <h1 className="text-2xl font-black text-white">Warehouse Map</h1>
      </div>

      {/* Warehouse selector tabs */}
      <div className="flex gap-2 mb-6">
        {data.warehouses.map(w => {
          const count = data.motorcycles.filter(m => m.warehouseId === w.id).length;
          return (
            <button
              key={w.id}
              onClick={() => setSelectedWh(w.id)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                selectedWh === w.id ? 'bg-red-600/15 text-red-400 border-red-500/40' : 'bg-gray-900 text-gray-400 border-gray-800 hover:border-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <WarehouseIcon size={15} />
                {w.name}
                <span className="text-xs bg-gray-800 px-1.5 py-0.5 rounded-full">{count}</span>
              </div>
            </button>
          );
        })}
      </div>

      {warehouse && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Grid map */}
          <div className="lg:col-span-3">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-semibold text-white text-sm">{warehouse.name}</p>
                  <p className="text-xs text-gray-500">{warehouse.address}</p>
                </div>
                <span className="data-label">{warehouse.rows} rows × {warehouse.cols} positions</span>
              </div>

              {/* Floor grid */}
              <div className="bg-gray-950 rounded-xl p-5 border border-gray-800 overflow-x-auto">
                <div className="inline-flex flex-col gap-2 min-w-full">
                  {Array.from({ length: warehouse.rows }).map((_, y) => (
                    <div key={y} className="flex items-center gap-2">
                      <span className="data-label w-12 shrink-0">Row {y + 1}</span>
                      <div className="flex gap-2">
                        {Array.from({ length: warehouse.cols }).map((_, x) => {
                          const bike = bikeAt(x, y);
                          return (
                            <button
                              key={x}
                              onClick={() => bike && setPage('motorcycle-detail', bike.id)}
                              className={`w-16 h-16 rounded-lg border-2 flex flex-col items-center justify-center transition-all shrink-0 ${
                                bike
                                  ? 'border-gray-600 bg-gray-800 hover:border-red-500 hover:bg-gray-750 cursor-pointer'
                                  : 'border-dashed border-gray-800 bg-transparent'
                              }`}
                              title={bike ? `${bike.bikeId} — ${bike.brand} ${bike.model}` : `Position ${x + 1} (empty)`}
                            >
                              {bike ? (
                                <>
                                  <div className={`w-2 h-2 rounded-full mb-1 ${statusDot[bike.status] ?? 'bg-gray-500'}`} />
                                  <Bike size={16} className="text-gray-300" />
                                  <span className="text-[8px] font-mono text-gray-400 mt-0.5 truncate w-full text-center px-0.5">{bike.bikeId}</span>
                                </>
                              ) : (
                                <span className="text-[9px] text-gray-700">{x + 1}</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-3 mt-4">
                {Object.entries(statusDot).map(([status, color]) => (
                  <div key={status} className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${color}`} />
                    <span className="text-[10px] text-gray-500 capitalize">{status.replace(/-/g, ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Unassigned bikes */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={15} className="text-gray-400" />
                <span className="font-semibold text-white text-sm">Unplaced Bikes</span>
              </div>
              <p className="text-xs text-gray-600 mb-3">In inventory but not on a map. Edit a bike to assign a position.</p>
              <div className="space-y-2">
                {unassigned.map(m => (
                  <button key={m.id} onClick={() => setPage('motorcycle-detail', m.id)} className="w-full flex items-center justify-between bg-gray-800/50 rounded-lg px-3 py-2 hover:bg-gray-800 transition-colors text-left">
                    <div>
                      <p className="text-sm font-mono text-white">{m.bikeId}</p>
                      <p className="text-xs text-gray-500">{m.brand} {m.model}</p>
                    </div>
                    <StatusBadge status={m.status} />
                  </button>
                ))}
                {unassigned.length === 0 && <p className="text-gray-600 text-xs">All inventory placed.</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
