import { useState } from 'react';
import { Activity as ActivityIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';

const dotColor: Record<string, string> = {
  added: 'bg-green-500', updated: 'bg-blue-500', deleted: 'bg-red-500',
  moved: 'bg-purple-500', shipped: 'bg-orange-500', received: 'bg-cyan-500', status: 'bg-yellow-500',
};

export default function Activity() {
  const { data } = useApp();
  const [filterType, setFilterType] = useState('all');

  const entityTypes = Array.from(new Set(data.activity.map(a => a.entityType)));
  const filtered = data.activity.filter(a => filterType === 'all' || a.entityType === filterType);

  // Group by date
  const byDate = filtered.reduce((acc, a) => {
    const date = new Date(a.timestamp).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    (acc[date] = acc[date] || []).push(a);
    return acc;
  }, {} as Record<string, typeof filtered>);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-red-500 rounded-full" />
          <h1 className="text-2xl font-black text-white">Activity Log</h1>
        </div>
        <select className="input w-44" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="all">All Activity</option>
          {entityTypes.map(t => <option key={t} value={t}>{t.replace(/-/g, ' ')}</option>)}
        </select>
      </div>

      {Object.keys(byDate).length === 0 ? (
        <div className="text-center py-16 text-gray-600"><ActivityIcon size={36} className="mx-auto mb-3 opacity-30"/><p>No activity yet.</p></div>
      ) : (
        <div className="space-y-6">
          {Object.entries(byDate).map(([date, entries]) => (
            <div key={date}>
              <p className="data-label mb-3 sticky top-14 bg-gray-950 py-1 z-10">{date}</p>
              <div className="space-y-0">
                {entries.map((a, i) => (
                  <div key={a.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${dotColor[a.actionType] ?? 'bg-gray-500'}`} />
                      {i < entries.length - 1 && <div className="w-px flex-1 bg-gray-800 my-1" />}
                    </div>
                    <div className="pb-4 min-w-0">
                      <p className="text-sm text-gray-200 leading-snug">{a.action}</p>
                      {a.details && <p className="text-xs text-gray-500 mt-0.5">{a.details}</p>}
                      <p className="text-[10px] text-gray-600 font-mono mt-1">
                        {a.user} · {new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
