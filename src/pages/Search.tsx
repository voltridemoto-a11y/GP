import { useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Search() {
  const { searchAll, setPage } = useApp();
  const [query, setQuery] = useState('');
  const results = query ? searchAll(query) : [];

  const grouped = results.reduce((acc, r) => {
    (acc[r.type] = acc[r.type] || []).push(r);
    return acc;
  }, {} as Record<string, typeof results>);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1.5 h-6 bg-red-500 rounded-full" />
        <h1 className="text-2xl font-black text-white">Global Search</h1>
      </div>

      <div className="relative mb-6">
        <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          autoFocus
          className="input pl-11 py-3 text-base"
          placeholder="Search VINs, SKUs, tracking numbers, suppliers, POs, documents..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      {!query ? (
        <div className="text-center py-16 text-gray-600">
          <SearchIcon size={36} className="mx-auto mb-3 opacity-30" />
          <p>Start typing to search across everything.</p>
          <p className="text-xs text-gray-700 mt-1">Try a bike ID like "UB-001" or a tracking number.</p>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-16 text-gray-600"><p>No results for "{query}"</p></div>
      ) : (
        <div className="space-y-6">
          <p className="text-sm text-gray-500">{results.length} results</p>
          {Object.entries(grouped).map(([type, items]) => (
            <div key={type}>
              <p className="data-label mb-2">{type} ({items.length})</p>
              <div className="space-y-2">
                {items.map(r => (
                  <button key={`${r.type}-${r.id}`} onClick={() => setPage(r.page, r.id)} className="w-full flex items-center justify-between card-tech card text-left">
                    <div>
                      <p className="text-sm text-white font-medium">{r.title}</p>
                      <p className="text-xs text-gray-500">{r.subtitle}</p>
                    </div>
                    <span className="text-[10px] font-mono uppercase text-red-500">{r.type}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
