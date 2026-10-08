import React, { useState } from 'react';
import { Plus, Lock, Eye, EyeOff, Copy, Check, Trash2, Edit2, RefreshCw, ShieldCheck } from 'lucide-react';
import { useApp, encodePassword, decodePassword } from '../context/AppContext';
import { VaultEntry } from '../types';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import VaultPin from '../components/VaultPin';

const CATEGORIES: VaultEntry['category'][] = ['supplier-account','shipping-account','dealer-portal','website','software','business-service','social-media','banking'];

function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
  return Array.from({ length: 16 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export default function Vault() {
  const { data, addVaultEntry, updateVaultEntry, deleteVaultEntry } = useApp();
  const [unlocked, setUnlocked] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<VaultEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VaultEntry | null>(null);
  const [form, setForm] = useState({ category: 'website' as VaultEntry['category'], service: '', username: '', password: '', website: '', notes: '', accountOwner: 'Braden' });

  if (!unlocked) return <VaultPin onUnlock={() => setUnlocked(true)} />;

  const openAdd = () => { setEditTarget(null); setForm({ category: 'website', service: '', username: '', password: '', website: '', notes: '', accountOwner: 'Braden' }); setModalOpen(true); };
  const openEdit = (v: VaultEntry) => { setEditTarget(v); setForm({ category: v.category, service: v.service, username: v.username, password: decodePassword(v.passwordEncrypted), website: v.website, notes: v.notes, accountOwner: v.accountOwner }); setModalOpen(true); };
  const save = () => {
    if (!form.service.trim()) return;
    const payload = { category: form.category, service: form.service, username: form.username, passwordEncrypted: encodePassword(form.password), website: form.website, notes: form.notes, accountOwner: form.accountOwner, lastUpdated: new Date().toISOString() };
    if (editTarget) updateVaultEntry(editTarget.id, payload);
    else addVaultEntry(payload);
    setModalOpen(false);
  };
  const copy = async (text: string, key: string) => { await navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(null), 1500); };

  const grouped = CATEGORIES.map(cat => ({ cat, entries: data.vault.filter(v => v.category === cat) })).filter(g => g.entries.length > 0);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-0.5">
            <div className="w-1.5 h-6 bg-red-500 rounded-full" />
            <h1 className="text-2xl font-black text-white flex items-center gap-2">Company Vault <ShieldCheck size={18} className="text-green-400"/></h1>
          </div>
          <p className="text-gray-500 text-sm ml-4">{data.vault.length} credentials · encrypted at rest</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setUnlocked(false)} className="btn-secondary"><Lock size={15}/> Lock</button>
          <button onClick={openAdd} className="btn-primary"><Plus size={16}/> Add Credential</button>
        </div>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-2.5 mb-6 text-xs text-amber-300">
        Passwords are encoded for local storage. For production, use a dedicated secrets manager with real encryption and per-user access control.
      </div>

      <div className="space-y-6">
        {grouped.map(({ cat, entries }) => (
          <div key={cat}>
            <p className="data-label mb-2 capitalize">{cat.replace(/-/g, ' ')}</p>
            <div className="space-y-2">
              {entries.map(v => {
                const pw = decodePassword(v.passwordEncrypted);
                const show = revealed[v.id];
                return (
                  <div key={v.id} className="card-tech card group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center shrink-0"><Lock size={15} className="text-red-400"/></div>
                      <div className="flex-1 min-w-0 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-semibold text-white">{v.service}</p>
                          {v.website && <a href={v.website} target="_blank" rel="noopener noreferrer" className="text-xs text-red-400 hover:underline">{v.website.replace('https://','')}</a>}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-gray-400 truncate">{v.username}</span>
                            <button onClick={() => copy(v.username, v.id + 'u')} className="text-gray-600 hover:text-white">{copied === v.id + 'u' ? <Check size={11} className="text-green-400"/> : <Copy size={11}/>}</button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-gray-400">{show ? pw : '••••••••••'}</span>
                            <button onClick={() => setRevealed(r => ({ ...r, [v.id]: !show }))} className="text-gray-600 hover:text-white">{show ? <EyeOff size={11}/> : <Eye size={11}/>}</button>
                            <button onClick={() => copy(pw, v.id + 'p')} className="text-gray-600 hover:text-white">{copied === v.id + 'p' ? <Check size={11} className="text-green-400"/> : <Copy size={11}/>}</button>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(v)} className="p-1.5 rounded text-gray-500 hover:text-white hover:bg-gray-700"><Edit2 size={13}/></button>
                        <button onClick={() => setDeleteTarget(v)} className="p-1.5 rounded text-gray-500 hover:text-red-400 hover:bg-gray-700"><Trash2 size={13}/></button>
                      </div>
                    </div>
                    {v.notes && <p className="text-xs text-gray-600 mt-2 ml-14">{v.notes}</p>}
                    <p className="text-[10px] text-gray-700 mt-1 ml-14 font-mono">Owner: {v.accountOwner} · Updated {new Date(v.lastUpdated).toLocaleDateString()}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Edit Credential' : 'Add Credential'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as VaultEntry['category'] }))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/-/g, ' ')}</option>)}
              </select>
            </div>
            <div><label className="label">Account Owner</label><input className="input" value={form.accountOwner} onChange={e => setForm(f => ({ ...f, accountOwner: e.target.value }))} /></div>
          </div>
          <div><label className="label">Service</label><input className="input" value={form.service} onChange={e => setForm(f => ({ ...f, service: e.target.value }))} /></div>
          <div><label className="label">Username / Email</label><input className="input font-mono" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} /></div>
          <div>
            <label className="label">Password</label>
            <div className="flex gap-2">
              <input className="input font-mono" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
              <button onClick={() => setForm(f => ({ ...f, password: generatePassword() }))} className="btn-secondary px-3" title="Generate"><RefreshCw size={14}/></button>
            </div>
          </div>
          <div><label className="label">Website</label><input className="input" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} /></div>
          <div><label className="label">Notes</label><textarea className="input resize-none" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={save} className="btn-primary">{editTarget ? 'Save' : 'Add'}</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteTarget && deleteVaultEntry(deleteTarget.id)} title="Delete Credential" message={`Delete "${deleteTarget?.service}"?`} />
    </div>
  );
}
