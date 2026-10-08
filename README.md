# GP Bikes Command Center

A self-hosted operations & warehouse management system for GP Bikes.
React + TypeScript frontend, Express + SQLite backend, packaged as a desktop app
you run on one computer. Everyone on your network (or the internet, via Cloudflare
Tunnel) uses it from a browser — all sharing one live database.

---

## What's in here

```
src/            React frontend (the UI)
server/         Express API + SQLite database
electron/       Desktop wrapper (makes the .exe)
dist/           Built frontend (created by `npm run build`)
data/           SQLite database file lives here (gpbikes.db)
```

---

## Running it in different ways

### 1. Development (two terminals, for editing)
```bash
npm run server     # terminal 1 — API on :3000
npm run dev        # terminal 2 — Vite UI on :5173 (proxies /api to :3000)
```
Open http://localhost:5173

### 2. Production on this computer (one command)
```bash
npm run start      # builds the UI, then serves everything on :3000
```
Open http://localhost:3000
Everyone on your WiFi can open `http://YOUR-IP:3000` (shown in the server banner).

### 3. Desktop app (double-click experience)
```bash
npm run app        # builds + launches the Electron window
```
Runs in a window with a system-tray icon. Closing the window keeps the server
running in the tray so your team stays connected.

### 4. Build the installer (.exe for Windows / .dmg for Mac)
**On Windows:**
```bash
npm run dist:win   # produces an .exe installer in dist-electron/
```
**On Mac:**
```bash
npm run dist:mac   # produces a .dmg
```
> The Windows `.exe` must be built on a Windows machine (or a Windows VM).
> electron-builder cannot cross-compile a Windows installer from macOS reliably.

---

## Multi-user: how shared data works

- The SQLite database (`data/gpbikes.db`) is the single source of truth.
- Every change any user makes is saved to the server immediately.
- When another user refreshes, they see the latest data.
- **Back up** by copying `gpbikes.db`. Restore by copying it back.
- In the packaged desktop app, the database lives in your OS user-data folder
  so app updates never erase it.

---

## Hosting on gpworkshop.works via Cloudflare Tunnel (free, no static IP needed)

This lets your team reach the app at `https://gpworkshop.works` from anywhere,
while it runs on your own computer.

### One-time setup

1. **Install cloudflared** (the tunnel client):
   - Windows: download from
     https://github.com/cloudflare/cloudflared/releases (get `cloudflared-windows-amd64.exe`,
     rename to `cloudflared.exe`, put it somewhere on your PATH)
   - Mac: `brew install cloudflared`

2. **Log in to Cloudflare** (opens a browser):
   ```bash
   cloudflared tunnel login
   ```
   Pick `gpworkshop.works` when prompted.

3. **Create a tunnel:**
   ```bash
   cloudflared tunnel create gpbikes
   ```
   This prints a Tunnel ID and saves a credentials file.

4. **Route your domain to the tunnel:**
   ```bash
   cloudflared tunnel route dns gpbikes gpworkshop.works
   ```

5. **Point the tunnel at the local app.** Create a config file:
   - Windows: `C:\Users\<you>\.cloudflared\config.yml`
   - Mac: `~/.cloudflared/config.yml`
   ```yaml
   tunnel: gpbikes
   credentials-file: /full/path/to/<TUNNEL_ID>.json
   ingress:
     - hostname: gpworkshop.works
       service: http://localhost:3000
     - service: http_status:404
   ```

### Running it

Start the app, then start the tunnel:
```bash
npm run start
```
In a second terminal:
```bash
cloudflared tunnel run gpbikes
```
Now visit **https://gpworkshop.works** from any device, anywhere.
Cloudflare provides the HTTPS certificate automatically.

> **Auto-start option:** The Electron app can launch the tunnel for you if you set
> a `CLOUDFLARE_TUNNEL_TOKEN` environment variable (from a token-based tunnel created
> in the Cloudflare Zero Trust dashboard). See `electron/main.js` → `startTunnel()`.

---

## Keeping it running 24/7

- **Simplest:** leave the computer on with `npm run start` (or the desktop app) and
  `cloudflared tunnel run gpbikes` running.
- **Windows service:** install cloudflared as a service so the tunnel auto-starts:
  ```bash
  cloudflared service install
  ```
- **Auto-start the app:** add a shortcut to the built `.exe` in your Windows
  Startup folder (`shell:startup`).

---

## Security notes

- The Company Vault encodes passwords before storing them (not plaintext).
  For a hardened deployment, move to a real secrets manager and add per-user logins.
- Cloudflare Access (free tier) can put a login wall in front of
  `gpworkshop.works` so only approved emails can reach the app — strongly
  recommended since the vault holds credentials.
- Always keep a backup copy of `gpbikes.db`.
