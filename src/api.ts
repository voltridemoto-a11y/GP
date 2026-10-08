// API client for the GP Bikes backend.
// In production (Electron / hosted), the React app and API share an origin,
// so relative '/api' works. In Vite dev, requests are proxied to :3000.

import { AppData } from './types';

const BASE = '/api';

type Collection = keyof AppData;

export async function fetchAllData(): Promise<AppData> {
  const res = await fetch(`${BASE}/data`);
  if (!res.ok) throw new Error('Failed to load data');
  return res.json();
}

export async function saveCollection<K extends Collection>(name: K, data: AppData[K]): Promise<void> {
  const res = await fetch(`${BASE}/${name}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to save ${name}`);
}

export async function resetServerData(): Promise<AppData> {
  await fetch(`${BASE}/data/reset`, { method: 'POST' });
  return fetchAllData();
}

export async function health(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
