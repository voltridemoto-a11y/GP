import React, { useState } from 'react';
import { Plus, Search, FileText, Trash2, Upload } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GPDocument } from '../types';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

const DOC_TYPES: GPDocument['type'][] = ['commercial-invoice','packing-list','bill-of-lading','certificate','mco','title','purchase-order','supplier-invoice','shipping-doc','warranty','manual','customs','other'];
const ENTITY_TYPES: GPDocument['entityType'][] = ['general','motorcycle','supplier','order','shipment','part'];

const typeColors: Record<string, string> = {
  'commercial-invoice': 'text-green-400', 'packing-list': 'text-blue-400', 'bill-of-lading': 'text-purple-400',
  'certificate': 'text-amber-400', 'mco': 'text-red-400', 'title': 'text-red-400', 'customs': 'text-orange-400',
  'warranty': 'text-cyan-400', 'manual': 'text-gray-400',
};

export default function Documents() {
  const { data, addDocument, deleteDocument } = useApp();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GPDocument | null>(null);
  const [form, setForm] = useState<Omit<GPDocument, 'id'>>({ name: '', type: 'other', entityType: 'general', entityId: '', fileSize: '—', uploadDate: new Date().toISOString(), notes: '' });

  const filtered = data.documents.filter(d => {
    const matchSearch = [d.name, d.type, d.notes].join(' ').toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || d.type === filterType;
    return matchSearch && matchType;
  });

  const save = () => {
    if (!form.name.trim()) return;
    addDocument({ ...form, uploadDate: new Date().toISOString() });
    setForm({ name: '', type: 'other', entityType: 'general', entityId: '', fileSize: '—', uploadDate: new Date().toISOString(), notes: '' });
    setModalOpen(false);
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-0.5">
            <div className="w-1.5 h-6 bg-red-500 rounded-full" />
            <h1 className="text-2xl font-black text-white">Documents</h1>
          </div>
          <p className="text-gray-500 text-sm ml-4">{data.documents.length} documents</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary"><Upload size={16}/> Upload Document</button>
      </div>

      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input className="input pl-9" placeholder="Search documents..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-48" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="all">All Types</option>
          {DOC_TYPES.map(t => <option key={t} value={t}>{t.replace(/-/g, ' ')}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(d => (
          <div key={d.id} className="card-tech card group">
            <div className="flex items-start justify-between mb-2">
              <div className={`w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center ${typeColors[d.type] ?? 'text-gray-400'}`}>
                <FileText size={16} />
              </div>
              <button onClick={() => setDeleteTarget(d)} className="p-1.5 rounded text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={13}/></button>
            </div>
            <p className="text-sm font-medium text-white leading-snug">{d.name}</p>
            <p className="text-xs text-gray-500 mt-0.5 capitalize">{d.type.replace(/-/g, ' ')}</p>
            {d.notes && <p className="text-xs text-gray-600 mt-2">{d.notes}</p>}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-800 text-[10px] text-gray-600 font-mono">
              <span className="uppercase">{d.entityType}</span>
              <span>{d.fileSize} · {new Date(d.uploadDate).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && <div className="text-center py-16 text-gray-600"><FileText size={36} className="mx-auto mb-3 opacity-30"/><p>No documents found.</p></div>}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Upload Document" size="md">
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-700 rounded-xl py-8 text-center text-gray-500">
            <Upload size={28} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Document metadata entry</p>
            <p className="text-xs text-gray-600">(File storage is added with the backend)</p>
          </div>
          <div><label className="label">Document Name</label><input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Type</label>
              <select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as GPDocument['type'] }))}>
                {DOC_TYPES.map(t => <option key={t} value={t}>{t.replace(/-/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Attach To</label>
              <select className="input" value={form.entityType} onChange={e => setForm(f => ({ ...f, entityType: e.target.value as GPDocument['entityType'] }))}>
                {ENTITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div><label className="label">Notes</label><textarea className="input resize-none" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={save} className="btn-primary">Add Document</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteTarget && deleteDocument(deleteTarget.id)} title="Delete Document" message={`Delete "${deleteTarget?.name}"?`} />
    </div>
  );
}
