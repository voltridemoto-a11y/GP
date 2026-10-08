// Electron main process — GP Bikes Command Center desktop host.
// Starts the Express server, optionally launches a Cloudflare Tunnel to
// gpworkshop.works, and shows a small control window + system tray.

const { app, BrowserWindow, Tray, Menu, shell, nativeImage, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const os = require('os');

let serverProcess = null;
let tunnelProcess = null;
let tray = null;
let win = null;

const PORT = 3000;
const isDev = !app.isPackaged;

// Where the server + dist live (packaged vs dev)
const appRoot = isDev ? path.join(__dirname, '..') : process.resourcesPath;

// Persist the DB in the OS user-data dir so updates don't wipe data
const dataDir = path.join(app.getPath('userData'), 'data');

function getLanIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
  return 'localhost';
}

function startServer() {
  const serverEntry = path.join(appRoot, 'server', 'index.js');
  serverProcess = spawn(process.execPath, [serverEntry], {
    env: {
      ...process.env,
      PORT: String(PORT),
      GPBIKES_DATA_DIR: dataDir,
      ELECTRON_RUN_AS_NODE: '1', // run the bundled node, not another Electron window
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  serverProcess.stdout.on('data', d => console.log('[server]', d.toString().trim()));
  serverProcess.stderr.on('data', d => console.error('[server]', d.toString().trim()));
}

// Cloudflare Tunnel: reads a token from env or a config file.
// Users paste their tunnel token into Settings; we store it and start cloudflared.
function startTunnel() {
  const token = process.env.CLOUDFLARE_TUNNEL_TOKEN;
  if (!token) {
    console.log('[tunnel] No CLOUDFLARE_TUNNEL_TOKEN set — skipping tunnel. App still runs on LAN.');
    return;
  }
  // cloudflared must be installed and on PATH (or bundled alongside the app)
  const bin = process.platform === 'win32' ? 'cloudflared.exe' : 'cloudflared';
  tunnelProcess = spawn(bin, ['tunnel', 'run', '--token', token], { stdio: ['ignore', 'pipe', 'pipe'] });
  tunnelProcess.stdout.on('data', d => console.log('[tunnel]', d.toString().trim()));
  tunnelProcess.stderr.on('data', d => console.log('[tunnel]', d.toString().trim()));
  tunnelProcess.on('error', () => {
    console.error('[tunnel] cloudflared not found. Install it or disable the tunnel.');
  });
}

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: '#030712',
    title: 'GP Bikes Command Center',
    webPreferences: { contextIsolation: true },
  });
  win.loadURL(`http://localhost:${PORT}`);
  win.on('close', (e) => {
    // Minimize to tray instead of quitting so the server keeps running
    if (!app.isQuitting) {
      e.preventDefault();
      win.hide();
    }
  });
}

function createTray() {
  // 1x1 transparent fallback icon if asset missing
  let icon;
  try {
    icon = nativeImage.createFromPath(path.join(appRoot, 'build', 'icon.png'));
    if (icon.isEmpty()) throw new Error('empty');
  } catch {
    icon = nativeImage.createEmpty();
  }
  tray = new Tray(icon);
  const lanIp = getLanIp();
  const contextMenu = Menu.buildFromTemplate([
    { label: 'GP Bikes Command Center', enabled: false },
    { type: 'separator' },
    { label: 'Open App Window', click: () => { win.show(); win.focus(); } },
    { label: `Open in Browser (http://${lanIp}:${PORT})`, click: () => shell.openExternal(`http://${lanIp}:${PORT}`) },
    { label: 'Copy Network Address', click: () => require('electron').clipboard.writeText(`http://${lanIp}:${PORT}`) },
    { type: 'separator' },
    { label: 'Quit (stops server)', click: () => { app.isQuitting = true; app.quit(); } },
  ]);
  tray.setToolTip('GP Bikes Command Center — running');
  tray.setContextMenu(contextMenu);
}

app.whenReady().then(() => {
  startServer();
  startTunnel();
  // Give the server a moment to bind the port before loading the window
  setTimeout(() => { createWindow(); createTray(); }, 1200);
});

app.on('before-quit', () => {
  app.isQuitting = true;
  if (serverProcess) serverProcess.kill();
  if (tunnelProcess) tunnelProcess.kill();
});

app.on('window-all-closed', () => { /* keep running in tray */ });
