import { useState, useRef, useEffect } from 'react';
import { Search, Bell, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Topbar() {
  const { searchAll, setPage, data } = useApp();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const results = query ? searchAll(query) : [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const go = (page: typeof results[0]['page'], id: string) => {
    setPage(page, id);
    setQuery('');
    setOpen(false);
  };

  const alertCount =
    data.parts.filter(p => p.quantity <= p.minimumStock).length +
    data.shipments.filter(s => s.status === 'delayed').length;

  return (
    <div className="h-14 shrink-0 bg-gray-950/80 backdrop-blur border-b border-gray-800 flex items-center gap-4 px-6 sticky top-0 z-30">
      {/* Global Search */}
      <div ref={ref} className="relative flex-1 max-w-xl">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          className="w-full bg-gray-900 border border-gray-800 text-gray-100 rounded-lg pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:border-red-500 placeholder-gray-600"
          placeholder="Search VINs, SKUs, tracking #, suppliers, POs..."
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
        />
        {open && query && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-h-96 overflow-y-auto z-50">
            {results.length === 0 ? (
              <p className="px-4 py-6 text-center text-gray-600 text-sm">No results for "{query}"</p>
            ) : (
              results.map(r => (
                <button
                  key={`${r.type}-${r.id}`}
                  onClick={() => go(r.page, r.id)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-800 transition-colors text-left border-b border-gray-800/60 last:border-0"
                >
                  <span className="text-[10px] font-mono uppercase text-red-500 w-20 shrink-0">{r.type}</span>
                  <div className="min-w-0">
                    <p className="text-sm text-white truncate">{r.title}</p>
                    <p className="text-xs text-gray-500 truncate">{r.subtitle}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="flex-1" />

      {/* Alerts */}
      <button onClick={() => setPage('dashboard')} className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
        <Bell size={17} />
        {alertCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
            {alertCount}
          </span>
        )}
      </button>

      {/* User */}
      <div className="flex items-center gap-2 pl-3 border-l border-gray-800">
        <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
          <User size={15} className="text-white" />
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-white leading-tight">Braden</p>
          <p className="text-[10px] text-gray-500">Admin</p>
        </div>
      </div>
    </div>
  );
}
