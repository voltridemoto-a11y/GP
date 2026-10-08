// GP Bikes Command Center — Express API + static file server
// Serves the built React app and provides a REST API backed by SQLite.

import express from 'express';
import cors from 'cors';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { getAllData, getCollection, setCollection, replaceAllData, isSeeded, COLLECTIONS, DB_PATH } from './db.js';
import { seed } from './seed.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

// Seed the database on first run
if (!isSeeded()) {
  console.log('[GPBikes] Fresh database — loading seed data.');
  replaceAllData(seed);
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '25mb' })); // large limit for base64 photos

// ─── API ────────────────────────────────────────────────────────────

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, db: DB_PATH, time: new Date().toISOString() });
});

// Get all data at once (used on app load)
app.get('/api/data', (req, res) => {
  res.json(getAllData());
});

// Get one collection
app.get('/api/:collection', (req, res) => {
  const { collection } = req.params;
  if (!COLLECTIONS.includes(collection)) return res.status(404).json({ error: 'Unknown collection' });
  res.json(getCollection(collection));
});

// Replace an entire collection (the frontend sends the full array after any change)
app.put('/api/:collection', (req, res) => {
  const { collection } = req.params;
  if (!COLLECTIONS.includes(collection)) return res.status(404).json({ error: 'Unknown collection' });
  if (!Array.isArray(req.body)) return res.status(400).json({ error: 'Body must be an array' });
  setCollection(collection, req.body);
  res.json({ ok: true, count: req.body.length });
});

// Bulk replace everything (used for reset / import)
app.put('/api/data/all', (req, res) => {
  replaceAllData(req.body);
  res.json({ ok: true });
});

// Reset to seed
app.post('/api/data/reset', (req, res) => {
  replaceAllData(seed);
  res.json({ ok: true });
});

// ─── Static frontend ────────────────────────────────────────────────
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// SPA fallback — any non-API route serves index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// ─── Start ──────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  const nets = os.networkInterfaces();
  let lanIp = 'localhost';
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) { lanIp = net.address; break; }
    }
  }
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║   GP BIKES COMMAND CENTER — SERVER ONLINE      ║');
  console.log('╠══════════════════════════════════════════════╣');
  console.log(`║  Local:    http://localhost:${PORT}`);
  console.log(`║  Network:  http://${lanIp}:${PORT}`);
  console.log(`║  Database: ${DB_PATH}`);
  console.log('╚══════════════════════════════════════════════╝\n');
});
