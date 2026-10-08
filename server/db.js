// SQLite database layer for GP Bikes Command Center
// Stores all data in a single file. Each "collection" is a JSON blob row,
// which keeps the server simple while giving us a real shared, persistent store.

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Data directory: use env override (set by Electron to userData), else local ./data
const DATA_DIR = process.env.GPBIKES_DATA_DIR || path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = path.join(DATA_DIR, 'gpbikes.db');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

// Single key/value table — one row per collection, value is JSON text.
db.exec(`
  CREATE TABLE IF NOT EXISTS collections (
    name TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

const COLLECTIONS = [
  'motorcycles', 'parts', 'suppliers', 'shipments',
  'purchaseOrders', 'vault', 'documents', 'warehouses', 'activity',
];

export function getCollection(name) {
  const row = db.prepare('SELECT data FROM collections WHERE name = ?').get(name);
  return row ? JSON.parse(row.data) : [];
}

export function setCollection(name, data) {
  db.prepare(`
    INSERT INTO collections (name, data, updated_at) VALUES (?, ?, ?)
    ON CONFLICT(name) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at
  `).run(name, JSON.stringify(data), new Date().toISOString());
}

export function getAllData() {
  const result = {};
  for (const name of COLLECTIONS) result[name] = getCollection(name);
  return result;
}

export function replaceAllData(allData) {
  const tx = db.transaction((d) => {
    for (const name of COLLECTIONS) {
      if (d[name] !== undefined) setCollection(name, d[name]);
    }
  });
  tx(allData);
}

export function isSeeded() {
  const row = db.prepare('SELECT COUNT(*) as c FROM collections').get();
  return row.c > 0;
}

export { COLLECTIONS, DB_PATH, DATA_DIR };
